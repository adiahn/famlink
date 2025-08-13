import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, AuthResponse } from '../api/authApi';
import { router } from 'expo-router';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  tokenExpiry: number | null;
}

interface AuthActions {
  register: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    password: string;
    confirmPassword: string;
    email: string;
    gender?: string;
  }) => Promise<{ success: boolean; message: string }>;
  signIn: (data: { phone: string; password: string }) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (data: { email: string; verificationCode: string }) => Promise<{ success: boolean; message: string }>;
  resendVerification: (phone: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  refreshAccessToken: () => Promise<boolean>;
  checkSessionValidity: () => boolean;
  initializeAuth: () => Promise<void>;
}

// Token expiry time: 2 hours (7200 seconds)
const TOKEN_EXPIRY_TIME = 7200 * 1000; // 2 hours in milliseconds

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      tokenExpiry: null,

      // Actions
      initializeAuth: async () => {
        const { checkSessionValidity, refreshAccessToken } = get();
        
        // Check if we have stored tokens
        const { accessToken, refreshToken, tokenExpiry } = get();
        
        if (accessToken && refreshToken) {
          // Check if token is still valid
          if (checkSessionValidity()) {
            set({ isAuthenticated: true });
            return;
          }
          
          // Try to refresh the token
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            set({ isAuthenticated: true });
            return;
          }
        }
        
        // If we can't restore the session, clear everything
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          tokenExpiry: null
        });
      },

      checkSessionValidity: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) {
          console.log('No token expiry found');
          return false;
        }
        
        // Check if token hasn't expired (with 5 minute buffer)
        const now = Date.now();
        const buffer = 5 * 60 * 1000; // 5 minutes
        const isValid = now < (tokenExpiry - buffer);
        
        console.log('Token validity check:', {
          now: new Date(now).toISOString(),
          expiry: new Date(tokenExpiry).toISOString(),
          buffer: buffer / 1000 / 60 + ' minutes',
          isValid
        });
        
        // Force logout if token is expired
        if (!isValid) {
          console.log('Token expired, forcing logout');
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            tokenExpiry: null
          });
        }
        
        return isValid;
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          console.log('No refresh token available');
          return false;
        }

        try {
          console.log('Attempting to refresh token...');
          const response = await authApi.refreshToken({ refreshToken });
          console.log('Refresh token response:', response);
          
          if (response.success && response.data?.accessToken) {
            const newExpiry = Date.now() + TOKEN_EXPIRY_TIME;
            console.log('Token refreshed successfully, new expiry:', new Date(newExpiry).toISOString());
            set({
              accessToken: response.data.accessToken,
              tokenExpiry: newExpiry,
              isAuthenticated: true
            });
            return true;
          } else {
            console.log('Token refresh failed:', response);
          }
        } catch (error) {
          console.error('Token refresh error:', error);
        }
        
        return false;
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const response: AuthResponse = await authApi.register(data);
          
          if (response.success) {
            set({ 
              isLoading: false,
              error: null 
            });
            return { success: true, message: response.message };
          } else {
            set({ 
              isLoading: false, 
              error: response.message || 'Registration failed' 
            });
            return { success: false, message: response.message || 'Registration failed' };
          }
        } catch (error) {
          console.error('Registration error:', error);
          set({ 
            isLoading: false, 
            error: 'Network error. Please try again.' 
          });
          return { success: false, message: 'Network error. Please try again.' };
        }
      },

      signIn: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const response: AuthResponse = await authApi.signIn(data);
          
          if (response.success && response.data?.user && response.data?.accessToken && response.data?.refreshToken) {
            const tokenExpiry = Date.now() + TOKEN_EXPIRY_TIME;
            
            set({
              user: response.data.user,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              tokenExpiry: tokenExpiry,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return { success: true, message: response.message };
          } else {
            set({ 
              isLoading: false, 
              error: response.message || 'Sign in failed' 
            });
            return { success: false, message: response.message || 'Sign in failed' };
          }
        } catch (error) {
          console.error('Sign in error:', error);
          set({ 
            isLoading: false, 
            error: 'Network error. Please try again.' 
          });
          return { success: false, message: 'Network error. Please try again.' };
        }
      },

      verifyEmail: async (data: { email: string; verificationCode: string }) => {
        set({ isLoading: true, error: null });
        
        try {
          const response: AuthResponse = await authApi.verifyEmail(data);
          
          if (response.success && response.data?.user) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return { success: true, message: response.message };
          } else {
            set({ 
              isLoading: false, 
              error: response.message || 'Email verification failed' 
            });
            return { success: false, message: response.message || 'Email verification failed' };
          }
        } catch (error) {
          console.error('Email verification error:', error);
          set({ 
            isLoading: false, 
            error: 'Network error. Please try again.' 
          });
          return { success: false, message: 'Network error. Please try again.' };
        }
      },

      resendVerification: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response: AuthResponse = await authApi.resendVerification(email);
          
          set({ isLoading: false, error: null });
          return { success: response.success, message: response.message };
        } catch (error) {
          console.error('Resend verification error:', error);
          set({ 
            isLoading: false, 
            error: 'Network error. Please try again.' 
          });
          return { success: false, message: 'Network error. Please try again.' };
        }
      },

      logout: async () => {
        console.log('Logout function called');
        const { accessToken } = get();
        
        if (accessToken) {
          try {
            console.log('Calling authApi.logout with token');
            await authApi.logout(accessToken);
            console.log('AuthApi logout successful');
          } catch (error) {
            console.error('Logout error:', error);
          }
        }
        
        console.log('Clearing auth state');
        set({
          user: null, 
          accessToken: null,
          refreshToken: null,
          tokenExpiry: null,
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        });
        
        console.log('Navigating to login screen');
        // Navigate to login screen after logout
        router.replace('/auth/login');
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      setTokens: (accessToken, refreshToken) => {
        const tokenExpiry = Date.now() + TOKEN_EXPIRY_TIME;
        set({ accessToken, refreshToken, tokenExpiry, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenExpiry: state.tokenExpiry,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 