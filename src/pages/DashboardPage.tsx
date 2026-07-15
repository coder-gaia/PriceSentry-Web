import { useState } from "react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../lib/sockets";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { StatusBar } from "../components/StatusBar";
import { SentinelCard } from "../components/SentinelCard";
import { RadarSweep } from "../components/RadarSweep";
import { DeploySentinelModal } from "../components/DeploySentinelModal";
import { HudFrame } from "../components/HudFrame";
import { listSentinels } from "../lib/api";
import { useAuth } from "../context/AuthContext";


export function DashboardPage() {
  const auth = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const queryClient = useQueryClient();

useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  function handleUpdate() {
    queryClient.invalidateQueries({ queryKey: ["sentinels"] });
  }

  socket.on("sentinel:updated", handleUpdate);

  return () => {
    socket.off("sentinel:updated", handleUpdate);
  };
}, [queryClient]);

  const { data: sentinels, isLoading } = useQuery({
    queryKey: ["sentinels"],
    queryFn: listSentinels,
    refetchInterval: 15_000,
  });

  const activeCount = sentinels?.filter((s) => s.isActive).length ?? 0;
  const breachCount =
    sentinels?.filter(
      (s) => s.isActive && s.currentPriceCents !== null && s.currentPriceCents <= s.targetPriceCents,
    ).length ?? 0;

  return (
    <div>
      <StatusBar
        userEmail={auth.user?.email ?? ""}
        activeCount={activeCount}
        breachCount={breachCount}
        onLogout={auth.logout}
      />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Sentinelas</h2>
            <p className="font-mono text-xs text-static">alvos sob vigilância</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded border border-cyan bg-cyan/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-cyan shadow-glow-cyan transition hover:bg-cyan/20"
          >
            + Deploy
          </button>
        </div>

        {isLoading && <RadarSweep label="carregando sentinelas..." />}

        {!isLoading && sentinels?.length === 0 && (
          <HudFrame color="static" className="bg-panel/40 py-16">
            <RadarSweep label="nenhuma sentinela implantada" />
            <p className="-mt-8 text-center font-mono text-xs text-static">
              clique em "+ Deploy" para começar a vigiar um preço
            </p>
          </HudFrame>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sentinels?.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
            >
              <SentinelCard product={product} />
            </motion.div>
          ))}
        </div>
      </main>

      <DeploySentinelModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
