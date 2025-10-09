# file: app/api/news.py
import asyncio
import hashlib
import json
from collections import deque
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional

import aiohttp
import feedparser
from bs4 import BeautifulSoup
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from fastapi.responses import JSONResponse

router = APIRouter()

# --- CONFIG ---
FETCH_INTERVAL_SECONDS = 25  # how often to poll RSS / sites
MAX_ITEMS = 200
RSS_SOURCES = [
    # RSS feeds useful for commodity/energy news (expand as needed)
    "https://www.reutersagency.com/feed/?best-topics=commodities&post_type=best",  # example (may vary)
    "https://feeds.reuters.com/reuters/commoditiesNews",
    "https://www.bloomberg.com/feed/podcast/etf-report.xml",  # placeholder - replace with real feed URL
    "https://www.eia.gov/rss/pressreleases.xml",  # EIA press release RSS
    # Add more vendor RSS feeds here (EnergyWire, Platts, Argus, etc.)
]
# Optionally you can add direct site URLs to scrape if a site doesn't provide RSS
DIRECT_SITES: List[str] = [
    # "https://some-site.com/latest-news"
    "https://www.livemint.com/market/commodities"
]

# --- Helpers & state ---
@dataclass
class NewsItem:
    id: str
    headline: str
    source: str
    ts: str  # ISO
    summary: Optional[str] = None
    sentiment: Optional[str] = None  # 'positive'|'neutral'|'negative'
    tickers: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    url: Optional[str] = None

# In-memory rolling buffer
_items: deque = deque(maxlen=MAX_ITEMS)
_seen_ids: set = set()

# WebSocket connection manager for /ws/news
class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active.append(websocket)

    def disconnect(self, websocket: WebSocket):
        try:
            self.active.remove(websocket)
        except ValueError:
            pass

    async def broadcast(self, message: Dict):
        dead: List[WebSocket] = []
        data = json.dumps(message, default=str)
        for ws in list(self.active):
            try:
                await ws.send_text(data)
            except Exception:
                dead.append(ws)
        # clean up dead
        for d in dead:
            self.disconnect(d)

news_ws_manager = ConnectionManager()

# --- Simple utilities ---
POS_WORDS = {"gain", "rise", "surge", "higher", "up", "beat", "outperform", "strong", "tighten"}
NEG_WORDS = {"fall", "drop", "decline", "slip", "lower", "down", "miss", "weaker", "loose", "draw"}

TICKER_CANDIDATES = ["NG", "WTI", "Brent", "JKM", "TTF", "Gold", "Silver", "Copper"]


def _mk_id(url: Optional[str], title: str) -> str:
    base = (url or "") + "|" + (title or "")
    return hashlib.sha256(base.encode("utf-8")).hexdigest()


