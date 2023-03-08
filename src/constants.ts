export enum AddressType {
  P2PKH,
  P2WPKH,
  P2TR,
}

export enum NetworkType {
  MAINNET,
  TESTNET,
}

export const NETWORK_TYPES = [
  {
    value: NetworkType.MAINNET,
    label: "LIVENET",
    name: "livenet",
    validNames: [0, "livenet", "mainnet"],
  },
  {
    value: NetworkType.TESTNET,
    label: "TESTNET",
    name: "testnet",
    validNames: ["testnet"],
  },
];
