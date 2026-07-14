import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { HudFrame } from "../components/HudFrame";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded border border-cyan/20 bg-void px-3 py-2 font-mono text-sm text-ink placeholder:text-static focus:border-cyan focus:outline-none";

export function AuthPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await auth.login(email, password);
      } else {
        await auth.register(email, password);
      }
      navigate("/");
    } catch {
      setError(mode === "login" ? "Credenciais inválidas" : "Não foi possível registrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold tracking-widest text-ink">
            PRICE<span className="text-cyan">SENTRY</span>
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-static">
            sistema de vigilância de preço
          </p>
        </div>

        <HudFrame color="cyan" className="bg-panel/80 p-6">
          <div className="mb-5 flex gap-1 rounded border border-static/20 p-1">
            {(["login", "register"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setMode(option)}
                className={`flex-1 rounded py-1.5 font-mono text-xs uppercase tracking-widest transition ${
                  mode === option ? "bg-cyan/15 text-cyan" : "text-static hover:text-ink"
                }`}
              >
                {option === "login" ? "Acessar" : "Registrar"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              className={inputClass}
              type="email"
              placeholder="email@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className={inputClass}
              type="password"
              placeholder="senha (mín. 8 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />

            {error && <p className="font-mono text-xs text-magenta">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded border border-cyan bg-cyan/10 py-2.5 font-mono text-xs uppercase tracking-widest text-cyan shadow-glow-cyan transition hover:bg-cyan/20 disabled:opacity-50"
            >
              {submitting ? "Conectando..." : mode === "login" ? "Acessar sistema" : "Criar acesso"}
            </button>
          </form>
        </HudFrame>
      </div>
    </div>
  );
}
