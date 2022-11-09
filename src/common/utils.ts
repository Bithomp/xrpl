export type SortDirection = -1 | 0 | 1;

// https://github.com/XRPLF/xrpl.js/blob/6e0fff2ad642c2f94ddb83a23f57dff49d1678ec/src/ledger/utils.ts#L80
export function signum(num: number): SortDirection {
  return num === 0 ? 0 : num > 0 ? 1 : -1;
}

// https://github.com/XRPLF/xrpl.js/blob/6e0fff2ad642c2f94ddb83a23f57dff49d1678ec/src/ledger/utils.ts#L90
/**
 *  Order two rippled transactions based on their ledger_index.
 *  If two transactions took place in the same ledger, sort
 *  them based on TransactionIndex
 *  See: https://developers.ripple.com/transaction-metadata.html
 */
export function compareTransactions(first: any, second: any): SortDirection {
  if (!first.tx || !first.meta || !second.tx || !second.meta) {
    return 0;
  }

  if (first.tx.ledger_index === second.tx.ledger_index) {
    return signum(first.meta.TransactionIndex - second.meta.TransactionIndex);
  }

  return first.tx.ledger_index < second.tx.ledger_index ? -1 : 1;
}

export function parseFlags(value: number, keys: any, options: { excludeFalse?: boolean } = {}): any {
  const flags = {};
  for (const flagName in keys) {
    // tslint:disable-next-line:no-bitwise
    if (value & keys[flagName]) {
      flags[flagName] = true;
    } else {
      if (!options.excludeFalse) {
        flags[flagName] = false;
      }
    }
  }
  return flags;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Convert marker to hash and marker
 * "abc,dex,def" => { hash: "abc", marker: "dex,def" }
 *
 * { ledger: 16658790, seq: 1 } => { hash: undefined, marker: { ledger: 16658790, seq: 1 } }
 */
export function parseMarker(marker?: any): any {
  let hash: undefined | string;

  if (typeof marker !== "string") {
    return { hash, marker };
  }

  if (marker) {
    const markerParams = marker.split(",");
    if (markerParams.length > 1) {
      hash = markerParams[0];
      markerParams.shift();
      marker = markerParams.join(",");
    }
  }

  return {
    hash,
    marker,
  };
}

export function createMarker(hash: string, marker?: any): any {
  if (marker === undefined) {
    return undefined;
  }

  if (marker === null) {
    return undefined;
  }

  if (typeof marker === "string") {
    return `${hash},${marker}`;
  }

  return marker;
}
