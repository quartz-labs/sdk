
import type BN from "bn.js";
import type { TimeLocked } from "../interfaces/TimeLock.interface.js";
import type { PublicKey } from "@solana/web3.js";

export interface SpendHold extends TimeLocked {
    amountUsdcBaseUnits: BN;
    spendFee: boolean;
}

export interface SpendHoldAccount {
    publicKey: PublicKey;
    account: SpendHold;
}