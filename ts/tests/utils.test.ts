import {
  aprToBasisPoints,
  basisPointsToApr,
  convertAprToApy,
  convertApyToApr,
  convertSecondsToTime,
  convertTimeToSeconds,
  getDurationAndUnitFromTime
} from '../src/utils';

describe('testing time conversion', () => {
  test('unpadded four part time string should be hourly', () => {
    expect(convertTimeToSeconds('0:1:0:0')).toBe(3600);
  });

  test('padded three part time string should be hourly', () => {
    expect(convertTimeToSeconds('01:00:00')).toBe(3600);
  });

  test('padded four part time string should be daily', () => {
    expect(convertTimeToSeconds('01:00:00:00')).toBe(86400);
  });

  test('unpadded four part time string should be daily', () => {
    expect(convertTimeToSeconds('2:0:0:0')).toBe(172800);
  });

  test('padded four part time string should be daily', () => {
    expect(convertTimeToSeconds('02:00:00:00')).toBe(172800);
  });

  test('unpadded five part time string should be weekly', () => {
    expect(convertTimeToSeconds('2:0:0:0')).toBe(172800);
  });

  test('padded five part time string should be weekly', () => {
    expect(convertTimeToSeconds('02:00:00:00')).toBe(172800);
  });

  test('hourly timestamp should equal five part time string', () => {
    expect(convertSecondsToTime(3600)).toBe('01:00:00');
  });

  test('daily timestamp should equal five part time string', () => {
    expect(convertSecondsToTime(86400)).toBe('01:00:00:00');
  });

  test('daily timestamp should still equal five part time string', () => {
    expect(convertSecondsToTime(86400)).toBe('01:00:00:00');
  });

  test('preparing args for lending profile creation', () => {
    const loanDuration = convertTimeToSeconds('0:1:0:0');
    expect(loanDuration).toBe(3600);

    const timeDurationString = convertSecondsToTime(loanDuration);
    expect(timeDurationString).toBe('01:00:00');

    const { duration, durationUnit } =
      getDurationAndUnitFromTime(timeDurationString);
    expect(duration).toBe(1);
    expect(durationUnit).toBe('hours');

    // calculate desired APR for 150% APY
    const apr = convertApyToApr(150, duration, durationUnit);
    expect(apr).toBe(91.63390190953224);

    const interestRateBps = aprToBasisPoints(apr, duration, durationUnit);
    expect(interestRateBps).toBe(1.0539901300843368);

    const interestRateApr = basisPointsToApr(
      interestRateBps,
      duration,
      durationUnit
    );
    expect(interestRateApr).toBe(91.63390190953224);

    // there's a slight loss of precision here
    const apy = convertAprToApy(interestRateApr, duration, durationUnit);
    expect(apy).toBe(149.99999999999773);
  });
});