def _to_iso_struct(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()


def _heuristic_sentiment(text: str) -> str:
    txt = (text or "").lower()
    p = sum(1 for w in POS_WORDS if w in txt)
    n = sum(1 for w in NEG_WORDS if w in txt)
    if p > n:
        return "positive"
    if n > p:
        return "negative"
    return "neutral"


def _extract_summary_from_html(html: str, max_chars: int = 300) -> str:
    if not html:
        return ""
    soup = BeautifulSoup(html, "lxml")
    # take the first few <p> elements that have text
    paragraphs = [p.get_text(" ", strip=True) for p in soup.find_all("p") if p.get_text(strip=True)]
    if not paragraphs:
        text = soup.get_text(" ", strip=True)
        return (text[:max_chars] + "...") if len(text) > max_chars else text
    text = " ".join(paragraphs[:3])
    return (text[:max_chars] + "...") if len(text) > max_chars else text


def _extract_tickers(title: str) -> List[str]:
    found = []
    for cand in TICKER_CANDIDATES:
        if cand.lower() in (title or "").lower():
            found.append(cand)
    return found


async def _fetch_html(session: aiohttp.ClientSession, url: str, timeout: int = 12) -> Optional[str]:
    try:
        async with session.get(url, timeout=timeout, headers={"User-Agent": "Oriza-NewsBot/1.0"}) as resp:
            if resp.status != 200:
                return None
            return await resp.text()
    except Exception:
        return None


async def _process_rss_feed(session: aiohttp.ClientSession, feed_url: str) -> List[NewsItem]:
    results: List[NewsItem] = []
    try:
        # feedparser supports passing data string; fetch raw text first to avoid blocking sync download
        async with session.get(feed_url, timeout=15, headers={"User-Agent": "Oriza-NewsBot/1.0"}) as resp:
            if resp.status != 200:
                return []
            raw = await resp.text()
    except Exception:
        return []

    parsed = feedparser.parse(raw)
    for entry in parsed.entries[:40]:
        title = entry.get("title", "") or ""
        link = entry.get("link", None)
        published = entry.get("published_parsed") or entry.get("updated_parsed")
        if published:
            dt = datetime(*published[:6], tzinfo=timezone.utc)
        else:
            dt = datetime.now(timezone.utc)
        # summary field may contain HTML; if it's short use it
        summary_html = entry.get("summary", "") or entry.get("description", "") or ""
        summary = _extract_summary_from_html(summary_html)
        nid = _mk_id(link, title)
        if nid in _seen_ids:
            continue
        # if no summary, attempt to fetch article HTML and extract summary
        if not summary and link:
            html = await _fetch_html(session, link)
            if html:
                summary = _extract_summary_from_html(html)
        item = NewsItem(
            id=nid,
            headline=title,
            source=(entry.get("source", {}).get("title") if entry.get("source") else parsed.feed.get("title", feed_url)),
            ts=_to_iso_struct(dt),
            summary=summary,
            sentiment=_heuristic_sentiment(title + " " + (summary or "")),
            tickers=_extract_tickers(title),
            tags=[tag.get("term") for tag in entry.get("tags", [])] if entry.get("tags") else [],
            url=link,
        )
        results.append(item)
    return results


async def _process_direct_site(session: aiohttp.ClientSession, url: str) -> List[NewsItem]:
    # Minimal direct scraping — site-specific spider is better in prod
    html = await _fetch_html(session, url)
    if not html:
        return []
    soup = BeautifulSoup(html, "lxml")
    items: List[NewsItem] = []
    # try to find article-like elements
    news = soup.find_all('h2')
    for i in news:
    # print(i)
        news_text, news_link = i.get_text(), url+i.a['href']
        # print(news_text, news_link)
        news_list = {
            "news" : news_text,
            "link" : news_link,
            "source" : "mint"
        }
    print("Fetched News:", news_list)
    return news_list


# --- Core periodic job ---
async def _fetch_and_publish_loop(shutdown_event: asyncio.Event):
    """
    Periodically poll feeds and direct sites. New items are prepended to _items deque.
    Broadcasts a {type: 'batch', items: [...] } message to websocket clients when new items are found.
    """
    async with aiohttp.ClientSession() as session:
        while not shutdown_event.is_set():
            new_items: List[NewsItem] = []
            # fetch RSS feeds
            for feed in RSS_SOURCES:
                try:
                    entries = await _process_rss_feed(session, feed)
                    for e in entries:
                        if e.id in _seen_ids:
                            continue
                        _seen_ids.add(e.id)
                        _items.appendleft(e)
                        new_items.append(e)
                except Exception:
                    # per-feed errors should not break the loop
                    continue

            # direct sites (optional)
            for site in DIRECT_SITES:
                try:
                    entries = await _process_direct_site(session, site)
                    for e in entries:
                        if e.id in _seen_ids:
                            continue
                        _seen_ids.add(e.id)
                        _items.appendleft(e)
                        new_items.append(e)
                except Exception:
                    continue

            # If we have new items, broadcast them
            if new_items:
                # trim to MAX_ITEMS (deque handles it)
                payload = {"type": "batch", "items": [asdict(i) for i in new_items]}
                await news_ws_manager.broadcast(payload)

            # sleep but wake earlier if shutdown requested
            try:
                await asyncio.wait_for(shutdown_event.wait(), timeout=FETCH_INTERVAL_SECONDS)
            except asyncio.TimeoutError:
                continue


# Background task handle
_fetch_task: Optional[asyncio.Task] = None
_shutdown_event: Optional[asyncio.Event] = None


# --- FastAPI lifecycle hooks to start/stop the periodic fetcher ---
@router.on_event("startup")
async def startup_news_loop():
    global _fetch_task, _shutdown_event
    if _fetch_task is not None and not _fetch_task.done():
        return
    _shutdown_event = asyncio.Event()
    _fetch_task = asyncio.create_task(_fetch_and_publish_loop(_shutdown_event))


@router.on_event("shutdown")
async def shutdown_news_loop():
    global _fetch_task, _shutdown_event
    if _shutdown_event:
        _shutdown_event.set()
    if _fetch_task:
        try:
            await _fetch_task
        except asyncio.CancelledError:
            pass
        _fetch_task = None
        _shutdown_event = None


# --- HTTP & WS endpoints ---
@router.get("/news")
async def get_news():
    """
    Returns the current rolling buffer of news items.
    """
    return JSONResponse([asdict(i) for i in list(_items)])


@router.websocket("/ws/news")
async def ws_news(websocket: WebSocket):
    """
    WebSocket endpoint for NewsPanel.
    - On connect: sends {"type":"init","items":[...]}
    - Afterwards: server sends {"type":"batch","items":[...]} for new items
    """
    await news_ws_manager.connect(websocket)
    try:
        # send init snapshot
        snapshot = list(_items)
        await websocket.send_text(json.dumps({"type": "init", "items": [asdict(i) for i in snapshot]}, default=str))
        # keep the socket open; clients do not need to send messages
        while True:
            try:
                msg = await websocket.receive_text()
                # support simple ping/pong from client
                if msg.lower() in ("ping", "keepalive"):
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except WebSocketDisconnect:
                break
            except Exception:
                # ignore malformed messages
                continue
    finally:
        news_ws_manager.disconnect(websocket)
