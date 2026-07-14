import { Link } from "react-router-dom";
import { HudFrame } from "./HudFrame";
import { formatCents, formatRelativeTime } from "../lib/format";
import type { TrackedProduct } from "../lib/api";

const statusStyles = {
  static: "bg-static shadow-none",
  magenta: "bg-magenta shadow-glow-magenta",
  signal: "bg-signal shadow-glow-signal",
} as const;

export function SentinelCard({ product }: { product: TrackedProduct }) {
  const breached =
    product.currentPriceCents !== null && product.currentPriceCents <= product.targetPriceCents;

  const statusColor: keyof typeof statusStyles = !product.isActive
    ? "static"
    : breached
      ? "magenta"
      : "signal";

  return (
    <Link to={`/sentinel/${product.id}`} className="block">
      <HudFrame
        color={breached ? "magenta" : "cyan"}
        className={`h-full bg-panel/60 p-5 transition hover:bg-panel ${
          breached ? "animate-breach" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold text-ink">{product.name}</p>
            <p className="truncate font-mono text-xs text-static">{product.domain}</p>
          </div>
          <span
            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${statusStyles[statusColor]}`}
          />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="font-mono text-2xl font-semibold text-ink">
              {formatCents(product.currentPriceCents, product.currency)}
            </p>
            <p className="font-mono text-xs text-static">
              alvo <span className="text-cyan">{formatCents(product.targetPriceCents, product.currency)}</span>
            </p>
          </div>
          {breached && (
            <span className="rounded bg-magenta/15 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-magenta">
              breach
            </span>
          )}
        </div>

        <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-static">
          {product.isActive ? formatRelativeTime(product.lastCheckedAt) : "pausada"}
        </p>
      </HudFrame>
    </Link>
  );
}
