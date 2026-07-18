/**
 * Vault — Criptografia de senhas
 * -------------------------------------------------------------
 * Modelo de segurança:
 *  - A senha mestra do usuário NUNCA é armazenada. Apenas um hash
 *    (para validação) e um salt único (para derivação de chave).
 *  - A chave de criptografia real é derivada em memória, no servidor,
 *    a cada operação, via PBKDF2 (100k+ iterações) + o salt do usuário.
 *  - Os campos encryptedUsername/encryptedPassword/encryptedNotes
 *    armazenados no banco são sempre ciphertext (AES-256-GCM).
 *  - Só é possível decifrar de posse da senha mestra correta — o
 *    servidor nunca guarda a chave derivada entre requisições.
 *
 * Este arquivo só deve ser importado em contexto de servidor
 * (Server Actions / Route Handlers), nunca em componentes client.
 */

import crypto from "node:crypto";

const PBKDF2_ITERATIONS = 120_000;
const PBKDF2_DIGEST = "sha512";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // recomendado para GCM
const AUTH_TAG_LENGTH = 16;

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

/** Deriva a chave AES-256 a partir da senha mestra + salt do usuário. */
function deriveKey(masterPassword: string, salt: string): Buffer {
  return crypto.pbkdf2Sync(
    masterPassword,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    PBKDF2_DIGEST
  );
}

/** Hash de verificação da senha mestra (NUNCA a chave — só para checar se está correta). */
export function hashMasterPassword(masterPassword: string, salt: string): string {
  return crypto
    .pbkdf2Sync(masterPassword, `verify:${salt}`, PBKDF2_ITERATIONS, 64, PBKDF2_DIGEST)
    .toString("hex");
}

export function verifyMasterPassword(
  masterPassword: string,
  salt: string,
  storedHash: string
): boolean {
  const computed = hashMasterPassword(masterPassword, salt);
  return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(storedHash, "hex"));
}

export interface EncryptedPayload {
  ciphertext: string; // base64
  iv: string; // base64
  authTag: string; // base64
}

function serializeEncrypted(payload: EncryptedPayload): string {
  return `${payload.iv}.${payload.authTag}.${payload.ciphertext}`;
}

function deserializeEncrypted(serialized: string): EncryptedPayload {
  const [iv, authTag, ciphertext] = serialized.split(".");
  if (!iv || !authTag || !ciphertext) {
    throw new Error("Payload criptografado malformado");
  }
  return { iv, authTag, ciphertext };
}

/** Criptografa um texto plano usando a senha mestra do usuário. Retorna string serializada para salvar no banco. */
export function encryptSecret(
  plainText: string,
  masterPassword: string,
  salt: string
): string {
  const key = deriveKey(masterPassword, salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const ciphertext = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return serializeEncrypted({
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  });
}

/** Decifra um payload salvo no banco. Lança erro se a senha mestra estiver incorreta. */
export function decryptSecret(
  serialized: string,
  masterPassword: string,
  salt: string
): string {
  const key = deriveKey(masterPassword, salt);
  const { ciphertext, iv, authTag } = deserializeEncrypted(serialized);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"), {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(Buffer.from(authTag, "base64"));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
}

/** Classificação de força de senha — heurística simples (entropia + variedade de classes de caractere). */
export function assessPasswordStrength(password: string): "weak" | "medium" | "strong" {
  if (password.length === 0) return "weak";

  let classes = 0;
  if (/[a-z]/.test(password)) classes++;
  if (/[A-Z]/.test(password)) classes++;
  if (/[0-9]/.test(password)) classes++;
  if (/[^a-zA-Z0-9]/.test(password)) classes++;

  const entropy = password.length * Math.log2(Math.max(classes, 1) * 26);

  if (password.length < 8 || classes <= 1) return "weak";
  if (entropy >= 80 && classes >= 3 && password.length >= 12) return "strong";
  if (entropy >= 45 && classes >= 2) return "medium";
  return "weak";
}

export interface PasswordGeneratorOptions {
  length: number;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

/** Gera uma senha aleatória e criptograficamente segura (crypto.randomInt, sem viés de módulo). */
export function generatePassword(options: PasswordGeneratorOptions): string {
  let charset = LOWER;
  if (options.uppercase) charset += UPPER;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;

  const length = Math.max(4, options.length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[crypto.randomInt(0, charset.length)];
  }
  return result;
}
