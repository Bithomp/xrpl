import axios from "axios";
import * as AddressCodec from "ripple-address-codec";

interface FaucetNetworkInterface {
  url: string;
  format?: string;
}

interface AxiosFaucetOptionsDataInterface {
  destination: string;
}

interface AxiosFaucetOptionsInterface {
  method: string;
  url: string;
  data?: AxiosFaucetOptionsDataInterface;
}

interface XrplLabsSuccessResponseInterface {
  address: string;
  secret: string;
  xrp: number;
  hash: string;
  code: string;
}

interface XrplSuccessResponseAccountInterface {
  xAddress: string;
  secret?: string;
  classicAddress: string;
  address: string;
}

interface XrplSuccessResponseInterface {
  account: XrplSuccessResponseAccountInterface;
  amount: number;
  balance: number;
  hash?: string;
}

// List of facuet networks
export const FaucetNetworks = {
  test: {
    // test, testnet, or testnet.altnet are all the same
    // https://test.bithomp.com
    url: "https://faucet.altnet.rippletest.net/accounts",
    format: "xrpl",
  },
  dev: {
    // dev, devnet, or devnet.altnet are all the same
    // https://dev.bithomp.com
    url: "https://faucet.devnet.rippletest.net/accounts",
    format: "xrpl",
  },
  "xahau-test": {
    // beta, hooks-testnet-v3, hooks-v3, beta, xahau-test are all the same
    // https://test.xahauexplorer.com
    url: "https://xahau-test.net/newcreds",
    format: "xrpl-labs",
  },
  "xahau-jshooks": {
    // https://jshooks.xahauexplorer.com
    url: "https://jshooks.xahau-test.net/newcreds",
    format: "xrpl-labs",
  },
};

export function getFaucetNetwork(network: string): FaucetNetworkInterface | undefined {
  if (network in FaucetNetworks) {
    return FaucetNetworks[network];
  }

  return undefined;
}

export async function foundWallet(network: string | FaucetNetworkInterface, account?: string): Promise<any> {
  if (typeof network === "string") {
    network = getFaucetNetwork(network) as FaucetNetworkInterface; // eslint-disable-line no-param-reassign
  }

  if (!network) {
    throw new Error("Invalid network");
  }

  const options = getAxiosFaucetOptions(network, account);
  const data = (await axios(options)).data;

  // return xrpl-labs SUCCESS response in xrpl format
  if (network.format === "xrpl-labs" && data.code === "tesSUCCESS") {
    // {
    //   address: 'rh19DztENXTjC2xPpjFXULmDzWdkS479Zx',
    //   secret: 's____________________________',
    //   xrp: 10000,
    //   hash: '74BCB80645EA4F194EB2AF0CB97671B9E85F6A03CA037EB37A16D467D45DF0D2',
    //   code: 'tesSUCCESS'
    // }

    return xrplLabsToXrplResponse(data);
  }

  // {
  //   account: {
  //     xAddress: 'TVaRHtuHAZAPhfy7gBqnP1uEWvgqnrae4h7MZzpuxs9mapV',
  //     secret: 's____________________________',
  //     classicAddress: 'rDgvtnmeAY3o1pjcBwN2RZhqwLg6tV7r4w',
  //     address: 'rDgvtnmeAY3o1pjcBwN2RZhqwLg6tV7r4w'
  //   },
  //   amount: 1000,
  //   balance: 1000
  // }
  return data;
}

export function getAxiosFaucetOptions(network: FaucetNetworkInterface, account?: string): AxiosFaucetOptionsInterface {
  const options: AxiosFaucetOptionsInterface = {
    method: "post",
    url: network.url,
  };

  if (account) {
    if (network.format === "xrpl-labs") {
      options.url += `?account=${account}`;
    } else {
      options.data = { destination: account };
    }
  }

  return options;
}

export function xrplLabsToXrplResponse(data: XrplLabsSuccessResponseInterface): XrplSuccessResponseInterface {
  const secret: string | undefined = data.secret === "" ? undefined : data.secret;
  const balance: number | undefined = secret ? data.xrp : undefined;
  const response: any = {
    account: {
      xAddress: AddressCodec.classicAddressToXAddress(data.address, false, true),
      classicAddress: data.address,
      address: data.address,
    },
    amount: data.xrp,
    hash: data.hash,
  };

  if (secret) {
    response.account.secret = secret;
  }

  if (balance) {
    response.balance = balance;
  }

  return response;
}
