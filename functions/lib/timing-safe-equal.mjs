export function timingSafeEqualString(a, b) {
  const bufA = new TextEncoder().encode(typeof a === 'string' ? a : '');
  const bufB = new TextEncoder().encode(typeof b === 'string' ? b : '');

  if (bufA.length === 0 || bufB.length === 0) return false;

  const length = Math.max(bufA.length, bufB.length);
  let diff = bufA.length ^ bufB.length;
  for (let i = 0; i < length; i += 1) {
    diff |= (bufA[i] || 0) ^ (bufB[i] || 0);
  }
  return diff === 0;
}
