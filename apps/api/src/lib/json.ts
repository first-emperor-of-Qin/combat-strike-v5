/**
 * Canonical JSON — used to compare two profiles for byte equality.
 *
 * Object keys are sorted so that key order never influences the result, and
 * the output is stable across runs.
 */
export function canonicalJson(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry)).join(',')}]`;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    const parts = keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);
    return `{${parts.join(',')}}`;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) return 'null';
  if (typeof value === 'undefined') return 'null';
  return JSON.stringify(value) ?? 'null';
}

/** True when both values serialise to the same canonical JSON. */
export function canonicalEqual(a: unknown, b: unknown): boolean {
  return canonicalJson(a) === canonicalJson(b);
}
