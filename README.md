# LLM Cost Calculator

**Calculadora profissional de custos de APIs de LLMs — abril 2026**

Calcule, compare e otimize custos de chamadas às principais APIs de linguagem do mercado: Claude, GPT, Gemini, Grok, Llama, DeepSeek e Mistral.

---

## Stack

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR, roteamento moderno, DX excelente |
| UI | Tailwind CSS + Framer Motion | Estilização utility-first + animações fluídas |
| Charts | Recharts | Gráficos React composable e responsivos |
| Backend | FastAPI (Python 3.11+) | Alta performance, tipagem, docs automáticas |
| Banco | SQLite via aiosqlite | Zero configuração, persistência local |
| Fonte de preços | Documentações oficiais dos provedores | Dados confiáveis e auditáveis |

---

## Funcionalidades

### 1. Cálculo por requisição
- Selecione o modelo com busca em tempo real
- Ajuste tokens de entrada e saída com sliders
- Aplique otimizações: Prompt Cache (até 90% off) e Batch API (até 50% off)
- Veja custo unitário + projeções por volume

### 2. Estimativa mensal
- Volume de requisições por dia
- Gráfico donut de distribuição input vs output
- Custo mensal e anual em USD e BRL

### 3. Comparativo de modelos
- 20 modelos ranqueados por custo
- Filtros por tier (Econômico / Padrão / Premium / Frontier) e provedor
- Barra de custo relativo visual
- Gráfico de barras dos 5 mais baratos

### 4. Sistema de agentes
- Adicione múltiplos agentes com modelos diferentes
- Configure volume, tokens e otimizações por agente
- Custo consolidado do sistema com breakdown por agente
- Presets prontos (WhatsApp, RAG, Código)

### 5. Histórico
- Salve qualquer cálculo com um clique
- Persistência em SQLite
- Visualize e remova registros

---

## Modelos suportados (abril 2026)

| Provedor | Modelos |
|----------|---------|
| Anthropic | Claude Haiku 4.5, Sonnet 4.6, Opus 4.6 |
| OpenAI | GPT-5 Nano, Mini, 5.2, 5.2 Pro |
| Google | Gemini 2.0 Flash, 2.5 Flash, 2.5 Pro, 3 Flash, 3.1 Pro |
| xAI | Grok (base), Grok 3 |
| Groq | Llama 4, Mixtral 8x7B |
| DeepSeek | DeepSeek V3, R1 |
| Mistral | Mistral Small, Large 3 |

---

## Instalação e execução

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- npm ou yarn

### Opção 1 — Script automático
```bash
chmod +x start.sh
./start.sh
```

### Opção 2 — Manual

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend (outro terminal):**
```bash
cd frontend
npm install
npm run dev
```

### Acesso
| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## Estrutura do projeto

```
llm-cost-calculator/
├── backend/
│   ├── main.py                 # FastAPI app + lifespan
│   ├── requirements.txt
│   ├── data/
│   │   ├── models.py           # Dados de todos os modelos e provedores
│   │   └── calculator.db       # SQLite (criado na primeira execução)
│   ├── routers/
│   │   ├── pricing.py          # GET /api/pricing/models, /providers
│   │   ├── calculator.py       # POST /api/calculator/single|monthly|compare|agents
│   │   └── history.py          # GET/DELETE /api/history
│   └── services/
│       ├── pricing_service.py  # Lógica de cálculo e comparação
│       └── db_service.py       # CRUD SQLite assíncrono
│
└── frontend/
    ├── next.config.js           # Proxy /api → localhost:8000
    ├── tailwind.config.js
    └── src/
        ├── app/
        │   ├── layout.tsx       # Metadados + fontes
        │   ├── page.tsx         # Página principal
        │   └── globals.css      # Design system + variáveis
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.tsx
        │   │   └── Hero.tsx
        │   ├── ui/
        │   │   ├── index.tsx    # Card, MetricCard, Slider, Toggle, etc.
        │   │   └── ModelSelector.tsx
        │   └── calculator/
        │       ├── Calculator.tsx      # Container com tabs
        │       ├── SingleCalcTab.tsx
        │       ├── MonthlyCalcTab.tsx
        │       ├── CompareTab.tsx
        │       ├── AgentTab.tsx
        │       └── HistoryTab.tsx
        ├── hooks/
        │   └── useModels.ts     # Fetch + cache de modelos
        └── lib/
            ├── api.ts           # Cliente HTTP tipado
            └── utils.ts         # Formatadores, cores, utilitários
```

---

## API Endpoints

### Pricing
```
GET  /api/pricing/models          → Lista todos os modelos
GET  /api/pricing/models/{id}     → Modelo específico
GET  /api/pricing/providers       → Lista provedores com metadados
```

### Calculator
```
POST /api/calculator/single       → Custo por requisição
POST /api/calculator/monthly      → Estimativa mensal
POST /api/calculator/compare      → Comparativo de todos os modelos
POST /api/calculator/agents       → Sistema de agentes
```

### History
```
GET    /api/history               → Lista histórico
DELETE /api/history/{id}          → Remove registro
DELETE /api/history               → Limpa tudo
```

---

## Atualizar preços

Edite `backend/data/models.py` — o dicionário `MODELS_DATA`.  
Cada modelo segue a interface `ModelPricing`:

```python
{
    "id": "claude-sonnet-4-6",
    "provider": "Anthropic",
    "provider_id": "anthropic",
    "name": "Claude Sonnet 4.6",
    "input_per_m": 3.00,        # USD por 1M tokens de entrada
    "output_per_m": 15.00,      # USD por 1M tokens de saída
    "cached_input_per_m": 0.30, # USD com cache (ou None)
    "context_window": 200000,
    "tier": "standard",         # economy | standard | premium | frontier
    "strengths": ["..."],
    "best_for": ["..."],
    "batch_available": True,
    "batch_discount": 50.0,
    "docs_url": "https://...",
}
```

---

## Deploy

### Docker (recomendado)
```bash
# Backend
docker build -t llm-calc-api ./backend
docker run -p 8000:8000 llm-calc-api

# Frontend
docker build -t llm-calc-web ./frontend
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://seu-backend llm-calc-web
```

### Railway / Render / Fly.io
O backend FastAPI funciona em qualquer plataforma WSGI/ASGI.  
O frontend Next.js pode ser deployado na Vercel com `NEXT_PUBLIC_API_URL` apontando para o backend.

---

## Contribuindo

1. Fork o repositório
2. `git checkout -b feature/meu-recurso`
3. Siga commits convencionais: `feat:`, `fix:`, `docs:`
4. Abra um PR com descrição detalhada

---

**Desenvolvido com FastAPI + Next.js · Preços baseados nas documentações oficiais dos provedores · Abril 2026**
