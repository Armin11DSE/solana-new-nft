import { findMetadataPda, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { getExplorerLink } from "@solana-developers/helpers";
import { getDigitalAssetAddress, setupUmiInstance } from "./utils";

const umi = await setupUmiInstance();

const collectionAddress = getDigitalAssetAddress("collection-address.json");
const nftAddress = getDigitalAssetAddress("nft-address.json");

const transaction = verifyCollectionV1(
    umi,
    {
        metadata: findMetadataPda(umi, { mint: nftAddress }),
        collectionMint: collectionAddress,
        authority: umi.identity,
    },
);

await transaction.sendAndConfirm(umi);

console.log(`NFT ${nftAddress} verified as member of collection ${collectionAddress}!\nSee Explorer at ${getExplorerLink("address", nftAddress, "devnet")}`);
