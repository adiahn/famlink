import React from 'react';
import Toast from 'react-native-toast-message';

interface ToastProviderProps {
  children: React.ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toast />
    </>
  );
}

// Toast configuration
export const showToast = {
  success: (message: string, title?: string) => {
    Toast.show({
      type: 'success',
      text1: title || 'Success',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
  error: (message: string, title?: string) => {
    Toast.show({
      type: 'error',
      text1: title || 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });
  },
  info: (message: string, title?: string) => {
    Toast.show({
      type: 'info',
      text1: title || 'Info',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
  warning: (message: string, title?: string) => {
    Toast.show({
      type: 'error', // Using error type for warning since toast doesn't have warning
      text1: title || 'Warning',
      text2: message,
      position: 'top',
      visibilityTime: 3500,
    });
  },
}; 