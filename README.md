# DAWSON AI 爆款潜力评估 Agent

Evidence-led bilingual product opportunity assessment demo for disposable vape products.

## Run locally

```bash
copy .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. `OPENAI_API_KEY` is optional; without it the app runs in deterministic demo mode. Add a key to enable server-side multimodal image extraction. Numerical scores never come from the model.

The seeded sample is available at `/evaluations/demo-uae-aero`; the generated PDF can be opened from [output/pdf/DAWSON_AI_Product_Potential_Demo.pdf](./output/pdf/DAWSON_AI_Product_Potential_Demo.pdf).

The main flows are `/new` for a new assessment and `/admin` for market-specific scoring profiles. Set `DEMO_ACCESS_CODE` to protect all app routes with a short-lived access cookie when deploying a client-facing demo.

## Validate

```bash
npm test
npm run build
```

## Docker

```bash
docker compose up --build
```

The evaluation store is persisted in the `dawson-data` volume. Set `DEMO_ACCESS_CODE` when placing the demo on a public host.
