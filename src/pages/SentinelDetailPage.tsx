import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HudFrame } from "../components/HudFrame";
import { PriceChart } from "../components/PriceChart";
import { RadarSweep } from "../components/RadarSweep";
import {
  getSentinel,
  getSentinelHistory,
  getSentinelNotifications,
  checkNow,
  setSentinelActive,
  deleteSentinel,
} from "../lib/api";
import { formatCents, formatDateTime, formatRelativeTime } from "../lib/format";

export function SentinelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const productQuery = useQuery({
    queryKey: ["sentinel", id],
    queryFn: () => getSentinel(id!),
    enabled: Boolean(id),
    refetchInterval: 15_000,
  });

  const historyQuery = useQuery({
    queryKey: ["sentinel", id, "history"],
    queryFn: () => getSentinelHistory(id!),
    enabled: Boolean(id),
    refetchInterval: 15_000,
  });

  const notificationsQuery = useQuery({
    queryKey: ["sentinel", id, "notifications"],
    queryFn: () => getSentinelNotifications(id!),
    enabled: Boolean(id),
  });

  const invalidateProduct = () => {
    queryClient.invalidateQueries({ queryKey: ["sentinel", id] });
    queryClient.invalidateQueries({ queryKey: ["sentinels"] });
  };

  const checkNowMutation = useMutation({
    mutationFn: () => checkNow(id!),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (isActive: boolean) => setSentinelActive(id!, isActive),
    onSuccess: invalidateProduct,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSentinel(id!),
    onSuccess: () => navigate("/"),
  });

  if (productQuery.isLoading) {
    return <RadarSweep label="carregando sentinela..." />;
  }

  const product = productQuery.data;
  if (!product) {
    return (
      <div className="p-8 text-center font-mono text-sm text-static">
        Sentinela não encontrada. <Link to="/" className="text-cyan">Voltar</Link>
      </div>
    );
  }

  const history = historyQuery.data ?? [];
  const notifications = notificationsQuery.data ?? [];
  const breached =
    product.currentPriceCents !== null && product.currentPriceCents <= product.targetPriceCents;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Link to="/" className="font-mono text-xs uppercase tracking-widest text-static hover:text-cyan">
        ← todas as sentinelas
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{product.name}</h1>
          <a
            href={product.url}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-static hover:text-cyan"
          >
            {product.domain}
          </a>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => checkNowMutation.mutate()}
            disabled={checkNowMutation.isPending}
            className="rounded border border-cyan px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-cyan hover:bg-cyan/10 disabled:opacity-50"
          >
            {checkNowMutation.isPending ? "Enfileirando..." : "Checar agora"}
          </button>
          <button
            onClick={() => toggleActiveMutation.mutate(!product.isActive)}
            className="rounded border border-static/40 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-static hover:text-ink"
          >
            {product.isActive ? "Pausar" : "Retomar"}
          </button>
          <button
            onClick={() => {
              if (confirm("Remover esta sentinela?")) deleteMutation.mutate();
            }}
            className="rounded border border-magenta/40 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-magenta hover:bg-magenta/10"
          >
            Remover
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <HudFrame color={breached ? "magenta" : "cyan"} className="bg-panel/60 p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-static">preço atual</p>
          <p className="mt-1 font-mono text-xl font-semibold text-ink">
            {formatCents(product.currentPriceCents, product.currency)}
          </p>
        </HudFrame>
        <HudFrame color="static" className="bg-panel/60 p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-static">preço-alvo</p>
          <p className="mt-1 font-mono text-xl font-semibold text-ink">
            {formatCents(product.targetPriceCents, product.currency)}
          </p>
        </HudFrame>
        <HudFrame color="signal" className="bg-panel/60 p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-static">última checagem</p>
          <p className="mt-1 font-mono text-xl font-semibold text-ink">
            {formatRelativeTime(product.lastCheckedAt)}
          </p>
        </HudFrame>
      </div>

      <HudFrame color="cyan" className="mt-6 bg-panel/40 p-5">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-ink">
          Histórico de preço
        </h2>
        {history.length > 0 ? (
          <PriceChart history={history} targetPriceCents={product.targetPriceCents} currency={product.currency} />
        ) : (
          <p className="py-8 text-center font-mono text-xs text-static">
            ainda sem dados — clique em "checar agora"
          </p>
        )}
      </HudFrame>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HudFrame color="static" className="bg-panel/40 p-5">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-ink">
            Log de verificações
          </h2>
          <div className="max-h-64 overflow-y-auto font-mono text-xs">
            {history.length === 0 && <p className="text-static">sem registros ainda</p>}
            {[...history].reverse().map((check) => (
              <div
                key={check.id}
                className="flex justify-between border-b border-static/10 py-1.5 last:border-0"
              >
                <span className="text-static">{formatDateTime(check.checkedAt)}</span>
                <span className={check.success ? "text-ink" : "text-magenta"}>
                  {check.success ? formatCents(check.priceCents, product.currency) : check.errorMessage}
                </span>
              </div>
            ))}
          </div>
        </HudFrame>

        <HudFrame color="static" className="bg-panel/40 p-5">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-ink">
            Notificações
          </h2>
          <div className="max-h-64 overflow-y-auto font-mono text-xs">
            {notifications.length === 0 && <p className="text-static">nenhum breach disparado ainda</p>}
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex justify-between border-b border-static/10 py-1.5 last:border-0"
              >
                <span className="text-static">{formatDateTime(notification.createdAt)}</span>
                <span className="text-magenta">{formatCents(notification.priceCents, product.currency)}</span>
                <span className="text-static uppercase">{notification.status}</span>
              </div>
            ))}
          </div>
        </HudFrame>
      </div>
    </div>
  );
}
