import { FormattedBaseSpecification } from "./specification";
import { FormattedIssuedCurrencyAmount } from "../../../../types";
import { DestinationPaymentAddress } from "./account";

export type FormattedCheckCancelSpecification = {
  // ID of the Check ledger object to cancel.
  checkID: string;
} & FormattedBaseSpecification;

export type FormattedCheckCashSpecification = {
  // ID of the Check ledger object to cash.
  checkID: string;

  // (Optional) redeem the Check for exactly this amount, if possible.
  // The currency must match that of the `SendMax` of the corresponding
  // `CheckCreate` transaction.
  amount: FormattedIssuedCurrencyAmount;

  // (Optional) redeem the Check for at least this amount and
  // for as much as possible.
  // The currency must match that of the `SendMax` of the corresponding
  // `CheckCreate` transaction.
  deliverMin: FormattedIssuedCurrencyAmount;

  // *must* include either Amount or DeliverMin, but not both.
} & FormattedBaseSpecification;

export type FormattedCheckCreateSpecification = {
  // account that can cash the check.
  destination: DestinationPaymentAddress;

  // (Optional) time in seconds since the Ripple Epoch.
  expiration?: string;

  // (Optional) 256-bit hash representing a specific reason or identifier.
  invoiceID?: string;
} & FormattedBaseSpecification;
