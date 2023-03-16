import { BN } from '@project-serum/anchor';

/**
 * String encoding for collection names.
 * @param str The collection name.
 * @returns The encoded value.
 */
export const encodeStrToUint8Array = (str: string): number[] => {
  const encoder = new TextEncoder();
  const empty = Array(32).fill(0);
  const encodedArr = Array.from(encoder.encode(str));
  return empty.map((_, i) => encodedArr[i] || 0);
};

/**
 * Byte array decoding for collection names.
 * @param str The collection name encoded as a byte array.
 * @returns The decoded value.
 */
export const decodeUint8ArrayToStr = (byteArray: number[]): string => {
  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(byteArray)).replaceAll('\x00', '');
};

/**
 * Fetches GraphQL data from the GBG API.
 * @param api The API URL.
 * @param query The GraphQL query.
 * @param variables The variables that need to be injected into the GraphQL query.
 * @returns The response JSON.
 */
export const fetchGraphqlData = async (
  api: string,
  query: string,
  variables?: object
): Promise<unknown> => {
  const res = await fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });

  return await res.json();
};

/**
 * Fetches GraphQL data from the GBG API.
 * @param duration The duration of time, specified as 'weeks:days:hours:minutes:seconds'.
 * @returns The decoded value.
 */
export function convertTimeToSeconds(duration: string): number {
  const timeParts = duration.split(':').map(Number);
  const numTimeParts = timeParts.length;

  if (numTimeParts === 1) {
    // If there's only one time part, assume it's the number of seconds
    return timeParts[0];
  } else if (numTimeParts === 2) {
    // If there are two time parts, assume it's the number of minutes and seconds
    return timeParts[0] * 60 + timeParts[1];
  } else if (numTimeParts === 3) {
    // If there are three time parts, assume it's the number of hours, minutes, and seconds
    return timeParts[0] * 60 * 60 + timeParts[1] * 60 + timeParts[2];
  } else if (numTimeParts === 4) {
    // If there are four time parts, assume it's the number of days, hours, minutes, and seconds
    return (
      timeParts[0] * 24 * 60 * 60 +
      timeParts[1] * 60 * 60 +
      timeParts[2] * 60 +
      timeParts[3]
    );
  } else if (numTimeParts === 5) {
    // If there are five time parts, assume it's the number of weeks, days, hours, minutes, and seconds
    return (
      timeParts[0] * 7 * 24 * 60 * 60 +
      timeParts[1] * 24 * 60 * 60 +
      timeParts[2] * 60 * 60 +
      timeParts[3] * 60 +
      timeParts[4]
    );
  } else {
    // If there are more than five time parts, throw an error
    throw new Error('Invalid duration format');
  }
}

/**
 * Converts a given APR into basis points for the duration.
 * @param apr The APR as percentage in decimal notation, e.g 0.15 for 15% APR.
 * @param duration The amount of periods in the duration unit.
 * @param durationUnit The duration unit, e.g 'days' or 'weeks'.
 * @returns The response JSON.
 */
export function aprToBasisPoints(
  apr: number,
  duration: number,
  durationUnit: 'days' | 'weeks' | 'months' | 'years'
): number {
  // Define the number of compounding periods per year based on the duration unit
  let periodsPerYear: number;
  switch (durationUnit) {
    case 'days':
      periodsPerYear = 365.25 / duration;
      break;
    case 'weeks':
      periodsPerYear = 52 / duration;
      break;
    case 'months':
      periodsPerYear = 12 / duration;
      break;
    case 'years':
      periodsPerYear = 1 / duration;
      break;
    default:
      throw new Error(`Invalid duration unit: ${durationUnit}`);
  }

  // Calculate the periodic interest rate and total interest rate
  const periodicInterestRate = apr / periodsPerYear;
  const totalInterestRate = periodicInterestRate * duration;

  // Convert the total interest rate to basis points and return the result
  const basisPoints = totalInterestRate * 10000;
  return basisPoints;
}

export function bnToDate(bn: BN): Date {
  return new Date(bn.toNumber() * 1000);
}

export function dateToBn(date: Date): BN {
  return new BN(date.valueOf() / 1_000);
}
