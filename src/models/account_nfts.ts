import * as assert from "assert";
import BigNumber from "bignumber.js";
import AddressCodec = require("ripple-address-codec");

import { NFTokenMintFlags, NFTokenCreateOfferFlags } from "xrpl";
import { removeUndefined } from "../v1/common";
import { parseFlags } from "../common/utils";

export interface NFTokenInterface {
  Flags: number;
  Issuer: string;
  TokenID: string;
  TokenTaxon: number;
  TransferFee: number;
  Sequence: number;
}

export interface AccountNFTokenInterface {
  Flags: number;
  Issuer: string;
  TokenID: string;
  TokenTaxons: number;
  nft_serial: number;
}

export const NFTokenFlagsKeys = {
  burnable: NFTokenMintFlags.tfBurnable,
  onlyXRP: NFTokenMintFlags.tfOnlyXRP,
  trustLine: NFTokenMintFlags.tfTrustLine,
  transferable: NFTokenMintFlags.tfTransferable,
  // reservedFlag: NFTokenMintFlags.tfReservedFlag,
};

export interface NFTokenFlagsKeysInterface {
  burnable?: boolean;
  onlyXRP?: boolean;
  trustLine?: boolean;
  transferable?: boolean;
  // reservedFlag?: boolean
}

export function parseNFTokenFlags(value: number, options: { excludeFalse?: boolean } = {}): NFTokenFlagsKeysInterface {
  return parseFlags(value, NFTokenFlagsKeys, options);
}

export interface NFTokenOfferFlagsKeysInterface {
  sellToken?: boolean;
}

export const NFTokenOfferFlagsKeys = {
  sellToken: NFTokenCreateOfferFlags.tfSellToken,
};

export function parseNFTOfferFlags(
  value: number,
  options: { excludeFalse?: boolean } = {}
): NFTokenOfferFlagsKeysInterface {
  return parseFlags(value, NFTokenOfferFlagsKeys, options);
}

export function cipheredTaxon(tokenSeq: number, taxon: number) {
  // An issuer may issue several NFTs with the same taxon; to ensure that NFTs
  // are spread across multiple pages we lightly mix the taxon up by using the
  // sequence (which is not under the issuer's direct control) as the seed for
  // a simple linear congruential generator.
  //
  // From the Hull-Dobell theorem we know that f(x)=(m*x+c) mod n will yield a
  // permutation of [0, n) when n is a power of 2 if m is congruent to 1 mod 4
  // and c is odd.
  //
  // Here we use m = 384160001 and c = 2459. The modulo is implicit because we
  // use 2^32 for n and the arithmetic gives it to us for "free".
  //
  // Note that the scramble value we calculate is not cryptographically secure
  // but that's fine since all we're looking for is some dispersion.
  //
  // **IMPORTANT** Changing these numbers would be a breaking change requiring
  //               an amendment along with a way to distinguish token IDs that
  //               were generated with the old code.
  // tslint:disable-next-line:no-bitwise
  return taxon ^ (384160001 * tokenSeq + 2459);
}

/**
 * 000B 0C44 95F14B0E44F78A264E41713C64B5F89242540EE2 BC8B858E 00000D65
 * +--- +--- +--------------------------------------- +------- +-------
 * |    |    |                                        |        |
 * |    |    |                                        |        `---> Sequence: 3,429
 * |    |    |                                        |
 * |    |    |                                        `---> Taxon: 146,999,694
 * |    |    |
 * |    |    `---> Issuer: rNCFjv8Ek5oDrNiMJ3pw6eLLFtMjZLJnf2
 * |    |
 * |    `---> TransferFee: 314.0 bps or 3.140%
 * |
 * `---> Flags: 11 -> lsfBurnable, lsfOnlyXRP and lsfTransferable
 */
export function parseNFTokenID(tokenID: string): NFTokenInterface | null {
  if (typeof tokenID !== "string" || tokenID.length !== 64) {
    return null;
  }

  const flags = new BigNumber(tokenID.slice(0, 4), 16).toNumber();
  const transferFee = new BigNumber(tokenID.slice(4, 8), 16).toNumber();
  const issuer = AddressCodec.encodeAccountID(Buffer.from(tokenID.slice(8, 48), "hex"));
  const scrambledTaxon = new BigNumber(tokenID.slice(48, 56), 16).toNumber();
  const sequence = new BigNumber(tokenID.slice(56, 64), 16).toNumber();

  return {
    TokenID: tokenID,
    Flags: flags,
    TransferFee: transferFee,
    Issuer: issuer,
    TokenTaxon: cipheredTaxon(sequence, scrambledTaxon),
    Sequence: sequence,
  };
}

interface FormattedNFTokenBurn {
  account: string;
  tokenID: string;
}

export function parseNFTokenBurn(tx: any): FormattedNFTokenBurn {
  assert.ok(tx.TransactionType === "NFTokenBurn");

  return removeUndefined({
    account: tx.Account,
    tokenID: tx.TokenID,
  });
}

interface FormattedNFTokenMint {
  tokenTaxon: number;
  issuer?: string;
  transferFee?: number;
  uri?: string;
  flags?: NFTokenFlagsKeysInterface;
}

export function parseNFTokenMint(tx: any): FormattedNFTokenMint {
  assert.ok(tx.TransactionType === "NFTokenMint");

  return removeUndefined({
    tokenTaxon: tx.TokenTaxon,
    issuer: tx.Issuer,
    transferFee: tx.TransferFee,
    uri: tx.URI,
    flags: parseNFTokenFlags(tx.Flags),
  });
}

interface FormattedNFTokenCancelOffer {
  tokenOffers: string[];
}

