// file: components/NewsPanel.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  LucideProps,
  Search,
  X,
  ChevronRight,
} from "lucide-react";

type NewsItem = {
  id: string;
  headline: string;
  source: string;
  ts: string; // ISO
  summary?: string;
  sentiment?: "positive" | "neutral" | "negative";
  tickers?: string[];
  tags?: string[];
  url?: string;
};

const MAX_ITEMS = 200;

/** Safe timeAgo */
function timeAgo(iso?: string) {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = Math.floor((Date.now() - t) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

/** Resolve WS URL at runtime safely. */
const getWsUrl = () => {
  if (typeof window === "undefined") {
    // Return a default for server-side rendering
    return "ws://localhost:8000/ws/news";
  }

  // Use dynamic origin to support different environments (dev/prod)
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : "";
  
  // The endpoint path is always /ws/news
  return `${protocol}://${hostname}${port}/ws/news`;
};

// Example usage in your WebSocket client
const ws = new WebSocket(getWsUrl());

function SentimentPill({ s }: { s?: NewsItem["sentiment"] }) {
  if (s === "positive")
    return (
      <span className="text-xs font-medium text-emerald-300 bg-emerald-900/20 px-2 py-1 rounded">
        ▲ Positive
      </span>
    );
  if (s === "negative")
    return (
      <span className="text-xs font-medium text-rose-300 bg-rose-900/20 px-2 py-1 rounded">
        ▼ Negative
      </span>
    );
  return (
    <span className="text-xs font-medium text-slate-300 bg-slate-800/30 px-2 py-1 rounded">
      — Neutral
    </span>
  );
}

/** Hook: WebSocket connection with reconnection/backoff.
 *  Also exposes connectionStatus for quick debugging in UI.
 */
function useNewsSocket(initial: NewsItem[] = []) {
  const [items, setItems] = useState<NewsItem[]>(initial);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "open" | "closed" | "error">(
    "idle"
  );
  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef<number>(1000);
  const shouldReconnect = useRef(true);

  useEffect(() => {
    shouldReconnect.current = true;
    const WS_URL = getWsUrl();

    function connect() {
      try {
        if (typeof WebSocket === "undefined") {
          console.warn("WebSocket not supported in this environment.");
          setConnectionStatus("error");
          return;
        }

        setConnectionStatus("connecting");
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.addEventListener("open", () => {
          console.log("news ws open", WS_URL);
          backoffRef.current = 1000;
          setConnectionStatus("open");
        });

        ws.addEventListener("message", (ev) => {
          try {
            const raw = ev.data;
            let msg: any = null;
            if (typeof raw === "string") {
              msg = JSON.parse(raw);
            } else {
              // ignore binary for now
              return;
            }
            if (!msg) return;
            if (msg.type === "init") {
              const uniq: Record<string, NewsItem> = {};
              (Array.isArray(msg.items) ? msg.items : []).forEach((it: NewsItem) => {
                if (it && it.id) uniq[it.id] = it;
              });
              const arr = Object.values(uniq).slice(0, MAX_ITEMS);
              setItems(arr);
            } else if (msg.type === "batch") {
              setItems((prev) => {
                const existing = new Set(prev.map((p) => p.id));
                const incoming: NewsItem[] = (Array.isArray(msg.items) ? msg.items : []).filter(
                  (i: NewsItem) => i && i.id && !existing.has(i.id)
                );
                const merged = [...incoming, ...prev].slice(0, MAX_ITEMS);
                return merged;
              });
            }
          } catch (e) {
            console.error("ws message parse error", e);
          }
        });

        ws.addEventListener("close", (ev) => {
          console.log("news ws closed", ev);
          setConnectionStatus("closed");
          if (shouldReconnect.current) {
            const delay = backoffRef.current;
            backoffRef.current = Math.min(Math.floor(backoffRef.current * 1.5), 30_000);
            setTimeout(connect, delay);
          }
        });

        ws.addEventListener("error", (err) => {
          console.warn("news ws error", err);
          setConnectionStatus("error");
          try {
            ws.close();
          } catch {}
        });
      } catch (e) {
        console.error("failed to create websocket", e);
        setConnectionStatus("error");
        if (shouldReconnect.current) {
          setTimeout(connect, backoffRef.current);
          backoffRef.current = Math.min(Math.floor(backoffRef.current * 1.5), 30_000);
        }
      }
    }

    connect();

    return () => {
      shouldReconnect.current = false;
      try {
        wsRef.current?.close();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, setItems, wsRef, connectionStatus } as const;
}

export default function NewsPanel() {
  const { items, setItems, connectionStatus } = useNewsSocket([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // set initial selected when items change
  useEffect(() => {
    if (!selectedId && items.length > 0) setSelectedId(items[0].id);
  }, [items, selectedId]);

  // keyboard navigation: j/k to move, enter to open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (["INPUT", "TEXTAREA"].includes((document.activeElement?.tagName || "").toUpperCase())) return;
      if (e.key === "j") {
        setSelectedId((cur) => {
          const idx = items.findIndex((x) => x.id === cur);
          const next = items[Math.min(idx + 1, items.length - 1)]?.id;
          scrollToItem(next);
          return next ?? cur;
        });
      } else if (e.key === "k") {
        setSelectedId((cur) => {
          const idx = items.findIndex((x) => x.id === cur);
          const prev = items[Math.max(idx - 1, 0)]?.id;
          scrollToItem(prev);
          return prev ?? cur;
        });
      } else if (e.key === "Enter") {
        const active = items.find((it) => it.id === selectedId);
        if (active) window.open(active.url || "#", "_blank");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, selectedId]);

  function scrollToItem(id?: string | null) {
    if (!id || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-id='${id}']`) as HTMLElement | null;
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  const filtered = useMemo(() => {
    let out = items;
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      out = out.filter(
        (it) =>
          it.headline.toLowerCase().includes(q) ||
          (it.summary || "").toLowerCase().includes(q) ||
          it.source.toLowerCase().includes(q) ||
          (it.tickers || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    if (onlyAlerts) {
      out = out.filter((it) => (it.tickers || []).length > 0 && it.sentiment !== "neutral");
    }
    return out;
  }, [items, filterQuery, onlyAlerts]);

  const selected = items.find((it) => it.id === selectedId) ?? items[0];

  return (
    <div className="h-full flex flex-col bg-[#0b0f14] text-slate-200">
      {/* Top ticker / header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-[#061017]">
        <div className="flex items-center space-x-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Oriza News Panel</div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-900/40 px-3 py-1 rounded text-sm text-slate-300 space-x-2">
            <Search className="w-4 h-4" />
            <input
              placeholder="Search headlines, tickers, sources..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="bg-transparent outline-none text-sm placeholder-slate-500 w-72"
            />
            {filterQuery && (
              <button onClick={() => setFilterQuery("")} className="ml-2">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400">
            Updated {new Date().toLocaleTimeString()} • WS:{" "}
            <span className="uppercase">{connectionStatus}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 grid grid-cols-12 gap-4 px-4 py-4">
        <div className="col-span-12">
          <div
            className="bg-[#071019] border border-slate-800 rounded flex flex-col overflow-hidden"
            style={{ height: "760px" }}
          >
            {/* Header (fixed) */}
            <div className="px-3 py-2 border-b border-slate-800/40 flex items-center justify-between">
              <div className="text-sm text-slate-400">Latest Headlines {items.length}</div>

              <div className="flex items-center gap-4">
                <div className="text-xs text-slate-500">
                  {items.filter((i) => i.sentiment === "positive").length} Positive
                </div>
                <div className="text-xs text-slate-500">
                  {items.filter((i) => i.sentiment === "negative").length} Negative
                </div>
                <div className="text-xs text-slate-500">
                  {Array.from(new Set(items.map((i) => i.source))).length} Sources
                </div>
              </div>
            </div>

            {/* Scrollable list — takes remaining height */}
            <div ref={listRef} className="flex-1 overflow-auto">
              <div className="divide-y divide-slate-800">
                {filtered.map((it) => {
                  const isSelected = it.id === selectedId;
                  return (
                    <button
                      key={it.id}
                      data-id={it.id}
                      onClick={() => setSelectedId(it.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-800/30 flex items-start justify-between ${
                        isSelected ? "bg-slate-800/40 border-l-4 border-amber-500" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <h4 className="text-sm font-semibold text-white">{it.headline}</h4>
                          <div className="text-xs text-slate-400 ml-3">{timeAgo(it.ts)}</div>
                        </div>

                        <div className="mt-1 flex items-center gap-3">
                          <div className="text-xs text-slate-400">{it.source}</div>
                          <div>
                            <SentimentPill s={it.sentiment} />
                          </div>
                          <div className="text-xs text-slate-400">
                            {it.tickers?.map((t) => (
                              <span key={t} className="px-2 py-0.5 mr-1 rounded bg-slate-800/20 text-xs">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-slate-300 line-clamp-2">{it.summary}</div>
                      </div>

                      <div className="ml-4 flex flex-col items-end text-xs text-slate-400">
                        <div>{it.tags?.map((tg) => <span key={tg} className="mr-1">#{tg}</span>)}</div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </button>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="p-6 text-sm text-slate-400">No headlines yet — waiting for feed...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
