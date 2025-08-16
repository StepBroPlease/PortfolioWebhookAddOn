"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ethers_1 = require("ethers");
const Comet_json_1 = __importDefault(require("./abi/Comet.json"));
const config_1 = require("./config");
async function main() {
    const env = (0, config_1.loadEnv)();
    const provider = new ethers_1.JsonRpcProvider(env.RPC_URL);
    const signer = env.PRIVATE_KEY ? new ethers_1.Wallet(env.PRIVATE_KEY, provider) : undefined;
    const net = await provider.getNetwork();
    console.log(`Connected to chainId=${Number(net.chainId)}`);
    if (!env.COMET_ADDRESS) {
        console.log('Template ready. Set COMET_ADDRESS in .env to interact.');
        return;
    }
    const comet = new ethers_1.Contract(env.COMET_ADDRESS, Comet_json_1.default, signer ?? provider);
    let baseDecimals = 6;
    try {
        baseDecimals = await comet.decimals();
    }
    catch { }
    if (signer) {
        const addr = await signer.getAddress();
        const baseSupply = (await comet.balanceOf(addr));
        const borrow = (await comet.borrowBalanceOf(addr).catch(() => 0n));
        console.log(`Base supply balance: ${(0, ethers_1.formatUnits)(baseSupply, baseDecimals)}`);
        console.log(`Borrow balance: ${(0, ethers_1.formatUnits)(borrow, baseDecimals)}`);
    }
    else {
        console.log('No PRIVATE_KEY set. Read-only mode.');
    }
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
