import { PublicKey } from "@solana/web3.js";
import { DRIFT_PROGRAM_ID, MARKET_INDEX_USDC, MESSAGE_TRANSMITTER_PROGRAM_ID, PYTH_ORACLE_PROGRAM_ID, QUARTZ_PROGRAM_ID, TOKEN_MESSAGE_MINTER_PROGRAM_ID } from "../config/constants.js";
import BN from "bn.js";
import { TOKENS } from "../config/tokens.js";
import type { MarketIndex } from "../config/tokens.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { getTokenProgram } from "../index.browser.js";
import type { Connection } from "@solana/web3.js";


// Quartz

export const getVaultPublicKey = (owner: PublicKey) => {
    const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), owner.toBuffer()],
        QUARTZ_PROGRAM_ID
    )
    return vaultPda;
}

export const getSpendMulePublicKey = (owner: PublicKey) => {
    const [mulePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("spend_mule"), owner.toBuffer()],
        QUARTZ_PROGRAM_ID
    );
    return mulePda;
};

export const getWithdrawMulePublicKey = (owner: PublicKey, mint: PublicKey) => {
    const [mulePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("withdraw_mule"), owner.toBuffer(), mint.toBuffer()],
        QUARTZ_PROGRAM_ID
    )
    return mulePda;
}

export const getDepositMulePublicKey = (owner: PublicKey, mint: PublicKey) => {
    const [mulePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("deposit_mule"), owner.toBuffer(), mint.toBuffer()],
        QUARTZ_PROGRAM_ID
    );
    return mulePda;
}

export const getCollateralRepayMulePublicKey = (owner: PublicKey, mint: PublicKey) => {
    const [mulePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("collateral_repay_mule"), owner.toBuffer(), mint.toBuffer()],
        QUARTZ_PROGRAM_ID
    );
    return mulePda;
}

export const getCollateralRepayLedgerPublicKey = (owner: PublicKey) => {
    const [tokenLedgerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("collateral_repay_ledger"), owner.toBuffer()],
        QUARTZ_PROGRAM_ID
    );
    return tokenLedgerPda;
}

export const getBridgeRentPayerPublicKey = () => {
    const [bridgeRentPayerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("bridge_rent_payer")],
        QUARTZ_PROGRAM_ID
    );
    return bridgeRentPayerPda;
}

export const getInitRentPayerPublicKey = () => {
    const [initRentPayerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("init_rent_payer")],
        QUARTZ_PROGRAM_ID
    );
    return initRentPayerPda;
}

export const getTimeLockRentPayerPublicKey = () => {
    const [timeLockRentPayerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("time_lock_rent_payer")],
        QUARTZ_PROGRAM_ID
    );
    return timeLockRentPayerPda;
}

export const getRentFloatPublicKey = () => {
    const [rentFloatPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("rent_float")],
        QUARTZ_PROGRAM_ID
    );
    return rentFloatPda;
}

export const getDepositAddressPublicKey = (owner: PublicKey) => {
    const vaultPda = getVaultPublicKey(owner);
    const [depositAddressPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("deposit_address"), vaultPda.toBuffer()],
        QUARTZ_PROGRAM_ID
    );
    return depositAddressPda;
}

export const getDepositAddressAtaPublicKey = async (
    connection: Connection,
    owner: PublicKey,
    marketIndex: MarketIndex
) => {
    const depositAddress = getDepositAddressPublicKey(owner);
    const mint = TOKENS[marketIndex].mint;
    const tokenProgram = await getTokenProgram(connection, mint);
    return getAssociatedTokenAddressSync(mint, depositAddress, true, tokenProgram);
}

// Drift

export const getDriftUserPublicKey = (vaultPda: PublicKey) => {
    const [userPda] = PublicKey.findProgramAddressSync(
        [
			Buffer.from("user"),
			vaultPda.toBuffer(),
			new BN(0).toArrayLike(Buffer, 'le', 2),
		],
		DRIFT_PROGRAM_ID
    );
    return userPda;
}

