import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AccountNotFoundError, generateSigner, keypairIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";
import { join } from "path";
import { readFileSync, existsSync } from "fs";

const connection = new Connection(clusterApiUrl("devnet"))

const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

function getCollectionAddress() {
    const collectionAddressFilePath = join(process.cwd(), 'data', 'collection-address.json');
    
    if (!existsSync(collectionAddressFilePath)) {
        throw new Error('Collection address file not found. Please run create-collection.ts first.');
    }
    
    const collectionData = JSON.parse(readFileSync(collectionAddressFilePath, 'utf8'));
    return publicKey(collectionData.address);
}

const collectionAddress = getCollectionAddress();

console.log(`Using collection address: ${collectionAddress}`);
console.log(`Creating NFT...`);

const mint = generateSigner(umi);

const transaction = createNft(umi, {
    mint,
    name: "Sunsteel Ember",
    symbol: "SSE",
    uri: "https://raw.githubusercontent.com/ARMIN11DSE/solana-new-nft/main/metadata/nft-metadata.json",
    sellerFeeBasisPoints: percentAmount(0),
    collection: {
        key: collectionAddress,
        verified: false
    },
});

await transaction.sendAndConfirm(umi);

console.log("Transaction confirmed, fetching digital asset...");

let createdNft;
let retries = 0;
const maxRetries = 10;

while (retries < maxRetries) {
    try {
        createdNft = await fetchDigitalAsset(
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

console.log(
    `Created NFT! Address is ${getExplorerLink(
        "address",
        createdNft!.mint.publicKey,
        "devnet")}`
);
