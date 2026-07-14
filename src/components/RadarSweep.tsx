import { motion } from "framer-motion";

export function RadarSweep({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative h-28 w-28">
        <div className="absolute inset-0 rounded-full border border-cyan/20" />
        <div className="absolute inset-3 rounded-full border border-cyan/20" />
        <div className="absolute inset-6 rounded-full border border-cyan/20" />
        <motion.div
          className="absolute inset-0 origin-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        >
          <div className="h-1/2 w-full origin-bottom bg-gradient-to-t from-cyan/60 to-transparent" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan shadow-glow-cyan" />
        </div>
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-static">{label}</p>
    </div>
  );
}
