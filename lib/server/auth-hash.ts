
const ITERATIONS = 600_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function derive(pw: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pw),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: new Uint8Array(salt).buffer,
      iterations,
    },
    key,
    HASH_BYTES * 8,
  );

  return new Uint8Array(bits);
}

export async function hashPassword(pw: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(pw, salt, ITERATIONS);

  return [
    "pbkdf2-sha256",
    ITERATIONS,
    toBase64Url(salt),
    toBase64Url(hash),
  ].join("$");
}

export async function verifyPassword(
  stored: string,
  pw: string,
): Promise<boolean> {
  try {
    const [algorithm, iterationsText, saltText, hashText] = stored.split("$");

    if (algorithm !== "pbkdf2-sha256") return false;

    const iterations = Number(iterationsText);

    if (!Number.isInteger(iterations) || iterations < 600_000 || iterations > 1_000_000) {
      return false;
    }

    const salt = fromBase64Url(saltText);
    const expected = fromBase64Url(hashText);

    if (salt.length !== SALT_BYTES || expected.length !== HASH_BYTES) {
      return false;
    }

    const actual = await derive(pw, salt, iterations);

    let difference = 0;

    for (let i = 0; i < expected.length; i++) {
      difference |= expected[i] ^ actual[i];
    }

    return difference === 0;
  } catch {
    return false;
  }
}
