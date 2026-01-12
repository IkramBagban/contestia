import { createContext, useContext, useEffect } from 'react';
import { useMe } from '@/hooks/use-queries';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: any;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useMe();
  const navigate = useNavigate();
  const location = useLocation();

  const publicRoutes = ['/login', '/signup', '/'];

  useEffect(() => {
    // Basic protection logic
    const isPublic = publicRoutes.includes(location.pathname);
    
    // If we have finished loading...
    if (!isLoading) {
        if (!user && !isPublic) {
            // Not logged in, trying to access private route
            navigate('/login');
        } else if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
            // Logged in, trying to access auth pages
            navigate('/dashboard');
        }
    }
  }, [user, isLoading, location.pathname, navigate]);

  if (isLoading) {
      return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="animate-spin" /></div>
  }

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
