import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HudFrame } from "./HudFrame";
import { deploySentinel } from "../lib/api";

type DeploySentinelModalProps = {
  open: boolean;
  onClose: () => void;
};

const inputClass =
  "w-full rounded border border-cyan/20 bg-void px-3 py-2 font-mono text-sm text-ink placeholder:text-static focus:border-cyan focus:outline-none";
const labelClass = "font-mono text-[11px] uppercase tracking-widest text-static";

export function DeploySentinelModal({ open, onClose }: DeploySentinelModalProps) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [selector, setSelector] = useState(".price");
  const [targetPrice, setTargetPrice] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState("60");
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: deploySentinel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sentinels"] });
      resetAndClose();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Falha ao cadastrar sentinela";
      setFormError(message);
    },
  });

  function resetAndClose() {
    setUrl("");
    setName("");
    setSelector(".price");
    setTargetPrice("");
    setIntervalMinutes("60");
    setFormError(null);
    onClose();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const targetPriceCents = Math.round(Number.parseFloat(targetPrice.replace(",", ".")) * 100);
    if (!Number.isFinite(targetPriceCents) || targetPriceCents <= 0) {
      setFormError("Preço-alvo inválido");
      return;
    }

    mutation.mutate({
      url,
      name,
      selector,
      targetPriceCents,
      checkIntervalMinutes: Number.parseInt(intervalMinutes, 10),
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-20 flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md"
          >
            <HudFrame color="cyan" className="bg-panel p-6">
              <h2 className="font-display text-lg font-semibold uppercase tracking-widest text-ink">
                Deploy de sentinela
              </h2>
              <p className="mt-1 font-mono text-xs text-static">
                configure o alvo de vigilância
              </p>

              <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Nome</label>
                  <input
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Console de videogame X"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>URL do produto</label>
                  <input
                    className={inputClass}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://loja.com/produto/123"
                    type="url"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Seletor CSS do preço</label>
                  <input
                    className={inputClass}
                    value={selector}
                    onChange={(e) => setSelector(e.target.value)}
                    placeholder=".price"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Preço-alvo (R$)</label>
                    <input
                      className={inputClass}
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="899,00"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Verificar a cada (min)</label>
                    <input
                      className={inputClass}
                      value={intervalMinutes}
                      onChange={(e) => setIntervalMinutes(e.target.value)}
                      type="number"
                      min={5}
                      required
                    />
                  </div>
                </div>

                {formError && (
                  <p className="font-mono text-xs text-magenta">{formError}</p>
                )}

                <div className="mt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="rounded border border-static/40 px-4 py-2 font-mono text-xs uppercase tracking-widest text-static hover:text-ink"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="rounded border border-cyan bg-cyan/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-cyan shadow-glow-cyan transition hover:bg-cyan/20 disabled:opacity-50"
                  >
                    {mutation.isPending ? "Implantando..." : "Deploy"}
                  </button>
                </div>
              </form>
            </HudFrame>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
