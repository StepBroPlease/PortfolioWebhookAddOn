# Portfolio Webhook Add‑On

Tiny service that enriches any portfolio tracker with Compound v3 borrow health via webhook.

## MVP
- HTTP endpoint: `POST /enrich` with `{ address }`
- Respond with `{ health: boolean, baseBorrow, baseSupply }`
- Reads from RPC; no storage

## Dev
```bash
cp .env.example .env
RPC_URL=http://127.0.0.1:8545
COMET_ADDRESS=0xc3d688B66703497DAA19211EEdff47f25384cdc3
npm install
npm run build
```

## Next steps
- Add tiny Express server and a `POST /enrich` route
- Example cURL + Postman collection 