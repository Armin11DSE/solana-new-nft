import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AccountNotFoundError, generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"))

const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionMint = generateSigner(umi);

const transaction = createNft(umi, {
    mint: collectionMint,
    name: "SolForge",
    symbol: "SFRG",
    uri: "https://raw.githubusercontent.com/ARMIN11DSE/solana-new-nft/main/metadata/metadata.json",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
});

await transaction.sendAndConfirm(umi);

console.log("Transaction confirmed, fetching digital asset...");

let createdCollectionNft;
let retries = 0;
const maxRetries = 10;

while (retries < maxRetries) {
    try {
        createdCollectionNft = await fetchDigitalAsset(
            umi,
            collectionMint.publicKey,
        );
        break;
    } catch (error) {
        if (error instanceof AccountNotFoundError && retries < maxRetries - 1) {
            console.log(`Attempt ${retries + 1} failed, retrying in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            retries++;
        } else {
            throw error;
        }
    }
}

console.log(
    `Created Collection!\n Address is ${getExplorerLink(
        "address",
        createdCollectionNft!.mint.publicKey,
        "devnet"
    )})`
)