export const getDriftUserStatsPublicKey = (vaultPda: PublicKey) => {
    const [userStatsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_stats"), vaultPda.toBuffer()],
        DRIFT_PROGRAM_ID
    );
    return userStatsPda;
}

export const getDriftStatePublicKey = () => {
    const [statePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("drift_state")],
        DRIFT_PROGRAM_ID
    );
    return statePda; 
}

export const getDriftSignerPublicKey = () => {
    const [signerPda] = PublicKey.findProgramAddressSync(
		[Buffer.from("drift_signer")],
		DRIFT_PROGRAM_ID
	);
    return signerPda;
}

export const getDriftSpotMarketVaultPublicKey = (marketIndex: number) => {
    const [spotMarketVaultPda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("spot_market_vault"), 
            new BN(marketIndex).toArrayLike(Buffer, 'le', 2)    
        ],
        DRIFT_PROGRAM_ID
    );
    return spotMarketVaultPda;
}

export const getDriftSpotMarketPublicKey = (marketIndex: number) => {
    const [spotMarketPda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("spot_market"), 
            new BN(marketIndex).toArrayLike(Buffer, 'le', 2)    
        ],
        DRIFT_PROGRAM_ID
    );
    return spotMarketPda;
}


// Pyth

export const getPythPriceFeedAccount = (shardId: number, priceFeedId: string) => {
    let priceFeedIdBuffer: Buffer;
    if (priceFeedId.startsWith("0x")) {
        priceFeedIdBuffer = Buffer.from(priceFeedId.slice(2), "hex");
    } else {
        priceFeedIdBuffer = Buffer.from(priceFeedId, "hex");
    }
    if (priceFeedIdBuffer.length !== 32) {
        throw new Error("Feed ID should be 32 bytes long");
    }
    const shardBuffer = Buffer.alloc(2);
    shardBuffer.writeUint16LE(shardId, 0);
    return PublicKey.findProgramAddressSync([shardBuffer, priceFeedIdBuffer], PYTH_ORACLE_PROGRAM_ID)[0];
}

export const getPythOracle = (marketIndex: MarketIndex) => {
    const priceFeedId = TOKENS[marketIndex].pythPriceFeedId;
    return getPythPriceFeedAccount(0, priceFeedId);
}


// Circle

export const getSenderAuthority = () => {
    const [senderAuthorityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("sender_authority")],
        TOKEN_MESSAGE_MINTER_PROGRAM_ID
    );
    return senderAuthorityPda;
};

export const getMessageTransmitter = () => {
    const [messageTransmitter] = PublicKey.findProgramAddressSync(
        [Buffer.from("message_transmitter")],
        MESSAGE_TRANSMITTER_PROGRAM_ID
    );
    return messageTransmitter;
};

export const getTokenMessenger = () => {
    const [tokenMessenger] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_messenger")],
        TOKEN_MESSAGE_MINTER_PROGRAM_ID
    );
    return tokenMessenger;
};

export const getTokenMinter = () => {
    const [tokenMinter] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_minter")],
        TOKEN_MESSAGE_MINTER_PROGRAM_ID
    );
    return tokenMinter;
};

export const getLocalToken = () => {
    const [localToken] = PublicKey.findProgramAddressSync(
        [Buffer.from("local_token"), TOKENS[MARKET_INDEX_USDC].mint.toBuffer()],
        TOKEN_MESSAGE_MINTER_PROGRAM_ID,
    );
    return localToken;
};

export const getRemoteTokenMessenger = () => {
    const DOMAIN_BASE = 6;
    const [remoteTokenMessenger] = PublicKey.findProgramAddressSync(
        [Buffer.from("remote_token_messenger"), Buffer.from(DOMAIN_BASE.toString())],
        TOKEN_MESSAGE_MINTER_PROGRAM_ID
    );
    return remoteTokenMessenger;
};

export const getEventAuthority = () => {
    const [eventAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("__event_authority")],
        TOKEN_MESSAGE_MINTER_PROGRAM_ID
    );
    return eventAuthority;
};
