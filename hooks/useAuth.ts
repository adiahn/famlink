import { useAuthStore } from '@/store/authStore';
import { showToast } from '@/providers/ToastProvider';
import { User } from '@/types/family';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isOnboardingComplete,
    isLoading,
    error,
    setUser,
    setAuthenticated,
    setOnboardingComplete,
    setLoading,
    setError,
    logout,
    clearError,
  } = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        firstName: 'Fatima',
        lastName: 'Yusuf',
        fullName: 'Fatima Yusuf',
        idType: 'NIN',
        idNumber: '12345678901',
        dateOfBirth: '1990-01-01',
        phone: '+234 803 123 4567',
        email: email,
        profilePhoto: undefined,
        isVerified: true,
        joinedDate: '2025-01-01',
        lastActive: new Date().toISOString(),
      };

      setUser(mockUser);
      showToast.success('Login successful');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth?: string;
    idType: 'NIN' | 'BVN';
    idNumber: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      clearError();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: `${userData.firstName} ${userData.lastName}`,
        idType: userData.idType,
        idNumber: userData.idNumber,
        dateOfBirth: userData.dateOfBirth,
        phone: userData.phone,
        email: undefined,
        profilePhoto: undefined,
        isVerified: false,
        joinedDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };

      setUser(mockUser);
      showToast.success('Registration successful');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyIdentity = async (idNumber: string, idType: 'NIN' | 'BVN') => {
    try {
      setLoading(true);
      clearError();
      
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (user) {
        const verifiedUser = { ...user, isVerified: true };
        setUser(verifiedUser);
        showToast.success('Identity verified successfully');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast.info('Logged out successfully');
  };

  return {
    user,
    isAuthenticated,
    isOnboardingComplete,
    isLoading,
    error,
    login,
    register,
    verifyIdentity,
    logout: handleLogout,
    setOnboardingComplete,
    clearError,
  };
}; 