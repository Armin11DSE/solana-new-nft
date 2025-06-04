import { createNft } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { logDigitalAssetInfo, safeFetchDigitalAsset, saveDigitalAssetAddress, setupUmiInstance } from "./utils";

const umi = await setupUmiInstance();

const collectionMint = generateSigner(umi);

const transaction = createNft(umi, {
    mint: collectionMint,
    name: "SolForge",
    symbol: "SFRG",
    uri: "https://raw.githubusercontent.com/ARMIN11DSE/solana-new-nft/main/metadata/collection-metadata.json",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
});

await transaction.sendAndConfirm(umi);

console.log("Transaction confirmed, fetching digital asset...");

const createdCollectionNft = await safeFetchDigitalAsset(umi, collectionMint);

const collectionAddressData = {
    address: collectionMint.publicKey,
};

saveDigitalAssetAddress(collectionAddressData, "collection-address.json");

logDigitalAssetInfo(createdCollectionNft, "Collection");

console.log('-'.repeat(40))
