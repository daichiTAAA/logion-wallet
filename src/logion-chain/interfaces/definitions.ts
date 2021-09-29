/* eslint-disable import/no-anonymous-default-export */
export default {
    types: {
        Address: "MultiAddress",
        LookupSource: "MultiAddress",
        PeerId: "(Vec<u8>)",
        AccountInfo: "AccountInfoWithDualRefCount",
        TAssetBalance: "u128",
        AssetId: "u64",
        AssetDetails: {
            owner: "AccountId",
            issuer: "AccountId",
            admin: "AccountId",
            freezer: "AccountId",
            supply: "Balance",
            deposit: "DepositBalance",
            max_zombies: "u32",
            min_balance: "Balance",
            zombies: "u32",
            accounts: "u32",
            is_frozen: "bool"
        },
        AssetMetadata: {
            deposit: "DepositBalance",
            name: "Vec<u8>",
            symbol: "Vec<u8>",
            decimals: "u8"
        },
        LocId: "u128",
        LegalOfficerCaseOf: {
            owner: "AccountId",
            requester: "AccountId",
            metadata: "Vec<MetadataItem>"
        },
        MetadataItem: {
            name: "Vec<u8>",
            value: "Vec<u8>"
        }
    }
};