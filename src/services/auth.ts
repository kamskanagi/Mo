import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'mo_session_token';
const SESSION_USER_ID_KEY = 'mo_session_user_id';

export function generateSalt(): string {
  const bytes = new Uint8Array(32);
  Crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  );
}

export async function verifyPassword(
  candidate: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  const hash = await hashPassword(candidate, storedSalt);
  return hash === storedHash;
}

export async function createSession(userId: number): Promise<string> {
  const tokenBytes = new Uint8Array(32);
  Crypto.getRandomValues(tokenBytes);
  const token = Array.from(tokenBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
  await SecureStore.setItemAsync(SESSION_USER_ID_KEY, String(userId));
  return token;
}

export async function getPersistedSession(): Promise<number | null> {
  try {
    const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    const userIdStr = await SecureStore.getItemAsync(SESSION_USER_ID_KEY);
    if (!token || !userIdStr) return null;
    const userId = parseInt(userIdStr, 10);
    return isNaN(userId) ? null : userId;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    await SecureStore.deleteItemAsync(SESSION_USER_ID_KEY);
  } catch {
    // ignore — already cleared or unavailable
  }
}
