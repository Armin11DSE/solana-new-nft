import { DigitalAsset, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { keypairIdentity, KeypairSigner, publicKey, Umi } from "@metaplex-foundation/umi";
import { join } from "path";
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";


export async function loadUser(): Promise<Keypair> {
    const connection = new Connection(clusterApiUrl("devnet"));

    const user = await getKeypairFromFile();

    await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

    console.log("Loaded user", user.publicKey.toBase58());

    return user;
}

export async function setupUmiInstance(): Promise<Umi> {
    const user = await loadUser();

    const connection = new Connection(clusterApiUrl("devnet"));

    const umi = createUmi(connection.rpcEndpoint);
    umi.use(mplTokenMetadata());

    const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
    umi.use(keypairIdentity(umiUser));

    console.log("Set up Umi instance for user");

    return umi;
}

export function getDigitalAssetAddress(fileName: string) {
    const folderName = "data";
    const assetAddressFilePath = join(process.cwd(), folderName, fileName);

    if (!existsSync(assetAddressFilePath)) {
        throw new Error('Address file not found');
    }

    const assetData = JSON.parse(readFileSync(assetAddressFilePath, 'utf8'));
    return publicKey(assetData.address);
}

export async function safeFetchDigitalAsset(umi: Umi, mint: KeypairSigner): Promise<DigitalAsset> {
    let createdAsset;
    let retries = 0;
    const maxRetries = 10;

    while (retries < maxRetries) {
        try {
            createdAsset = await fetchDigitalAsset(
                umi,
                mint.publicKey,
            );
            break;
        } catch (error) {
            if (error instanceof Error && error.name == "AccountNotFoundError" && retries < maxRetries - 1) {
                console.log(`Attempt ${retries + 1} failed, retrying in 2 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                retries++;
            } else {
                throw error;
            }
        }
    }
    return createdAsset!;
}

export function logDigitalAssetInfo(asset: DigitalAsset, assetName: string = "Digital Asset") {
    console.log(
        `Created ${assetName}!\n Address is ${getExplorerLink(
            "address",
            asset.mint.publicKey,
            "devnet"
        )})`
    )
}

export function saveDigitalAssetAddress(jsonData: any, fileName: string) {
    const folderName = "data";
    const dataDir = join(process.cwd(), folderName);
    if (!existsSync(dataDir)) {
        mkdirSync(dataDir, { });
    }
    
    writeFileSync(
        join(dataDir, fileName),
        JSON.stringify(jsonData),
    );
}
