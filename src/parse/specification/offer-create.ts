import * as assert from "assert";
import { OfferCreateFlags } from "xrpl";
import { parseTimestamp } from "../utils";
import parseAmount from "../ledger/amount";
import { parseMemos } from "../ledger/memos";
import { parseEmittedDetails } from "../ledger/emit_details";
import { removeUndefined } from "../../common";
import { parseSigners } from "../ledger/signers";
import { parseSignerRegularKey } from "../ledger/regular-key";
import { parseSource } from "../ledger/source";
import { FormattedOfferCreateSpecification, OfferCreateTransaction, FormattedIssuedCurrencyAmount } from "../../types";

function parseOfferCreate(tx: OfferCreateTransaction): FormattedOfferCreateSpecification {
  assert.ok(tx.TransactionType === "OfferCreate");
  // eslint-disable-next-line no-bitwise
  const direction = (tx.Flags & OfferCreateFlags.tfSell) === 0 ? "buy" : "sell";
  const takerGetsAmount = parseAmount(tx.TakerGets) as FormattedIssuedCurrencyAmount;
  const takerPaysAmount = parseAmount(tx.TakerPays) as FormattedIssuedCurrencyAmount;
  const quantity = direction === "buy" ? takerPaysAmount : takerGetsAmount;
  const totalPrice = direction === "buy" ? takerGetsAmount : takerPaysAmount;

  return removeUndefined({
    signers: parseSigners(tx),
    signer: parseSignerRegularKey(tx),
    source: parseSource(tx),
    direction: direction,
    quantity: quantity,
    totalPrice: totalPrice,
    // eslint-disable-next-line no-bitwise
    passive: (tx.Flags & OfferCreateFlags.tfPassive) !== 0 || undefined,
    // eslint-disable-next-line no-bitwise
    immediateOrCancel: (tx.Flags & OfferCreateFlags.tfImmediateOrCancel) !== 0 || undefined,
    // eslint-disable-next-line no-bitwise
    fillOrKill: (tx.Flags & OfferCreateFlags.tfFillOrKill) !== 0 || undefined,
    expirationTime: parseTimestamp(tx.Expiration),
    emittedDetails: parseEmittedDetails(tx),
    memos: parseMemos(tx),
  });
}

export default parseOfferCreate;
