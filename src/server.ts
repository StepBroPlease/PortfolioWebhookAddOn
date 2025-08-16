import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { JsonRpcProvider, Contract } from 'ethers';
import { z } from 'zod';
import CometAbi from './abi/Comet.json';
import { loadEnv } from './config';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const reqSchema = z.object({ address: z.string().min(1) });

app.post('/enrich', async (req, res) => {
  try {
    const env = loadEnv();
    const { address } = reqSchema.parse(req.body);
    const provider = new JsonRpcProvider(env.RPC_URL);
    const comet = new Contract(env.COMET_ADDRESS!, CometAbi as any, provider);
    const [decimalsRaw, base, debt] = await Promise.all([
      comet.decimals().catch(() => 6),
      comet.balanceOf(address).catch(() => 0n),
      comet.borrowBalanceOf(address).catch(() => 0n)
    ]);
    const decimals = Number(decimalsRaw);
    const healthy = debt === 0n;
    res.json({ address, healthy, base: base.toString(), debt: debt.toString(), decimals });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || String(e) });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => console.log(`Webhook listening on :${port}`)); 