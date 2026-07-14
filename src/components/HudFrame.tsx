import type { ReactNode } from "react";

type HudFrameProps = {
  children: ReactNode;
  color?: "cyan" | "magenta" | "signal" | "static";
  className?: string;
};

const colorClass: Record<NonNullable<HudFrameProps["color"]>, string> = {
  cyan: "text-cyan",
  magenta: "text-magenta",
  signal: "text-signal",
  static: "text-static",
};

export function HudFrame({ children, color = "cyan", className = "" }: HudFrameProps) {
  return (
    <div className={`hud-frame ${colorClass[color]} ${className}`}>
      <span className="hud-corner-tr" />
      <span className="hud-corner-bl" />
      {children}
    </div>
  );
}