export function parseNFTokenCancelOffer(tx: any): FormattedNFTokenCancelOffer {
  assert.ok(tx.TransactionType === "NFTokenCancelOffer");

  return removeUndefined({
    tokenOffers: tx.TokenOffers,
  });
}

interface FormattedNFTokenCreateOffer {
  tokenID: string;
  amount: string;
  owner?: string;
  destination?: string;
  expiration?: number;
  flags?: NFTokenOfferFlagsKeysInterface;
}

export function parseNFTokenCreateOffer(tx: any): FormattedNFTokenCreateOffer {
  assert.ok(tx.TransactionType === "NFTokenCreateOffer");

  return removeUndefined({
    tokenID: tx.TokenID,
    amount: tx.Amount,
    owner: tx.Owner,
    destination: tx.Destination,
    expiration: tx.Expiration,
    flags: parseNFTOfferFlags(tx.Flags),
  });
}

interface FormattedNFTokenAcceptOffer {
  sellOffer?: string;
  buyOffer?: string;
  brokerFee?: string;
}

export function parseNFTokenAcceptOffer(tx: any): FormattedNFTokenAcceptOffer {
  assert.ok(tx.TransactionType === "NFTokenAcceptOffer");

  return removeUndefined({
    sellOffer: tx.SellOffer,
    buyOffer: tx.BuyOffer,
    brokerFee: tx.BrokerFee,
  });
}

export function parseNonFungibleTokenChanges(tx: any): any {
  const changes = {};

  if (tx.meta.AffectedNodes.length === 0) {
    return changes;
  }

  for (const node of tx.meta.AffectedNodes) {
    // added NFToken
    if (
      node.CreatedNode?.LedgerEntryType === "NFTokenPage" &&
      Array.isArray(node.CreatedNode?.NewFields?.NonFungibleTokens)
    ) {
      for (const tokenNode of node.CreatedNode?.NewFields?.NonFungibleTokens) {
        if (tokenNode.NonFungibleToken) {
          if (!changes[tx.Account]) {
            changes[tx.Account] = [];
          }

          let status: string | undefined = undefined;

          if (tx.TransactionType === "NFTokenMint") {
            status = "added";
          } else if (tx.TransactionType === "NFTokenAcceptOffer") {
            for (const searchNode of tx.meta.AffectedNodes) {
              if (
                searchNode.DeletedNode?.LedgerEntryType === "NFTokenOffer" &&
                searchNode.DeletedNode?.FinalFields?.TokenID === tokenNode.NonFungibleToken.TokenID
              ) {
                if (tx.BuyOffer == searchNode.DeletedNode?.LedgerIndex) {
                  status = "removed";
                } else if (tx.SellOffer == searchNode.DeletedNode?.LedgerIndex) {
                  status = "added";
                }
              }
            }
          }

          changes[tx.Account].push(
            removeUndefined({
              status,
              tokenID: tokenNode.NonFungibleToken.TokenID,
              uri: tokenNode.NonFungibleToken.URI,
            })
          );
        }
      }
    }

    // removed NFToken
    if (
      node.DeletedNode?.LedgerEntryType === "NFTokenPage" &&
      Array.isArray(node.DeletedNode?.FinalFields?.NonFungibleTokens)
    ) {
      for (const tokenNode of node.DeletedNode?.FinalFields?.NonFungibleTokens) {
        if (tokenNode.NonFungibleToken) {
          if (!changes[tx.Account]) {
            changes[tx.Account] = [];
          }

          changes[tx.Account].push(
            removeUndefined({
              status: "removed",
              tokenID: tokenNode.NonFungibleToken.TokenID,
              uri: tokenNode.NonFungibleToken.URI,
            })
          );
        }
      }
    }

    // removed NFTokenOffer
    if (tx.TransactionType === "NFTokenAcceptOffer" && node.DeletedNode?.LedgerEntryType === "NFTokenOffer") {
      if (node.DeletedNode?.FinalFields?.Owner) {
        const account = node.DeletedNode.FinalFields.Owner;
        if (!changes[account]) {
          changes[account] = [];
        }

        // sold
        const status = node.DeletedNode?.FinalFields.Flags & NFTokenOfferFlagsKeys.sellToken ? "removed" : "added";
        changes[account].push(
          removeUndefined({
            status: status,
            tokenID: node.DeletedNode?.FinalFields.TokenID,
          })
        );
      }
    }
  }

  return changes;
}

export function parseNonFungibleTokenOfferChanges(tx: any): any {
  const changes = {};

  if (tx.meta.AffectedNodes.length === 0) {
    return changes;
  }

  for (const node of tx.meta.AffectedNodes) {
    // added NFTokenOffer
    if (node.CreatedNode?.LedgerEntryType === "NFTokenOffer") {
      if (node.CreatedNode?.NewFields) {
        if (!changes[tx.Account]) {
          changes[tx.Account] = [];
        }

        changes[tx.Account].push(
          removeUndefined({
            status: "created",
            amount: node.CreatedNode?.NewFields.Amount,
            flags: node.CreatedNode?.NewFields.Flags,
            tokenID: node.CreatedNode?.NewFields.TokenID,
            Owner: node.CreatedNode?.NewFields.Owner,
          })
        );
      }
    }

    if (node.DeletedNode?.LedgerEntryType === "NFTokenOffer") {
      if (node.DeletedNode?.FinalFields) {
        const account = node.DeletedNode.FinalFields.Owner;

        if (!changes[account]) {
          changes[account] = [];
        }

        changes[account].push(
          removeUndefined({
            status: "deleted",
            amount: node.DeletedNode.FinalFields.Amount,
            flags: node.DeletedNode.FinalFields.Flags,
            tokenID: node.DeletedNode.FinalFields.TokenID,
            Owner: node.DeletedNode.FinalFields.Owner,
          })
        );
      }
    }
  }

  return changes;
}
