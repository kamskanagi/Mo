import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'mo_session_token';
const SESSION_USER_ID_KEY = 'mo_session_user_id';

// Web fallback — expo-secure-store is native-only
const storage = {
  async set(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async delete(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

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
  await storage.set(SESSION_TOKEN_KEY, token);
  await storage.set(SESSION_USER_ID_KEY, String(userId));
  return token;
}

export async function getPersistedSession(): Promise<number | null> {
  try {
    const token = await storage.get(SESSION_TOKEN_KEY);
    const userIdStr = await storage.get(SESSION_USER_ID_KEY);
    if (!token || !userIdStr) return null;
    const userId = parseInt(userIdStr, 10);
    return isNaN(userId) ? null : userId;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await storage.delete(SESSION_TOKEN_KEY);
    await storage.delete(SESSION_USER_ID_KEY);
  } catch {
    // ignore — already cleared or unavailable
  }
}
