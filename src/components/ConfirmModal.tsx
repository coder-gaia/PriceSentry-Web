import { AnimatePresence, motion } from "framer-motion";
import { HudFrame } from "./HudFrame";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  onConfirm,
  onCancel,
  isDangerous = true,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-30 flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm"
          >
            <HudFrame color={isDangerous ? "magenta" : "cyan"} className="bg-panel p-6">
              <h2 className="font-display text-lg font-semibold uppercase tracking-widest text-ink">
                {title}
              </h2>
              <p className="mt-2 font-mono text-xs text-static">{message}</p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onCancel}
                  className="rounded border border-static/40 px-4 py-2 font-mono text-xs uppercase tracking-widest text-static hover:text-ink"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className={
                    isDangerous
                      ? "rounded border border-magenta bg-magenta/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-magenta shadow-glow-magenta transition hover:bg-magenta/20"
                      : "rounded border border-cyan bg-cyan/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-cyan shadow-glow-cyan transition hover:bg-cyan/20"
                  }
                >
                  {confirmLabel}
                </button>
              </div>
            </HudFrame>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}