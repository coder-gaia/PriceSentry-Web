import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0E14",
        panel: "#121826",
        panel2: "#171F30",
        cyan: {
          DEFAULT: "#00F0FF",
          dim: "#0B8A94",
        },
        magenta: {
          DEFAULT: "#FF2E6C",
          dim: "#8C1A3B",
        },
        signal: {
          DEFAULT: "#39FF88",
          dim: "#1B7A45",
        },
        ink: "#E8ECF4",
        static: "#5A6478",
      },
      fontFamily: {
        display: ["Rajdhani", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "glow-cyan": "0 0 12px rgba(0,240,255,0.45), 0 0 2px rgba(0,240,255,0.8)",
        "glow-magenta": "0 0 16px rgba(255,46,108,0.55), 0 0 3px rgba(255,46,108,0.9)",
        "glow-signal": "0 0 12px rgba(57,255,136,0.4), 0 0 2px rgba(57,255,136,0.8)",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        breach: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
      },
      animation: {
        scan: "scan 3s linear infinite",
        breach: "breach 0.4s ease-in-out 3",
        blink: "blink 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
