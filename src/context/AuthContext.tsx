import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../lib/firebase';
import { toast } from 'sonner';

interface AuthContextType {
  user: FirebaseUser | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: (redirectTo?: string) => Promise<void>;
  signUp: (email: string, pass: string, redirectTo?: string) => Promise<void>;
  signIn: (email: string, pass: string, redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoginModalOpen: boolean;
  openLoginModal: (redirectTo?: string) => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAdmin(user?.email === 'ntwaricedrick001@gmail.com');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRedirect = (user?: FirebaseUser | null, manualRedirect?: string) => {
    setIsLoginModalOpen(false);
    const currentUser = user || auth.currentUser;
    const isUserAdmin = currentUser?.email === 'ntwaricedrick001@gmail.com';
    const pathToUse = manualRedirect || redirectPath;

    if (isUserAdmin) {
      navigate('/admin');
      setRedirectPath(null);
    } else if (pathToUse) {
      navigate(pathToUse);
      setRedirectPath(null);
    }
  };

  const loginWithGoogle = async (manualRedirect?: string) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      handleRedirect(result.user, manualRedirect);
    } catch (error: any) {
      console.error("Login failed:", error);
      // Provide user-friendly feedback
      if (error.code === 'auth/popup-blocked') {
        toast.error("Popup blocked! Please allow popups for this site.", {
          description: "Google sign-in requires a popup window."
        });
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error("Domain not authorized!", {
          description: "This domain must be added to Firebase Console > Authentication > Settings > Authorized domains."
        });
      } else {
        toast.error("Google sign-in failed. Please try again.");
      }
      throw error;
    }
  };

  const signUp = async (email: string, pass: string, manualRedirect?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      handleRedirect(result.user, manualRedirect);
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    }
  };

  const signIn = async (email: string, pass: string, manualRedirect?: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      handleRedirect(result.user, manualRedirect);
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const openLoginModal = (redirectTo?: string) => {
    if (redirectTo) {
      setRedirectPath(redirectTo);
    }
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setRedirectPath(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin,
      loading, 
      loginWithGoogle, 
      signUp,
      signIn,
      logout, 
      isLoginModalOpen, 
      openLoginModal, 
      closeLoginModal 
    }}>
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
