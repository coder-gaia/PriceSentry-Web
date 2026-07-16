import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HudFrame } from "./HudFrame";
import { getMe, updateWebhookSettings, type WebhookType } from "../lib/api";

type WebhookSettingsModalProps = { open: boolean; onClose: () => void };

const inputClass =
  "w-full rounded border border-cyan/20 bg-void px-3 py-2 font-mono text-sm text-ink placeholder:text-static focus:border-cyan focus:outline-none";
const labelClass = "font-mono text-[11px] uppercase tracking-widest text-static";

export function WebhookSettingsModal({ open, onClose }: WebhookSettingsModalProps) {
  const queryClient = useQueryClient();
  const [channel, setChannel] = useState<WebhookType | "none">("none");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const profileQuery = useQuery({ queryKey: ["me"], queryFn: getMe, enabled: open });

  useEffect(() => {
    if (profileQuery.data) {
      setChannel(profileQuery.data.webhookType ?? "none");
      setWebhookUrl(profileQuery.data.webhookUrl ?? "");
    }
  }, [profileQuery.data]);

  const mutation = useMutation({
    mutationFn: updateWebhookSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data);
      setFormError(null);
      setSavedMessage("Configuração salva.");
      setTimeout(() => setSavedMessage(null), 2500);
    },
    onError: () => setFormError("Não foi possível salvar. Confira a URL do webhook."),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (channel === "none") {
      mutation.mutate({ webhookUrl: null, webhookType: null });
      return;
    }
    if (!webhookUrl.trim()) {
      setFormError("Informe a URL do webhook.");
      return;
    }
    mutation.mutate({ webhookUrl: webhookUrl.trim(), webhookType: channel });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-20 flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.15 }}
            onClick={(event) => event.stopPropagation()} className="w-full max-w-md"
          >
            <HudFrame color="cyan" className="bg-panel p-6">
              <h2 className="font-display text-lg font-semibold uppercase tracking-widest text-ink">Canal de alerta</h2>
              <p className="mt-1 font-mono text-xs text-static">
                além do e-mail, dispara um webhook quando uma sentinela sofre breach
              </p>

              <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Canal</label>
                  <select className={inputClass} value={channel} onChange={(e) => setChannel(e.target.value as WebhookType | "none")}>
                    <option value="none">Nenhum (só e-mail)</option>
                    <option value="slack">Slack</option>
                    <option value="discord">Discord</option>
                  </select>
                </div>

                {channel !== "none" && (
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>URL do webhook</label>
                    <input
                      className={inputClass} value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder={channel === "slack" ? "https://hooks.slack.com/services/..." : "https://discord.com/api/webhooks/..."}
                    />
                  </div>
                )}

                {formError && <p className="font-mono text-xs text-magenta">{formError}</p>}
                {savedMessage && <p className="font-mono text-xs text-signal">{savedMessage}</p>}

                <div className="mt-2 flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="rounded border border-static/40 px-4 py-2 font-mono text-xs uppercase tracking-widest text-static hover:text-ink">
                    Fechar
                  </button>
                  <button type="submit" disabled={mutation.isPending} className="rounded border border-cyan bg-cyan/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-cyan shadow-glow-cyan transition hover:bg-cyan/20 disabled:opacity-50">
                    {mutation.isPending ? "Salvando..." : "Salvar"}
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