import { PublicKey } from "@solana/web3.js";
import { QUARTZ_PROGRAM_ID } from "../config/constants";
import { BN } from "@coral-xyz/anchor";
import { DRIFT_PROGRAM_ID } from "@drift-labs/sdk";
export const getVaultPublicKey = (user) => {
    const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault"), user.toBuffer()], QUARTZ_PROGRAM_ID);
    return vaultPda;
};
export const getVaultSplPublicKey = (user, mint) => {
    const vaultPda = getVaultPublicKey(user);
    const [vaultSplPda] = PublicKey.findProgramAddressSync([vaultPda.toBuffer(), mint.toBuffer()], QUARTZ_PROGRAM_ID);
    return vaultSplPda;
};
export const getDriftUserPublicKey = (vaultPda) => {
    const [userPda] = PublicKey.findProgramAddressSync([
        Buffer.from("user"),
        vaultPda.toBuffer(),
        new BN(0).toArrayLike(Buffer, 'le', 2),
    ], new PublicKey(DRIFT_PROGRAM_ID));
    return userPda;
};
export const getDriftUserStatsPublicKey = (vaultPda) => {
    const [userStatsPda] = PublicKey.findProgramAddressSync([Buffer.from("user_stats"), vaultPda.toBuffer()], new PublicKey(DRIFT_PROGRAM_ID));
    return userStatsPda;
};
export const getDriftStatePublicKey = () => {
    const [statePda] = PublicKey.findProgramAddressSync([Buffer.from("drift_state")], new PublicKey(DRIFT_PROGRAM_ID));
    return statePda;
};
export const getDriftSpotMarketPublicKey = (marketIndex) => {
    const [spotMarketVaultPda] = PublicKey.findProgramAddressSync([
        Buffer.from("spot_market_vault"),
        new BN(marketIndex).toArrayLike(Buffer, 'le', 2)
    ], new PublicKey(DRIFT_PROGRAM_ID));
    return spotMarketVaultPda;
};
export const toRemainingAccount = (pubkey, isWritable, isSigner) => {
    return { pubkey, isWritable, isSigner };
};
