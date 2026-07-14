# PriceSentry — Web

Dashboard de vigilância de preço. React + TypeScript + Vite, TanStack Query, Recharts, Framer Motion, Tailwind.

## Direção de design

O produto é sobre vigiar — então a interface segue uma linguagem de **HUD de mission-control / vigilância**, não neon decorativo solto:

- Cada produto rastreado é uma "sentinela", exibida dentro de uma **moldura de mira** (cantos tipo viewfinder) — o elemento assinatura do projeto
- Cyan (`#00F0FF`) = dado/escaneamento · Magenta (`#FF2E6C`) = alerta/breach · Verde (`#39FF88`) = sentinela ativa — três acentos com função semântica própria, não um único neon genérico
- Tipografia: **Rajdhani** (headers/números grandes) + **JetBrains Mono** (preço, timestamp, log) + **Inter** (texto corrido)
- Quando o preço cruza o alvo, o card entra em `animate-breach` (flash) e a moldura muda de cyan pra magenta
- Fundo com grid sutil + scanline — textura, não decoração dominante

## Rodando localmente

```bash
npm install
cp .env.example .env   # aponte VITE_API_URL pro backend (padrão: localhost:4000)
npm run dev
```

Backend do PriceSentry precisa estar rodando (`npm run dev` no repo do backend) — auth, produtos e histórico dependem dele.

## Testes

```bash
npm test
```

11 testes (Vitest + Testing Library): roteamento protegido (redireciona não-autenticado pro login), estado vazio do dashboard, card de sentinela com breach detectado.

## Estrutura

```
src/
├── components/   HudFrame, SentinelCard, PriceChart, DeploySentinelModal, StatusBar, RadarSweep
├── pages/         AuthPage, DashboardPage, SentinelDetailPage
├── context/       AuthContext (token só em memória, mesmo padrão do Stockwise — sem localStorage)
└── lib/           api.ts (cliente tipado), format.ts
```
