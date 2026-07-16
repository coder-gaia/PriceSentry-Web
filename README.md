# PriceSentry — Web

Dashboard de vigilância de preço. React + TypeScript + Vite, TanStack Query, Recharts, Framer Motion, Tailwind, Socket.io.

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

Backend do PriceSentry precisa estar rodando (`npm run dev` no repo do backend) — auth, produtos, histórico e o servidor de socket dependem dele.

## Sessão e autenticação

Access token vive **só em memória** (variável de módulo, nunca `localStorage`/`sessionStorage`) — mesmo padrão de segurança do Stockwise, imune a roubo por XSS. Ao carregar a página, o app tenta silenciosamente trocar o cookie `httpOnly` de refresh (que o backend seta no login) por um access token novo, antes de decidir se você tá deslogado — por isso recarregar a página não desconecta mais. Se uma chamada autenticada qualquer receber 401 no meio da sessão (token expirado), o interceptor do axios renova sozinho e refaz a chamada, de forma transparente.

## Tempo real

O dashboard e a página de detalhe escutam o evento `sentinel:updated` via Socket.io (autenticado no handshake com o mesmo JWT da API) e invalidam o cache do TanStack Query na hora — o preço atualiza sozinho assim que o worker termina uma checagem, sem esperar o próximo poll. O poll continua existindo, só que bem mais espaçado (60s) — rede de segurança caso a conexão do socket caia.

## Canal de alerta (Slack/Discord)

Além do e-mail (configurado no backend), cada usuário pode apontar um webhook do Slack ou Discord pelo botão "Alertas" na barra superior — dispara automaticamente junto com o e-mail quando uma sentinela sofre breach.

## Testes

```bash
npm test
```

10 testes (Vitest + Testing Library):

- Roteamento protegido: visitante não-autenticado é redirecionado pro login, com estado de "restaurando sessão" enquanto a checagem silenciosa roda
- Dashboard: estado vazio e card com breach detectado
- Fluxo de remoção: modal de confirmação (não `window.confirm`) e cache do dashboard invalidado após deletar
- Configuração de webhook: carrega config existente, salva, limpa, e fecha o modal ao salvar com sucesso
- Regressão do interceptor de 401: uma rota protegida sob `/auth/*` (não só login/registro/refresh) recebe renovação automática de token em vez de vazar o erro

## Estrutura

```bash
├── components/   HudFrame, SentinelCard, PriceChart, DeploySentinelModal, ConfirmModal,
│                 WebhookSettingsModal, StatusBar, RadarSweep
├── pages/        AuthPage, DashboardPage, SentinelDetailPage
├── context/      AuthContext (token em memória + restauração silenciosa via refresh cookie)
└── lib/          api.ts (cliente tipado + interceptor de refresh), socket.ts, format.ts
```

## Próximos passos sugeridos

- Code-splitting (bundle atual ~820kb; dá pra separar Recharts/Framer Motion em chunk próprio)
- Reconectar o socket automaticamente quando o access token é renovado via refresh (hoje a conexão inicial não é atualizada)
- Indicador visual de "conectado/desconectado" do socket na barra superior
