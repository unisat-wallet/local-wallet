import Signature from "bitcore-lib/lib/crypto/signature";
import { AddressType, NetworkType } from "../src/constants";
import { Wallet } from "../src/index";
const run = async () => {
  try {
    const wallet = new Wallet("WIF", NetworkType.TESTNET, AddressType.P2WPKH);

    const signature = await wallet.signMessage("hello world");
    console.log("signature: ", signature);

    const signedPsbtHex = await wallet.signPsbt("psbthex", [
      {
        index: 0,
        publicKey: await wallet.getPublicKey(),
        sighashTypes: [
          Signature.SIGHASH_ANYONECANPAY | Signature.SIGHASH_SINGLE,
        ],
      },
    ]);
    console.log(signedPsbtHex);
  } catch (e) {
    console.log(e);
  }
};

run();
