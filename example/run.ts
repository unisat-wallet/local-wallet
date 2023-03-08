import { AddressType, NetworkType } from "../src/constants";
import { Wallet } from "../src/index";
const run = async () => {
  try {
    const wallet = new Wallet("xxx", NetworkType.TESTNET, AddressType.P2WPKH);

    const signature = await wallet.signMessage("hello world");
    console.log("signature: ", signature);

    const signedPsbtHex = await wallet.signPsbt("xxx");
    console.log(signedPsbtHex);
  } catch (e) {
    console.log(e);
  }
};

run();
