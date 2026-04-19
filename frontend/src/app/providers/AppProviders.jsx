import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '../../context/AuthContext';
import { useUIStore } from '../../store/uiStore';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const ThemeSync = ({ children }) => {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return children;
};

const AppProviders = ({ children }) => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeSync>
        {children}
        <Toaster richColors position="top-right" />
      </ThemeSync>
    </QueryClientProvider>
  </AuthProvider>
);

export default AppProviders;
