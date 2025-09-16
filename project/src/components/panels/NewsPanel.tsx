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

const mockInitial: NewsItem[] = [
  {
    id: "n1",
    headline: "Europe LNG Imports Fall 8% as Spot Prices Spike",
    source: "EnergyWire",
    ts: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    summary:
      "LNG imports into northwest Europe fell by 8% week-on-week amid higher spot prices and limited shipping availability.",
    sentiment: "negative",
    tickers: ["JKM", "TTF"],
    tags: ["LNG", "Supply"],
    url: "#",
  },
  {
    id: "n2",
    headline: "U.S. Natural Gas Storage Below 5-yr Avg; Analysts Watch Heating Demand",
    source: "EIA/Desk",
    ts: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    summary:
      "Weekly storage reports show inventory under the five-year average ahead of winter, increasing upside risk for prices.",
    sentiment: "positive",
    tickers: ["NG"],
    tags: ["Storage", "EIA"],
    url: "#",
  },
  {
    id: "n3",
    headline: "OPEC Meeting Ends With No Change to Quotas",
    source: "Reuters",
    ts: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    summary:
      "OPEC has decided to keep current production quotas unchanged, leaving markets to trade on demand data.",
    sentiment: "neutral",
    tickers: ["WTI", "Brent"],
    tags: ["OPEC", "Policy"],
    url: "#",
  },
];

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

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

export default function NewsPanel() {
  const [items, setItems] = useState<NewsItem[]>(mockInitial);
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const [filterQuery, setFilterQuery] = useState("");
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // simulate incoming feed (replace with real WS)
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      const id = `n${now.getTime()}`;
      const n: NewsItem = {
        id,
        headline: ["Breaking: Gas shipment delayed at port", "Market edges higher on US data", "Storage build higher than expected"][
          Math.floor(Math.random() * 3)
        ],
        source: ["Desk", "Reuters", "Bloomberg"][Math.floor(Math.random() * 3)],
        ts: now.toISOString(),
        summary: "Auto-generated demo summary for incoming headline. Replace with real content.",
        sentiment: ["positive", "neutral", "negative"][Math.floor(Math.random() * 3)] as NewsItem["sentiment"],
        tickers: ["NG", "WTI"].slice(0, Math.floor(Math.random() * 2) + 1),
        tags: ["Supply", "Macro", "Weather"].slice(0, Math.floor(Math.random() * 2) + 1),
        url: "#",
      };
      setItems((s) => [n, ...s].slice(0, 200));
    }, 8000);
    return () => clearInterval(t);
  }, []);

  // keyboard navigation: j/k to move, enter to open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (["INPUT", "TEXTAREA"].includes((document.activeElement?.tagName || "").toUpperCase())) return;
      if (e.key === "j") {
        // next
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

          <div className="text-xs text-slate-400">Updated {new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 grid grid-cols-12 gap-4 px-4 py-4">
        {/* Left: filters / small stats */}
          {/* <div className="bg-[#071019] border border-slate-800 rounded p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">Filters</div>
              <div className="text-xs text-slate-500">Hotkeys: j/k</div>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={onlyAlerts} onChange={(e) => setOnlyAlerts(e.target.checked)} />
                <span className="text-slate-300">Only alerts (tickers + sentiment)</span>
              </label>

              <div className="pt-2">
                <div className="text-xs text-slate-500 uppercase">Sources</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Reuters", "Bloomberg", "EnergyWire", "EIA", "Desk"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterQuery(s)}
                      className="text-xs px-2 py-1 rounded bg-slate-800/30 hover:bg-slate-800/50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div> */}

          {/* <div className="bg-[#071019] border border-slate-800 rounded p-3">
            <div className="text-xs text-slate-400">Quick Stats</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="p-2 rounded bg-slate-900/30">
                <div className="text-xs text-slate-400">Headlines</div>
                <div className="text-lg font-semibold text-white">{items.length}</div>
              </div>
              <div className="p-2 rounded bg-slate-900/30">
                <div className="text-xs text-slate-400">Sources</div>
                <div className="text-lg font-semibold text-white">
                  {Array.from(new Set(items.map((i) => i.source))).length}
                </div>
              </div>
              <div className="p-2 rounded bg-slate-900/30">
                <div className="text-xs text-slate-400">Positive</div>
                <div className="text-lg font-semibold text-emerald-300">
                  {items.filter((i) => i.sentiment === "positive").length}
                </div>
              </div>
              <div className="p-2 rounded bg-slate-900/30">
                <div className="text-xs text-slate-400">Negative</div>
                <div className="text-lg font-semibold text-rose-300">
                  {items.filter((i) => i.sentiment === "negative").length}
                </div>
              </div>
            </div>
          </div> */}

          {/* saved searches / watchlist */}
          

        {/* Center: headline list (dense) */}
        <div className="col-span-12"> {/* use col-span-12 or simply w-full if not inside a grid */}
  <div
    className="bg-[#071019] border border-slate-800 rounded flex flex-col overflow-hidden"
    style={{ height: "760px" }} // fixed height - change to desired px (or use Tailwind like h-[560px]
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
    <div
      ref={listRef}
      className="flex-1 overflow-auto"
      // optional: pause auto-scroll on hover when you implement auto-scroll logic
      // onMouseEnter={() => setAutoScroll(false)} onMouseLeave={() => setAutoScroll(true)}
    >
      <div className="divide-y divide-slate-800">
        {filtered.map((it) => {
          const selected = it.id === selectedId;
          return (
            <button
              key={it.id}
              data-id={it.id}
              onClick={() => setSelectedId(it.id)}
              className={`w-full text-left px-4 py-3 hover:bg-slate-800/30 flex items-start justify-between ${
                selected ? "bg-slate-800/40 border-l-4 border-amber-500" : ""
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
      </div>
    </div>
  </div>
</div>

        {/* Right: expanded article preview */}

      </div>
    </div>
  );
}
