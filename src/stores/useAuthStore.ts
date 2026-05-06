import { create } from 'zustand';
import { getUserByEmail, getUserById, createUser, getUserBySocialId, createSocialUser } from '../db/queries';
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  createSession,
  getPersistedSession,
  clearSession,
} from '../services/auth';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  restoreSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (displayName: string, email: string, password: string) => Promise<boolean>;
  socialLogin: (
    provider: 'google' | 'apple',
    socialId: string,
    email: string,
    displayName: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const userId = await getPersistedSession();
      if (!userId) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }
      const row = await getUserById(userId);
      if (!row) {
        await clearSession();
        set({ isAuthenticated: false, isLoading: false });
        return;
      }
      set({
        user: {
          id: row.id,
          email: row.email,
          displayName: row.display_name,
          createdAt: row.created_at,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const row = await getUserByEmail(email);
      if (!row) {
        set({ isLoading: false, error: 'No account found with that email.' });
        return false;
      }
      const valid = await verifyPassword(password, row.password_hash, row.password_salt);
      if (!valid) {
        set({ isLoading: false, error: 'Incorrect password.' });
        return false;
      }
      await createSession(row.id);
      set({
        user: {
          id: row.id,
          email: row.email,
          displayName: row.display_name,
          createdAt: row.created_at,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Login failed.' });
      return false;
    }
  },

  signup: async (displayName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const existing = await getUserByEmail(email);
      if (existing) {
        set({ isLoading: false, error: 'An account with this email already exists.' });
        return false;
      }
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);
      const userId = await createUser(email, displayName, hash, salt);
      await createSession(userId);
      set({
        user: {
          id: userId,
          email: email.toLowerCase().trim(),
          displayName: displayName.trim(),
          createdAt: new Date().toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Signup failed.' });
      return false;
    }
  },

  socialLogin: async (provider, socialId, email, displayName) => {
    set({ isLoading: true, error: null });
    try {
      // Check if social account already exists
      const existing = await getUserBySocialId(provider, socialId);
      if (existing) {
        await createSession(existing.id);
        set({
          user: {
            id: existing.id,
            email: existing.email,
            displayName: existing.display_name,
            createdAt: existing.created_at,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }

      // Check email collision with an existing password account
      const emailRow = await getUserByEmail(email);
      if (emailRow && emailRow.social_provider === null) {
        set({
          isLoading: false,
          error: 'This email is already registered. Please sign in with email instead.',
        });
        return false;
      }

      // Create new social account
      const userId = await createSocialUser(email, displayName, provider, socialId);
      await createSession(userId);
      set({
        user: {
          id: userId,
          email: email.toLowerCase().trim(),
          displayName: displayName.trim(),
          createdAt: new Date().toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Social sign-in failed.' });
      return false;
    }
  },

  logout: async () => {
    await clearSession();
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
