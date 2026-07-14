type StatusBarProps = {
  userEmail: string;
  activeCount: number;
  breachCount: number;
  onLogout: () => void;
};

export function StatusBar({ userEmail, activeCount, breachCount, onLogout }: StatusBarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-cyan/20 bg-void/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 animate-blink rounded-full bg-signal shadow-glow-signal" />
          <h1 className="font-display text-xl font-bold tracking-wide text-ink">
            PRICE<span className="text-cyan">SENTRY</span>
          </h1>
        </div>

        <div className="hidden items-center gap-8 font-mono text-xs uppercase tracking-widest text-static sm:flex">
          <span>
            <span className="text-signal">{activeCount}</span> sentinelas ativas
          </span>
          <span>
            <span className={breachCount > 0 ? "text-magenta" : "text-static"}>{breachCount}</span> breaches
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-xs text-static md:inline">{userEmail}</span>
          <button
            onClick={onLogout}
            className="rounded border border-static/40 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-static transition hover:border-magenta hover:text-magenta"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
