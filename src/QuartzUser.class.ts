import type { DriftClient, UserAccount } from "@drift-labs/sdk";
import type { Connection, AddressLookupTableAccount, TransactionInstruction, } from "@solana/web3.js";
import { DRIFT_PROGRAM_ID, MARKET_INDEX_SOL, MARKET_INDEX_USDC, MESSAGE_TRANSMITTER_PROGRAM_ID, QUARTZ_PROGRAM_ID, SPEND_FEE_DESTINATION, TOKEN_MESSAGE_MINTER_PROGRAM_ID, } from "./config/constants.js";
import type { Quartz } from "./types/idl/quartz.js";
import type { Program } from "@coral-xyz/anchor";
import type { PublicKey, } from "@solana/web3.js";
import { getDriftSpotMarketVaultPublicKey, getDriftStatePublicKey, getPythOracle, getDriftSignerPublicKey, getVaultPublicKey, getVaultSplPublicKey, getCollateralRepayLedgerPublicKey, getBridgeRentPayerPublicKey, getLocalToken, getTokenMinter, getRemoteTokenMessenger, getTokenMessenger, getSenderAuthority, getMessageTransmitter, getEventAuthority, getInitRentPayerPublicKey, getSpendMulePublicKey, getTimeLockRentPayerPublicKey, getWithdrawMulePublicKey, } from "./utils/accounts.js";
import { calculateWithdrawOrderBalances, getTokenProgram, } from "./utils/helpers.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, } from "@solana/spl-token";
import { SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import BN from "bn.js";
import { TOKENS, type MarketIndex } from "./config/tokens.js";
import { Keypair } from "@solana/web3.js";
import type { QuartzClient } from "./QuartzClient.class.js";
import type { WithdrawOrder } from "./index.browser.js";
import { DriftUser } from "./types/classes/DriftUser.class.js";

export class QuartzUser {
    public readonly pubkey: PublicKey;
    public readonly vaultPubkey: PublicKey;

    public readonly spendLimitPerTransaction: BN;
    public readonly spendLimitPerTimeframe: BN;
    public readonly remainingSpendLimitPerTimeframe: BN;
    public readonly nextTimeframeResetTimestamp: BN;
    public readonly timeframeInSeconds: BN;

    private connection: Connection;
    private program: Program<Quartz>;
    private quartzLookupTable: AddressLookupTableAccount;
    private client: QuartzClient;

    private driftUser: DriftUser;
    private driftSigner: PublicKey;

    constructor(
        pubkey: PublicKey,
        connection: Connection,
        client: QuartzClient,
        program: Program<Quartz>,
        quartzLookupTable: AddressLookupTableAccount,
        driftClient: DriftClient,
        driftUserAccount: UserAccount,
        spendLimitPerTransaction: BN,
        spendLimitPerTimeframe: BN,
        remainingSpendLimitPerTimeframe: BN,
        nextTimeframeResetTimeframe: BN,
        timeframeInSeconds: BN
    ) {
        this.pubkey = pubkey;
        this.connection = connection;
        this.client = client;
        this.program = program;
        this.quartzLookupTable = quartzLookupTable;

        this.vaultPubkey = getVaultPublicKey(pubkey);
        this.driftSigner = getDriftSignerPublicKey();

        this.spendLimitPerTransaction = spendLimitPerTransaction;
        this.spendLimitPerTimeframe = spendLimitPerTimeframe;
        this.remainingSpendLimitPerTimeframe = remainingSpendLimitPerTimeframe;
        this.nextTimeframeResetTimestamp = nextTimeframeResetTimeframe;
        this.timeframeInSeconds = timeframeInSeconds;

        this.driftUser = new DriftUser(
            this.vaultPubkey,
            driftClient,
            driftUserAccount
        );
    }

    public getHealth(): number {
        return this.driftUser.getHealth();
    }

    public async getRepayUsdcValueForTargetHealth(
        targetHealth: number,
        repayAssetWeight: number,
        repayLiabilityWeight: number
    ): Promise<number> {
        // New Quartz health after repayment is given as:
        // 
        //                         marginRequirement - (repayValue * repayLiabilityWeight)
        //   targetHealth =  1 - -----------------------------------------------------------
        //                       currentWeightedCollateral - (repayValue * repayAssetWeight)
        //
        // Where repayAssetWeight and repayLiabilityWeight are between 0 and 1.
        // The following is an algebraicly simplified expression of the above formula, in terms of repayValue.

        if (targetHealth < 0 || targetHealth > 100) throw Error("Target health must be between 0 and 100 inclusive");
        if (!Number.isInteger(targetHealth)) throw new Error("Target health must be a whole number");

        if (repayAssetWeight < 0 || repayAssetWeight > 100) throw Error("Repay collateral weight must be between 0 and 100 inclusive");
        if (!Number.isInteger(repayAssetWeight)) throw new Error("Repay collateral weight must be a whole number");

        if (repayLiabilityWeight < 100) throw Error("Repay liability weight must be greater or equal to 100");
        if (!Number.isInteger(repayLiabilityWeight)) throw new Error("Repay liability weight must be a whole number");

        if (targetHealth <= this.getHealth()) throw Error("Target health must be greater than current health");

        const openOrders: WithdrawOrder[] = []; // Ignore orders for liquidation
        const currentWeightedCollateral = await this.getTotalWeightedCollateralValue(openOrders);
        const marginRequirement = await this.getMarginRequirement(openOrders);
        const targetHealthDecimal = targetHealth / 100;
        const repayAssetWeightDecimal = repayAssetWeight / 100;
        const repayLiabilityWeightDecimal = repayLiabilityWeight / 100;

        const repayValueUsdcBaseUnits = Math.round(
            (
                currentWeightedCollateral * (targetHealthDecimal - 1) + marginRequirement
            ) / (
                repayAssetWeightDecimal * (targetHealthDecimal - 1) + repayLiabilityWeightDecimal
            )
        );

        return repayValueUsdcBaseUnits;
    }

    public async getTotalCollateralValue(
        openWithdrawOrders?: WithdrawOrder[]
    ): Promise<number> {
        openWithdrawOrders = await this.validateOpenWithdrawOrders(openWithdrawOrders);
        const openOrderBalances = calculateWithdrawOrderBalances(openWithdrawOrders);

        return this.driftUser.getTotalCollateralValue(
            undefined,
            false,
            true,
            openOrderBalances
        ).toNumber();
    }

    public async getTotalWeightedCollateralValue(
        openWithdrawOrders?: WithdrawOrder[]
    ): Promise<number> {
        openWithdrawOrders = await this.validateOpenWithdrawOrders(openWithdrawOrders);
        const openOrderBalances = calculateWithdrawOrderBalances(openWithdrawOrders);

        return this.driftUser.getTotalCollateralValue(
            "Initial",
            false,
            true,
            openOrderBalances
        ).toNumber();
    }

    public async getMarginRequirement(
        openWithdrawOrders?: WithdrawOrder[]
    ): Promise<number> {
        openWithdrawOrders = await this.validateOpenWithdrawOrders(openWithdrawOrders);
        const openOrderBalances = calculateWithdrawOrderBalances(openWithdrawOrders);

        return this.driftUser.getInitialMarginRequirement(openOrderBalances).toNumber();
    }

    public async getAvailableCreditUsdcBaseUnits(
        openWithdrawOrders?: WithdrawOrder[]
    ): Promise<number> {
        return await this.getWithdrawalLimit(
            MARKET_INDEX_USDC,
            false,
            openWithdrawOrders
        );
    }

    private async validateOpenWithdrawOrders(
        openWithdrawOrders?: WithdrawOrder[]
    ): Promise<WithdrawOrder[]> {
        if (openWithdrawOrders === undefined) {
            const accounts = await this.client.getOpenWithdrawOrders(this.pubkey);
            return accounts.map((account) => account.account);
        }

        return openWithdrawOrders
            .filter(order => order.timeLock.owner.equals(this.pubkey));
    }

    public async getTokenBalance(
        spotMarketIndex: number,
        openWithdrawOrders?: WithdrawOrder[]
    ): Promise<BN> {
        openWithdrawOrders = await this.validateOpenWithdrawOrders(openWithdrawOrders);
        const openOrderBalances = calculateWithdrawOrderBalances(openWithdrawOrders);

        return this.driftUser.getTokenAmount(spotMarketIndex, openOrderBalances);
    }

    public async getMultipleTokenBalances(
        marketIndices: MarketIndex[],
        openWithdrawOrders?: WithdrawOrder[]
    ): Promise<Record<MarketIndex, BN>> {
        openWithdrawOrders = await this.validateOpenWithdrawOrders(openWithdrawOrders);

        const balancesArray = await Promise.all(
            marketIndices.map(async index => ({
                index,
                balance: await this.getTokenBalance(index, openWithdrawOrders)
            }))
        );

        const balances = balancesArray.reduce((acc, { index, balance }) =>
            Object.assign(acc, { [index]: balance }
            ), {} as Record<MarketIndex, BN>);

        return balances;
    }

    public async getWithdrawalLimit(
        spotMarketIndex: MarketIndex,
        reduceOnly = false,
        openWithdrawOrders?: WithdrawOrder[]
    ): Promise<number> {
        openWithdrawOrders = await this.validateOpenWithdrawOrders(openWithdrawOrders);
        const openOrderBalances = calculateWithdrawOrderBalances(openWithdrawOrders);

        return this.driftUser.getWithdrawalLimit(
            spotMarketIndex,
            reduceOnly,
            openOrderBalances
        ).toNumber();
    }

    public async getMultipleWithdrawalLimits(
        spotMarketIndices: MarketIndex[],
        reduceOnly = false,
        openWithdrawOrders?: WithdrawOrder[]
    ): Promise<Record<MarketIndex, number>> {
        openWithdrawOrders = await this.validateOpenWithdrawOrders(openWithdrawOrders);

        const limitsArray = await Promise.all(
            spotMarketIndices.map(async index => ({
                index,
                limit: await this.getWithdrawalLimit(
                    index,
                    reduceOnly,
                    openWithdrawOrders
                )
            }))
        );

        const limits = limitsArray.reduce((acc, { index, limit }) =>
            Object.assign(acc, { [index]: limit }
            ), {} as Record<MarketIndex, number>);

        return limits;
    }


    // --- Instructions ---

    public async getLookupTables(): Promise<AddressLookupTableAccount[]> {
        return [this.quartzLookupTable];
    }

    /**
     * Creates instructions to close a Quartz user account. This cannot be undone.
     * @returns {Promise<{
     *     ixs: TransactionInstruction[],
     *     lookupTables: AddressLookupTableAccount[],
     *     signers: Keypair[]
     * }>} Object containing:
     * - ixs: Array of instructions to close the Quartz user account.
     * - lookupTables: Array of lookup tables for building VersionedTransaction.
     * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
     * @throw Error if the RPC connection fails. The transaction will fail if the account has any balance or loans, or is less than 13 days old.
     */
    public async makeCloseAccountIxs(): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
        const ix_closeVault = await this.program.methods
            .closeUser()
            .accounts({
                vault: this.vaultPubkey,
                owner: this.pubkey,
                initRentPayer: getInitRentPayerPublicKey(),
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: getDriftStatePublicKey(),
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .instruction();

        return {
            ixs: [ix_closeVault],
            lookupTables: [this.quartzLookupTable],
            signers: []
        };
    }

    /**
     * Creates instructions to upgrade a Quartz user account.
     * @param spendLimitPerTransaction - The card spend limit per transaction.
     * @param spendLimitPerTimeframe - The card spend limit per timeframe.
     * @param timeframeInSlots - The timeframe in slots (eg: 216,000 for ~1 day).
     * @returns {Promise<{
     *     ixs: TransactionInstruction[],
     *     lookupTables: AddressLookupTableAccount[],
     *     signers: Keypair[]
     * }>} Object containing:
     * - ixs: Array of instructions to upgrade the Quartz user account.
     * - lookupTables: Array of lookup tables for building VersionedTransaction.
     * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
     * @throw Error if the RPC connection fails. The transaction will fail if the account does not require an upgrade.
     */
    public async makeUpgradeAccountIxs(
        spendLimitPerTransaction: BN,
        spendLimitPerTimeframe: BN,
        timeframeInSeconds: BN,
        nextTimeframeResetTimestamp: BN
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
        const ix_upgradeAccount = await this.program.methods
            .upgradeVault(
                spendLimitPerTransaction,
                spendLimitPerTimeframe,
                timeframeInSeconds,
                nextTimeframeResetTimestamp
            )
            .accounts({
                vault: this.vaultPubkey,
                owner: this.pubkey,
                initRentPayer: getInitRentPayerPublicKey(),
                systemProgram: SystemProgram.programId
            })
            .instruction();

        return {
            ixs: [ix_upgradeAccount],
            lookupTables: [this.quartzLookupTable],
            signers: []
        };
    }

    /**
     * Creates instructions to deposit a token into the Quartz user account.
     * @param amountBaseUnits - The amount of tokens to deposit.
     * @param marketIndex - The market index of the token to deposit.
     * @param reduceOnly - True means amount will be capped so a negative balance (loan) cannot become a positive balance (collateral).
     * @returns {Promise<{
     *     ixs: TransactionInstruction[],
     *     lookupTables: AddressLookupTableAccount[],
     *     signers: Keypair[]
     * }>} Object containing:
     * - ixs: Array of instructions to deposit the token into the Quartz user account.
     * - lookupTables: Array of lookup tables for building VersionedTransaction.
     * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
     * @throw Error if the RPC connection fails. The transaction will fail if the owner does not have enough tokens.
     */
    public async makeDepositIx(
        amountBaseUnits: number,
        marketIndex: MarketIndex,
        reduceOnly: boolean
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
        const mint = TOKENS[marketIndex].mint;
        const tokenProgram = await getTokenProgram(this.connection, mint);
        const ownerSpl = await getAssociatedTokenAddress(mint, this.pubkey, false, tokenProgram);

        const ix = await this.program.methods
            .deposit(new BN(amountBaseUnits), marketIndex, reduceOnly)
            .accounts({
                vault: this.vaultPubkey,
                vaultSpl: getVaultSplPublicKey(this.pubkey, mint),
                owner: this.pubkey,
                ownerSpl: ownerSpl,
                splMint: mint,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: getDriftStatePublicKey(),
                spotMarketVault: getDriftSpotMarketVaultPublicKey(marketIndex),
                tokenProgram: tokenProgram,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .remainingAccounts(
                this.driftUser.getRemainingAccounts(marketIndex)
            )
            .instruction();

        return {
            ixs: [ix],
            lookupTables: [this.quartzLookupTable],
            signers: []
        };
    }

    public async makeFulfilDepositIx(
        amountBaseUnits: number,
        marketIndex: MarketIndex,
        reduceOnly: boolean,
        caller: PublicKey
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
        const mint = TOKENS[marketIndex].mint;
        const tokenProgram = await getTokenProgram(this.connection, mint);
        const callerSpl = await getAssociatedTokenAddress(mint, caller, false, tokenProgram);

        const ix = await this.program.methods
            .fulfilDeposit(new BN(amountBaseUnits), marketIndex, reduceOnly)
            .accounts({
                vault: this.vaultPubkey,
                vaultSpl: getVaultSplPublicKey(this.pubkey, mint),
                owner: this.pubkey,
                caller: caller,
                callerSpl: callerSpl,
                splMint: mint,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: getDriftStatePublicKey(),
                spotMarketVault: getDriftSpotMarketVaultPublicKey(marketIndex),
                tokenProgram: tokenProgram,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .remainingAccounts(
                this.driftUser.getRemainingAccounts(marketIndex)
            )
            .instruction();

        return {
            ixs: [ix],
            lookupTables: [this.quartzLookupTable],
            signers: []
        };
    }

    /**
     * Creates instructions to iniaite a withdraw order from the Quartz user account, which will be fulfilled after the time lock.
     * @param amountBaseUnits - The amount of tokens to withdraw.
     * @param marketIndex - The market index of the token to withdraw.
     * @param reduceOnly - True means amount will be capped so a positive balance (collateral) cannot become a negative balance (loan).
     * @returns {Promise<{
    *     ixs: TransactionInstruction[],
    *     lookupTables: AddressLookupTableAccount[],
    *     signers: Keypair[]
    * }>} Object containing:
    * - ixs: Array of instructions to initiate a withdraw order.
    * - lookupTables: Array of lookup tables for building VersionedTransaction.
    * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
    * @throw Error if the RPC connection fails.
    */
    public async makeInitiateWithdrawIx(
        amountBaseUnits: number,
        marketIndex: MarketIndex,
        reduceOnly: boolean,
        paidByUser = false,
        destinationAddress = this.pubkey
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
        const orderAccount = Keypair.generate();
        const timeLockRentPayer = paidByUser
            ? this.pubkey
            : getTimeLockRentPayerPublicKey();

        const ix = await this.program.methods
            .initiateWithdraw(
                new BN(amountBaseUnits),
                marketIndex,
                reduceOnly
            )
            .accounts({
                vault: this.vaultPubkey,
                owner: this.pubkey,
                withdrawOrder: orderAccount.publicKey,
                timeLockRentPayer: timeLockRentPayer,
                systemProgram: SystemProgram.programId,
                destination: destinationAddress,
            })
            .instruction();

        return {
            ixs: [ix],
            lookupTables: [this.quartzLookupTable],
            signers: [orderAccount]
        };
    }

    /**
     * Creates instructions to withdraw a token from the Quartz user account.
     * @param orderAccount - The public key of the withdraw order, which must be created with the initiateWithdraw instruction.
     * @returns {Promise<{
     *     ixs: TransactionInstruction[],
     *     lookupTables: AddressLookupTableAccount[],
     *     signers: Keypair[]
     * }>} Object containing:
     * - ixs: Array of instructions to withdraw the token from the Quartz user account.
     * - lookupTables: Array of lookup tables for building VersionedTransaction.
     * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
     * @throw Error if the RPC connection fails. The transaction will fail if the account does not have enough tokens or, (when taking out a loan) the account health is not high enough for a loan.
     */
    public async makeFulfilWithdrawIx(
        orderAccount: PublicKey,
        caller: PublicKey
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
        const order = await this.program.account.withdrawOrder.fetch(orderAccount);

        const marketIndex = order.driftMarketIndex as MarketIndex;
        const timeLockRentPayer = order.timeLock.isOwnerPayer
            ? this.pubkey
            : getTimeLockRentPayerPublicKey();

        const mint = TOKENS[marketIndex].mint;
        const tokenProgram = await getTokenProgram(this.connection, mint);

        const destination = order.destination;
        const destinationSpl = await getAssociatedTokenAddress(mint, destination, false, tokenProgram);

        const destinationSplValue = order.driftMarketIndex === MARKET_INDEX_SOL
            ? QUARTZ_PROGRAM_ID // Program ID is treated as None for optional account (not required as wSOL is unwrapped in the ix)
            : destinationSpl; // If not wSOL, include ownerSpl

        const ix = await this.program.methods
            .fulfilWithdraw()
            .accounts({
                withdrawOrder: orderAccount,
                timeLockRentPayer: timeLockRentPayer,
                caller: caller,
                vault: this.vaultPubkey,
                mule: getWithdrawMulePublicKey(this.pubkey),
                owner: this.pubkey,
                splMint: mint,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: getDriftStatePublicKey(),
                spotMarketVault: getDriftSpotMarketVaultPublicKey(marketIndex),
                driftSigner: this.driftSigner,
                tokenProgram: tokenProgram,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                destination: destination,
                destinationSpl: destinationSplValue
            })
            .remainingAccounts(
                this.driftUser.getRemainingAccounts(marketIndex)
            )
            .instruction();

        return {
            ixs: [ix],
            lookupTables: [this.quartzLookupTable],
            signers: []
        };
    }

    /**
     * Creates instructions to iniate and order to adjust the spend limits of a Quartz user account.
     * @param spendLimitPerTransaction - The new spend limit per transaction.
     * @param spendLimitPerTimeframe - The new spend limit per timeframe.
     * @param timeframeInSeconds - The new timeframe in seconds.
     * @param nextTimeframeResetTimestamp - The new next timeframe reset timestamp.
     * @returns {Promise<{
    *     ixs: TransactionInstruction[],
    *     lookupTables: AddressLookupTableAccount[],
    *     signers: Keypair[]
    * }>} Object containing:
    * - ixs: Array of instructions to adjust the spend limits.
    * - lookupTables: Array of lookup tables for building VersionedTransaction.
    * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
    * @throw Error if the RPC connection fails. Or if the spend limits are invalid.
    */
    public async makeInitiateSpendLimitsIxs(
        spendLimitPerTransaction: BN,
        spendLimitPerTimeframe: BN,
        timeframeInSeconds: BN,
        nextTimeframeResetTimestamp: BN,
        paidByUser = false
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
        const orderAccount = Keypair.generate();
        const timeLockRentPayer = paidByUser
            ? this.pubkey
            : getTimeLockRentPayerPublicKey();

        const ix = await this.program.methods
            .initiateSpendLimits(
                spendLimitPerTransaction,
                spendLimitPerTimeframe,
                timeframeInSeconds,
                nextTimeframeResetTimestamp
            )
            .accounts({
                vault: this.vaultPubkey,
                owner: this.pubkey,
                spendLimitsOrder: orderAccount.publicKey,
                timeLockRentPayer: timeLockRentPayer,
                systemProgram: SystemProgram.programId
            })
            .instruction();

        return {
            ixs: [ix],
            lookupTables: [this.quartzLookupTable],
            signers: [orderAccount]
        };
    }

    /**
     * Creates instructions to update the card spend limits of a Quartz user account.
     * @param orderAccount - The public key of the spend limits order, which must be created with the initiateSpendLimits instruction.
     * @returns {Promise<{
    *     ixs: TransactionInstruction[],
    *     lookupTables: AddressLookupTableAccount[],
    *     signers: Keypair[]
    * }>} Object containing:
    * - ixs: Array of instructions to fulfil the spend limits order.
    * - lookupTables: Array of lookup tables for building VersionedTransaction.
    * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
    * @throw Error if the RPC connection fails.
    */
    public async makeFulfilSpendLimitsIx(
        orderAccount: PublicKey,
        caller: PublicKey
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
        const order = await this.program.account.spendLimitsOrder.fetch(orderAccount);
        const timeLockRentPayer = order.timeLock.isOwnerPayer
            ? this.pubkey
            : getTimeLockRentPayerPublicKey();

        const ix_fulfilSpendLimits = await this.program.methods
            .fulfilSpendLimits()
            .accounts({
                spendLimitsOrder: orderAccount,
                timeLockRentPayer: timeLockRentPayer,
                caller: caller,
                vault: this.vaultPubkey,
                owner: this.pubkey,
                systemProgram: SystemProgram.programId
            })
            .instruction();

        return {
            ixs: [ix_fulfilSpendLimits],
            lookupTables: [this.quartzLookupTable],
            signers: []
        };
    }

    /**
     * Creates instructions to spend using the Quartz card.
     * @param amountBaseUnits - The amount of tokens to spend.
     * @param spendCaller - The public key of the Quartz spend caller.
     * @param spendFee - True means a percentage of the spend will be sent to the spend fee address.
     * @returns {Promise<{
    *     ixs: TransactionInstruction[],
    *     lookupTables: AddressLookupTableAccount[],
    *     signers: Keypair[]
    * }>} Object containing:
    * - ixs: Array of instructions to repay the loan using collateral.
    * - lookupTables: Array of lookup tables for building VersionedTransaction.
    * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
    * @throw Error if the RPC connection fails. The transaction will fail if:
    * - the user does not have enough available tokens.
    * - the user's spend limit is exceeded.
    */
    public async makeSpendIxs(
        amountBaseUnits: number,
        spendCaller: Keypair,
        spendFee: boolean
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
        const messageSentEventData = Keypair.generate();

        const ix_startSpend = await this.program.methods
            .startSpend(
                new BN(amountBaseUnits),
                spendFee
            )
            .accounts({
                vault: this.vaultPubkey,
                owner: this.pubkey,
                spendCaller: spendCaller.publicKey,
                spendFeeDestination: SPEND_FEE_DESTINATION,
                mule: getSpendMulePublicKey(this.pubkey),
                usdcMint: TOKENS[MARKET_INDEX_USDC].mint,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: getDriftStatePublicKey(),
                spotMarketVault: getDriftSpotMarketVaultPublicKey(MARKET_INDEX_USDC),
                driftSigner: this.driftSigner,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                systemProgram: SystemProgram.programId,
            })
            .remainingAccounts(
                this.driftUser.getRemainingAccounts(MARKET_INDEX_USDC)
            )
            .instruction();

        const ix_completeSpend = await this.program.methods
            .completeSpend()
            .accounts({
                vault: this.vaultPubkey,
                owner: this.pubkey,
                spendCaller: spendCaller.publicKey,
                mule: getSpendMulePublicKey(this.pubkey),
                usdcMint: TOKENS[MARKET_INDEX_USDC].mint,
                bridgeRentPayer: getBridgeRentPayerPublicKey(),
                senderAuthorityPda: getSenderAuthority(),
                messageTransmitter: getMessageTransmitter(),
                tokenMessenger: getTokenMessenger(),
                remoteTokenMessenger: getRemoteTokenMessenger(),
                tokenMinter: getTokenMinter(),
                localToken: getLocalToken(),
                messageSentEventData: messageSentEventData.publicKey,
                eventAuthority: getEventAuthority(),
                messageTransmitterProgram: MESSAGE_TRANSMITTER_PROGRAM_ID,
                tokenMessengerMinterProgram: TOKEN_MESSAGE_MINTER_PROGRAM_ID,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                systemProgram: SystemProgram.programId,
            })
            .instruction();

        return {
            ixs: [ix_startSpend, ix_completeSpend],
            lookupTables: [this.quartzLookupTable],
            signers: [spendCaller, messageSentEventData]
        }
    }

    /**
     * Creates instructions to repay a loan using collateral.
     * @param caller - The public key of the caller, this can be the owner or someone else if account health is 0%.
     * @param depositMarketIndex - The market index of the loan token to deposit.
     * @param withdrawMarketIndex - The market index of the collateral token to withdraw.
     * @param swapInstruction - The swap instruction to use. Deposit and withdrawn amounts are calculated by the balance change after this instruction.
     * @param requireOwnerSignature - True means the owner must sign the transaction. This is for manually marking the account info when two signers are required.
     * @returns {Promise<{
     *     ixs: TransactionInstruction[],
     *     lookupTables: AddressLookupTableAccount[],
     *     signers: Keypair[]
     * }>} Object containing:
     * - ixs: Array of instructions to repay the loan using collateral.
     * - lookupTables: Array of lookup tables for building VersionedTransaction.
     * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
     * @throw Error if the RPC connection fails. The transaction will fail if:
     * - the caller does not have enough tokens.
     * - the account health is above 0% and the caller is not the owner.
     * - the account health is 0% and the caller is not the owner, but the health has not increased above 0% after the repay.
     */
    public async makeCollateralRepayIxs(
        caller: PublicKey,
        depositMarketIndex: MarketIndex,
        withdrawMarketIndex: MarketIndex,
        swapInstruction: TransactionInstruction,
        requireOwnerSignature = false
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
        const depositMint = TOKENS[depositMarketIndex].mint;
        const withdrawMint = TOKENS[withdrawMarketIndex].mint;

        const [
            depositTokenProgram,
            withdrawTokenProgram
        ] = await Promise.all([
            getTokenProgram(this.connection, depositMint),
            getTokenProgram(this.connection, withdrawMint)
        ]);

        const [
            callerDepositSpl,
            callerWithdrawSpl
        ] = await Promise.all([
            getAssociatedTokenAddress(depositMint, caller, false, depositTokenProgram),
            getAssociatedTokenAddress(withdrawMint, caller, false, withdrawTokenProgram)
        ]);

        const driftState = getDriftStatePublicKey();
        const collateralRepayLedger = getCollateralRepayLedgerPublicKey(this.pubkey);

        const startCollateralRepayPromise = this.program.methods
            .startCollateralRepay()
            .accounts({
                caller: caller,
                callerDepositSpl: callerDepositSpl,
                callerWithdrawSpl: callerWithdrawSpl,
                owner: this.pubkey,
                vault: this.vaultPubkey,
                mintDeposit: depositMint,
                mintWithdraw: withdrawMint,
                tokenProgramDeposit: depositTokenProgram,
                tokenProgramWithdraw: withdrawTokenProgram,
                systemProgram: SystemProgram.programId,
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                ledger: collateralRepayLedger
            })
            .instruction();

        const depositCollateralRepayPromise = this.program.methods
            .depositCollateralRepay(depositMarketIndex)
            .accounts({
                caller: caller,
                callerSpl: callerDepositSpl,
                owner: this.pubkey,
                vault: this.vaultPubkey,
                vaultSpl: getVaultSplPublicKey(this.pubkey, depositMint),
                splMint: depositMint,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: driftState,
                spotMarketVault: getDriftSpotMarketVaultPublicKey(depositMarketIndex),
                tokenProgram: depositTokenProgram,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                ledger: collateralRepayLedger
            })
            .remainingAccounts(
                this.driftUser.getRemainingAccounts(depositMarketIndex)
            )
            .instruction();

        const withdrawCollateralRepayPromise = this.program.methods
            .withdrawCollateralRepay(withdrawMarketIndex)
            .accounts({
                caller: caller,
                callerSpl: callerWithdrawSpl,
                owner: this.pubkey,
                vault: this.vaultPubkey,
                vaultSpl: getVaultSplPublicKey(this.pubkey, withdrawMint),
                splMint: withdrawMint,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: driftState,
                spotMarketVault: getDriftSpotMarketVaultPublicKey(withdrawMarketIndex),
                driftSigner: this.driftSigner,
                tokenProgram: withdrawTokenProgram,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                depositPriceUpdate: getPythOracle(depositMarketIndex),
                withdrawPriceUpdate: getPythOracle(withdrawMarketIndex),
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                ledger: collateralRepayLedger
            })
            .remainingAccounts(
                this.driftUser.getRemainingAccounts(withdrawMarketIndex)
            )
            .instruction();

        const [
            ix_startCollateralRepay,
            ix_depositCollateralRepay,
            ix_withdrawCollateralRepay
        ] = await Promise.all([
            startCollateralRepayPromise,
            depositCollateralRepayPromise,
            withdrawCollateralRepayPromise
        ]);

        // Mark the owner as a signer if the caller is not the owner
        if (requireOwnerSignature) {
            for (const ix of [ix_startCollateralRepay, ix_depositCollateralRepay, ix_withdrawCollateralRepay]) {
                const ownerAccountMeta = ix.keys.find(key => key.pubkey.equals(this.pubkey));
                if (ownerAccountMeta) {
                    ownerAccountMeta.isSigner = true;
                }
            }
        }

        return {
            ixs: [
                ix_startCollateralRepay,
                swapInstruction,
                ix_depositCollateralRepay,
                ix_withdrawCollateralRepay
            ],
            lookupTables: [this.quartzLookupTable],
            signers: []
        };
    }
}
