import { BN } from '@coral-xyz/anchor';

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
 * Converts a given duration of time to seconds.
 * @param duration The duration of time, specified as 'weeks:days:hours:minutes:seconds'.
 * @returns The duration of time in seconds.
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
 * Converts a time string to duration and unit.
 * @param duration The duration of time, specified as 'weeks:days:hours:minutes:seconds'.
 * @returns The duration and duration unit of time.
 */
export function getDurationAndUnitFromTime(duration: string): {
  duration: number;
  durationUnit: 'hours' | 'days' | 'weeks';
} {
  const timeParts = duration.split(':').map(Number);
  const numTimeParts = timeParts.length;

  if (numTimeParts === 3) {
    // If there are three time parts, assume it's the number of  hours, minutes, and seconds
    if (timeParts[0] !== 0) {
      return {
        duration: timeParts[0],
        durationUnit: 'hours'
      };
    }
    throw new Error('Invalid duration format');
  } else if (numTimeParts === 4) {
    // If there are four time parts, assume it's the number of days, hours, minutes, and seconds
    if (timeParts[0] !== 0) {
      return {
        duration: timeParts[0],
        durationUnit: 'days'
      };
    } else if (timeParts[1] !== 0) {
      return {
        duration: timeParts[1],
        durationUnit: 'hours'
      };
    }
    throw new Error('Invalid duration format');
  } else if (numTimeParts === 5) {
    // If there are five time parts, assume it's the number of weeks, days, hours, minutes, and seconds
    if (timeParts[0] !== 0) {
      return {
        duration: timeParts[0],
        durationUnit: 'weeks'
      };
    } else if (timeParts[1] !== 0) {
      return {
        duration: timeParts[1],
        durationUnit: 'days'
      };
    } else if (timeParts[2] !== 0) {
      return {
        duration: timeParts[2],
        durationUnit: 'hours'
      };
    }
    throw new Error('Invalid duration format');
  } else {
    // If there are more than five time parts, throw an error
    throw new Error('Invalid duration format');
  }
}

function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}

/**
 * Converts a given duration of seconds to a string which defines time.
 * @param duration The duration of time in seconds, MUST be greater than one hour.
 * @returns The duration of time in seconds.
 */
export function convertSecondsToTime(seconds: number): string {
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  seconds = seconds % 60;
  minutes = minutes % 60;
  hours = hours % 24;
  days = days % 7;

  if (weeks != 0) {
    // return as 'weeks:days:hours:minutes:seconds'
    return `${padTo2Digits(weeks)}:${padTo2Digits(days)}:${padTo2Digits(
      hours
    )}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
  } else if (days != 0) {
    // return as 'days:hours:minutes:seconds'
    return `${padTo2Digits(days)}:${padTo2Digits(hours)}:${padTo2Digits(
      minutes
    )}:${padTo2Digits(seconds)}`;
  }
  // return as 'hours:minutes:seconds'
  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(
    seconds
  )}`;
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
  durationUnit: 'hours' | 'days' | 'weeks'
): number {
  const periodsPerYear = getPeriodsPerYear(duration, durationUnit);

  // Calculate the periodic interest rate
  const periodicInterestRate = apr / periodsPerYear;

  // Convert the total interest rate to basis points and return the result
  const periodicBps = periodicInterestRate * 100;
  return periodicBps;
}

/**
 * Converts a given APY into APR for the term and duration unit.
 * @param apr The APR as percentage, e.g 15 for 15% APR.
 * @param duration The amount of periods in the duration unit.
 * @param durationUnit The duration unit, e.g 'days' or 'weeks'.
 * @returns The response JSON.
 */
export function convertApyToApr(
  apy: number,
  duration: number,
  durationUnit: 'hours' | 'days' | 'weeks'
): number {
  const decimalApy = apy / 100;
  const periodsPerYear = getPeriodsPerYear(duration, durationUnit);
  const periodicRate = Math.pow(1 + decimalApy, 1 / periodsPerYear) - 1;
  const apr = periodicRate * periodsPerYear;

  return apr * 100;
}

/**
 * Converts a given APR into APY for the term and duration unit.
 * @param apr The APR as percentage, e.g 15 for 15% APR.
 * @param duration The amount of periods in the duration unit.
 * @param durationUnit The duration unit, e.g 'days' or 'weeks'.
 * @returns The response JSON.
 */
export function convertAprToApy(
  apr: number,
  duration: number,
  durationUnit: 'hours' | 'days' | 'weeks'
): number {
  const decimalApr = apr / 100;
  const periodsPerYear = getPeriodsPerYear(duration, durationUnit);
  const periodicRate = decimalApr / periodsPerYear;
  const apy = Math.pow(1 + periodicRate, periodsPerYear) - 1;

  return apy * 100;
}

function getPeriodsPerYear(
  duration: number,
  durationUnit: 'hours' | 'days' | 'weeks'
): number {
  switch (durationUnit) {
    case 'hours':
      return 8694 / duration;
      break;
    case 'days':
      return 365.25 / duration;
      break;
    case 'weeks':
      return 52 / duration;
      break;
    default:
      throw new Error(`Invalid duration unit: ${durationUnit}`);
  }
}

/**
 * Converts a given basis points into APR accoriding to the duration.
 * @param bps The basis points.
 * @param duration The amount of periods in the duration unit.
 * @param durationUnit The duration unit, e.g 'days' or 'weeks'.
 * @returns The response JSON.
 */
export function basisPointsToApr(
  bps: number,
  duration: number,
  durationUnit: 'hours' | 'days' | 'weeks'
): number {
  const periodsPerYear = getPeriodsPerYear(duration, durationUnit);
  const periodicInterestRate = bps / 100;
  const apr = periodicInterestRate * periodsPerYear;

  return apr;
}

export function bnToDate(bn: BN): Date {
  return new Date(bn.toNumber() * 1000);
}

export function dateToBn(date: Date): BN {
  return new BN(date.valueOf() / 1_000);
}
