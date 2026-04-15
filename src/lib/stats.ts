/** Minimal stats helpers — replaces simple-statistics for serverless cold-start cost. */

export function linearRegression(data: [number, number][]): { m: number; b: number } {
  const n = data.length;
  if (n < 2) throw new Error('linearRegression requires at least 2 points');
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (const [x, y] of data) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) throw new Error('degenerate regression');
  const m = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;
  return { m, b };
}

export function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

/** Sample standard deviation (matches simple-statistics for n >= 2). */
export function standardDeviation(arr: number[]): number {
  const n = arr.length;
  if (n < 2) return 0;
  const avg = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - avg) ** 2, 0) / (n - 1));
}
