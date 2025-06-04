import { createNft } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { getDigitalAssetAddress, logDigitalAssetInfo, safeFetchDigitalAsset, saveDigitalAssetAddress, setupUmiInstance } from "./utils";

const umi = await setupUmiInstance();

const collectionAddress = getDigitalAssetAddress("collection-address.json");

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

const createdNft = await safeFetchDigitalAsset(umi, mint);

const nftAddressData = {
    address: mint.publicKey,
};

saveDigitalAssetAddress(nftAddressData, "nft-address.json");

logDigitalAssetInfo(createdNft, "NFT");

console.log('-'.repeat(40))
