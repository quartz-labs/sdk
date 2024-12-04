import { DriftClient, fetchUserAccountsUsingKeys as fetchDriftAccountsUsingKeys } from "@drift-labs/sdk";
import { QUARTZ_ADDRESS_TABLE, QUARTZ_PROGRAM_ID, SUPPORTED_DRIFT_MARKETS } from "./config/constants";
import quartzIdl from "./idl/quartz.json";
import { Quartz } from "./types/quartz.js";
import { AnchorProvider, Idl, Program, setProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, AddressLookupTableAccount } from "@solana/web3.js";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import { PublicKey } from "@solana/web3.js";
import { QuartzUser } from "./user";
import { getDriftUser, getVaultPubkey } from "./helpers";

export class QuartzClient {
    private connection: Connection;
    private wallet: Wallet;
    private program: Program<Quartz>;
    private quartzAddressTable: AddressLookupTableAccount;

    private driftClient: DriftClient;
    private oracles: Map<string, PublicKey>;

    constructor(
        connection: Connection,
        wallet: Wallet,
        program: Program<Quartz>,
        quartzAddressTable: AddressLookupTableAccount,
        driftClient: DriftClient,
        oracles: Map<string, PublicKey>
    ) {
        this.connection = connection;
        this.wallet = wallet;
        this.program = program;
        this.quartzAddressTable = quartzAddressTable;
        this.driftClient = driftClient;
        this.oracles = oracles;
    }

    static async initialize(
        connection: Connection, 
        wallet: Wallet
    ) {
        const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
        setProvider(provider);
        const program = new Program(quartzIdl as Idl, QUARTZ_PROGRAM_ID, provider) as unknown as Program<Quartz>;

        const quartzLookupTable = await connection.getAddressLookupTable(QUARTZ_ADDRESS_TABLE).then((res) => res.value);
        if (!quartzLookupTable) throw Error("Address Lookup Table account not found");

        const driftClient = new DriftClient({
            connection,
            wallet,
            env: 'mainnet-beta',
            userStats: false,
            perpMarketIndexes: [],
            spotMarketIndexes: SUPPORTED_DRIFT_MARKETS,
            accountSubscription: {
                type: 'websocket',
                commitment: "confirmed"
            }
        });
        await driftClient.subscribe();

        const pythSolanaReceiver = new PythSolanaReceiver({ connection, wallet });
        const oracles = new Map<string, PublicKey>([
            ["SOL/USD", pythSolanaReceiver.getPriceFeedAccountAddress(0, 
                "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d")],
            ["USDC/USD", pythSolanaReceiver.getPriceFeedAccountAddress(0, 
                "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a")]
        ]);

        return new QuartzClient(
            connection, 
            wallet, 
            program, 
            quartzLookupTable,
            driftClient,
            oracles
        );
    }

    public async getAllAccountPubkeys(): Promise<PublicKey[]> {
        return (
            await this.program.account.vault.all()
        ).map((vault) => vault.publicKey);
    }

    public async getQuartzAccount(pubkey: PublicKey): Promise<QuartzUser> {
        const vault = getVaultPubkey(pubkey);
        await this.program.account.vault.fetch(vault); // Check account exists
        return new QuartzUser(pubkey, this.connection, this.driftClient);
    }

    public async getMultipleQuartzAccounts(pubkeys: PublicKey[]): Promise<QuartzUser[]> {
        if (pubkeys.length === 0) return [];

        const vaults = pubkeys.map((pubkey) => getVaultPubkey(pubkey));
        const accounts = await this.program.account.vault.fetchMultiple(vaults);

        accounts.forEach((account, index) => {
            if (account === null) throw Error(`Account not found for pubkey: ${pubkeys[index].toBase58()}`)
        });

        const driftUsers = await fetchDriftAccountsUsingKeys(
            this.connection,
            this.driftClient.program,
            vaults.map((vault) => getDriftUser(vault))
        )

        const undefinedIndex = driftUsers.findIndex(user => !user);
        if (undefinedIndex !== -1) {
            throw new Error(`[${this.wallet?.publicKey}] Failed to fetch drift user for vault ${vaults[undefinedIndex].toBase58()}`);
        }

        return driftUsers.map((driftUser, index) => {
            return new QuartzUser(pubkeys[index], this.connection, this.driftClient, driftUser)
        });
    }
}
