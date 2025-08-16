"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const ethers_1 = require("ethers");
const zod_1 = require("zod");
const Comet_json_1 = __importDefault(require("./abi/Comet.json"));
const config_1 = require("./config");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
const reqSchema = zod_1.z.object({ address: zod_1.z.string().min(1) });
app.post('/enrich', async (req, res) => {
    try {
        const env = (0, config_1.loadEnv)();
        const { address } = reqSchema.parse(req.body);
        const provider = new ethers_1.JsonRpcProvider(env.RPC_URL);
        const comet = new ethers_1.Contract(env.COMET_ADDRESS, Comet_json_1.default, provider);
        const [decimalsRaw, base, debt] = await Promise.all([
            comet.decimals().catch(() => 6),
            comet.balanceOf(address).catch(() => 0n),
            comet.borrowBalanceOf(address).catch(() => 0n)
        ]);
        const decimals = Number(decimalsRaw);
        const healthy = debt === 0n;
        res.json({ address, healthy, base: base.toString(), debt: debt.toString(), decimals });
    }
    catch (e) {
        res.status(400).json({ error: e?.message || String(e) });
    }
});
const port = Number(process.env.PORT || 8787);
app.listen(port, () => console.log(`Webhook listening on :${port}`));
