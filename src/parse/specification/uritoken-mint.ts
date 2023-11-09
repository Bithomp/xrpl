import * as assert from "assert";
import { removeUndefined } from "../../common";
import parseMemos from "../ledger/memos";
import parseURITokenFlags from "../ledger/uritoken-flags";
import { parseEmittedDetails } from "../ledger/emit_details";

import { FormattedURITokenMintSpecification } from "../../v1/common/types/objects/uritokens";

function parseNFTokenBurn(tx: any): FormattedURITokenMintSpecification {
  assert.ok(tx.TransactionType === "URITokenMint");

  const emittedDetails = parseEmittedDetails(tx);

  return removeUndefined({
    uri: tx.URI,
    flags: parseURITokenFlags(tx.Flags),
    digest: tx.Digest,
    amount: tx.Amount,
    destination: tx.Destination,
    emittedDetails,
    memos: parseMemos(tx),
  });
}

export default parseNFTokenBurn;
