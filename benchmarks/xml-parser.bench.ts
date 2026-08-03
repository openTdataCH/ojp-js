import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

import { parseXML } from '../src/helpers/xml/parser.ts';

type FixtureResult = {
  bytes: number;
  digest: string;
  medianMs: number;
  samplesMs: number[];
};

type BenchmarkResult = {
  fixtures: Record<string, FixtureResult>;
  nodeVersion: string;
};

const FIXTURES = [
  'tests/ojp-fixtures/tr-response-zh-be.xml',
  'tests/ojp-fixtures/ser-response-situations.xml',
  'tests/ojp-fixtures/tr-response-situations.xml',
];
const ROUNDS = 12;
const TARGET_BYTES_PER_ROUND = 2_000_000;
const WARMUP_ITERATIONS = 5;

function readOption(name: string): string | undefined {
  const optionIndex = process.argv.indexOf(name);
  return optionIndex === -1 ? undefined : process.argv[optionIndex + 1];
}

function median(values: number[]): number {
  const sortedValues = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sortedValues.length / 2);
  return sortedValues.length % 2 === 0
    ? (sortedValues[middle - 1] + sortedValues[middle]) / 2
    : sortedValues[middle];
}

function benchmarkFixture(path: string): FixtureResult {
  const xml = readFileSync(resolve(path), 'utf8');
  const bytes = Buffer.byteLength(xml);
  const iterations = Math.max(3, Math.ceil(TARGET_BYTES_PER_ROUND / bytes));
  let lastResult: unknown;

  for (let iteration = 0; iteration < WARMUP_ITERATIONS; iteration++) {
    lastResult = parseXML(xml, '2.0');
  }

  const samplesMs: number[] = [];
  for (let round = 0; round < ROUNDS; round++) {
    const startedAt = performance.now();
    for (let iteration = 0; iteration < iterations; iteration++) {
      lastResult = parseXML(xml, '2.0');
    }
    samplesMs.push((performance.now() - startedAt) / iterations);
  }

  if (lastResult === undefined) {
    throw new Error(`Parser returned undefined for ${path}`);
  }

  return {
    bytes,
    digest: createHash('sha256').update(JSON.stringify(lastResult)).digest('hex'),
    medianMs: median(samplesMs),
    samplesMs,
  };
}

const result: BenchmarkResult = {
  fixtures: Object.fromEntries(
    FIXTURES.map(path => [basename(path), benchmarkFixture(path)]),
  ),
  nodeVersion: process.version,
};

for (const [fixture, measurement] of Object.entries(result.fixtures)) {
  console.log(`${fixture}: ${measurement.bytes} bytes, ${measurement.medianMs.toFixed(3)} ms/parse`);
}

const outputPath = readOption('--output');
if (outputPath !== undefined) {
  writeFileSync(resolve(outputPath), `${JSON.stringify(result, null, 2)}\n`);
}

const baselinePath = readOption('--baseline');
if (baselinePath !== undefined) {
  const minimumSpeedup = Number(readOption('--minimum-speedup') ?? '2');
  const baseline = JSON.parse(readFileSync(resolve(baselinePath), 'utf8')) as BenchmarkResult;
  const failures: string[] = [];

  for (const [fixture, measurement] of Object.entries(result.fixtures)) {
    const baselineMeasurement = baseline.fixtures[fixture];
    if (baselineMeasurement === undefined) {
      failures.push(`${fixture}: missing from baseline`);
      continue;
    }

    const speedup = baselineMeasurement.medianMs / measurement.medianMs;
    console.log(`${fixture}: ${speedup.toFixed(2)}x speedup`);
    if (measurement.digest !== baselineMeasurement.digest) {
      failures.push(`${fixture}: parsed output differs from baseline`);
    }
    if (speedup < minimumSpeedup) {
      failures.push(`${fixture}: ${speedup.toFixed(2)}x < ${minimumSpeedup.toFixed(2)}x`);
    }
  }

  if (failures.length > 0) {
    console.error(`Performance target missed:\n${failures.join('\n')}`);
    process.exitCode = 1;
  }
}
