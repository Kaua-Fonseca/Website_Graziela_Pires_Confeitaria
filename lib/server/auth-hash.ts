import { hash, verify } from "@node-rs/argon2";

// Argon2id (algorithm: 2) com parâmetros OWASP: 19 MiB, t=2, p=1
const ARGON = { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export const hashPassword = (pw: string) => hash(pw, ARGON);
export const verifyPassword = (h: string, pw: string) => verify(h, pw).catch(() => false);
