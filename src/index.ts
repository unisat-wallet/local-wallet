import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
bitcoin.initEccLib(ecc);
import ECPairFactory from "ecpair";
import { publicKeyToAddress, toPsbtNetwork, validator } from "./utils";
import { AddressType, NetworkType, NETWORK_TYPES } from "./constants";
const ECPair = ECPairFactory(ecc);
import { SimpleKeyring } from "@unisat/bitcoin-simple-keyring";

export interface ToSignInput {
  index: number;
  publicKey: string;
}
export class Wallet {
  keyring: SimpleKeyring;
  addressType: AddressType;
  networkType: NetworkType;
  private pubkey: string;
  constructor(wif: string, networkType: NetworkType, addressType: AddressType) {
    const network = toPsbtNetwork(networkType);
    const keyPair = ECPair.fromWIF(wif, network);
    this.keyring = new SimpleKeyring([keyPair.privateKey.toString("hex")]);
    this.networkType = networkType;
    this.addressType = addressType;
    this.pubkey = keyPair.publicKey.toString("hex");
  }

  async requestAccounts() {
    return this.getAccounts();
  }

  async getAccounts() {
    const address = publicKeyToAddress(
      this.pubkey,
      this.addressType,
      this.networkType
    );
    return [address];
  }

  async getNetwork() {
    return NETWORK_TYPES[this.networkType].name;
  }

  async switchNetwork(network: string) {
    if (NETWORK_TYPES[NetworkType.MAINNET].validNames.includes(network)) {
      this.networkType = NetworkType.MAINNET;
    } else if (
      NETWORK_TYPES[NetworkType.TESTNET].validNames.includes(network)
    ) {
      this.networkType = NetworkType.TESTNET;
    } else {
      throw new Error(
        `the network is invalid, supported networks: ${NETWORK_TYPES.map(
          (v) => v.name
        ).join(",")}`
      );
    }
    return this.getNetwork();
  }

  async getPublicKey() {
    return this.pubkey;
  }

  async getBalance() {
    return {
      confirmed: 0,
      unconfirmed: 0,
      total: 0,
    };
  }

  async sendBitcoin({ toAddress, satoshis }) {
    throw new Error("not implemented in abstract wallet");
  }

  async signMessage(text: string) {
    return this.keyring.signMessage(this.pubkey, text);
  }

  async signTx() {
    throw new Error("not implemented in abstract wallet");
  }

  async pushTx() {
    throw new Error("not implemented in abstract wallet");
  }

  async signPsbt(psbtHex: string, inputs?: ToSignInput[]) {
    const psbtNetwork = toPsbtNetwork(this.networkType);
    const psbt = bitcoin.Psbt.fromHex(psbtHex, { network: psbtNetwork });
    const currentAddress = publicKeyToAddress(
      this.pubkey,
      this.addressType,
      this.networkType
    );
    if (!inputs) {
      const toSignInputs: ToSignInput[] = [];
      psbt.data.inputs.forEach((v, index) => {
        const script = v.witnessUtxo?.script || v.nonWitnessUtxo;
        if (script) {
          const address = bitcoin.address.fromOutputScript(script, psbtNetwork);
          console.log(address, currentAddress);
          if (currentAddress === address) {
            toSignInputs.push({
              index,
              publicKey: this.pubkey,
            });
          }
        }
      });
      inputs = toSignInputs;
    }
    this.keyring.signTransaction(psbt, inputs);
    psbt.validateSignaturesOfAllInputs(validator);
    psbt.finalizeAllInputs();
    return psbt.toHex();
  }

  async pushPsbtTx() {
    throw new Error("not implemented in abstract wallet");
  }
}
