/**
 * AuthContext.jsx
 * Unified authentication context supporting Firebase Auth (Email/Pass & Google)
 * and 1-Click Instant Demo Roles (Student & Department Staff).
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext();

// Pre-defined realistic demo accounts for quick testing
export const DEMO_USERS = {
  student: {
    uid: 'demo_student_aarav',
    displayName: 'Aarav Sharma',
    email: 'aarav@campus.edu',
    role: 'student',
    department: null,
    rollNumber: 'CS-2023-042',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    isDemo: true,
  },
  electrician: {
    uid: 'demo_staff_ramesh',
    displayName: 'Ramesh Sundaram',
    email: 'ramesh.electrician@campus.edu',
    role: 'staff',
    department: 'Electrician',
    designation: 'Chief Campus Electrician',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isDemo: true,
  },
  warden: {
    uid: 'demo_staff_warden',
    displayName: 'Dr. R. K. Verma',
    email: 'warden.bh1@campus.edu',
    role: 'staff',
    department: 'Warden',
    designation: 'Hostel Chief Warden (Boys)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    isDemo: true,
  },
  plumber: {
    uid: 'demo_staff_plumber',
    displayName: 'Santosh Kumar',
    email: 'santosh.plumber@campus.edu',
    role: 'staff',
    department: 'Plumber',
    designation: 'Senior Campus Plumber',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    isDemo: true,
  },
  maintenanceHead: {
    uid: 'demo_staff_maintenance',
    displayName: 'Er. Alok Nath',
    email: 'maintenance.head@campus.edu',
    role: 'staff',
    department: 'Maintenance Head',
    designation: 'Executive Engineer & Maintenance Head',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    isDemo: true,
  },
  housekeeping: {
    uid: 'demo_staff_housekeeping',
    displayName: 'Sunita Devi',
    email: 'sunita.housekeeping@campus.edu',
    role: 'staff',
    department: 'Housekeeping',
    designation: 'Campus Sanitation & Hygiene Supervisor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isDemo: true,
  },
  itSupport: {
    uid: 'demo_staff_it',
    displayName: 'Anil Deshmukh',
    email: 'anil.it@campus.edu',
    role: 'staff',
    department: 'IT Support',
    designation: 'Senior Network & Systems Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isDemo: true,
  },
  libraryIncharge: {
    uid: 'demo_staff_library',
    displayName: 'Mrs. S. Bannerjee',
    email: 'library.head@campus.edu',
    role: 'staff',
    department: 'Library In-charge',
    designation: 'Chief Librarian & Facilities Officer',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
    isDemo: true,
  },
  principalOffice: {
    uid: 'demo_staff_principal',
    displayName: 'Prof. S. C. Joshi',
    email: 'principal.office@campus.edu',
    role: 'staff',
    department: 'Principal Office',
    designation: 'Principal & Head of Institution',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    isDemo: true,
  },
};

const STORAGE_KEY = 'fmc_active_user';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading auth from storage', e);
    }
    // Default logged-in user is Student Aarav for immediate demo testing!
    return DEMO_USERS.student;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed writing auth to storage', e);
    }
  }, [currentUser]);

  // Listen for Firebase Auth changes if Firebase is configured
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Only override if the current user isn't an intentional demo profile
        if (!currentUser?.isDemo) {
          const userObj = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.email)}&background=059669&color=fff`,
            role: 'student', // default for new signups
            department: null,
            isDemo: false,
          };
          setCurrentUser(userObj);
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser?.isDemo]);

  // Quick switch to any pre-defined demo role
  const loginAsDemo = (demoKey) => {
    setError(null);
    const demoUser = DEMO_USERS[demoKey] || DEMO_USERS.student;
    setCurrentUser(demoUser);
  };

  // Sign up with Email and Password
  const signupWithEmail = async (email, password, displayName, role = 'student', department = null) => {
    setLoading(true);
    setError(null);
    try {
      if (isFirebaseConfigured && auth) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        const userObj = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName,
          role,
          department,
          isDemo: false,
        };
        setCurrentUser(userObj);
        return userObj;
      } else {
        // Local simulation if Firebase keys not configured
        const userObj = {
          uid: `user_${Date.now()}`,
          email,
          displayName: displayName || email.split('@')[0],
          role,
          department,
          isDemo: true,
        };
        setCurrentUser(userObj);
        return userObj;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Email and Password
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      if (isFirebaseConfigured && auth) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userObj = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || email.split('@')[0],
          role: email.includes('staff') || email.includes('warden') ? 'staff' : 'student',
          department: email.includes('warden') ? 'Warden' : email.includes('electrician') ? 'Electrician' : null,
          isDemo: false,
        };
        setCurrentUser(userObj);
        return userObj;
      } else {
        // Match demo user or create mock session
        let matched = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!matched) {
          matched = {
            uid: `user_${Date.now()}`,
            email,
            displayName: email.split('@')[0],
            role: email.includes('admin') || email.includes('staff') ? 'staff' : 'student',
            department: email.includes('electrician') ? 'Electrician' : null,
            isDemo: true,
          };
        }
        setCurrentUser(matched);
        return matched;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const userObj = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          role: 'student',
          department: null,
          isDemo: false,
        };
        setCurrentUser(userObj);
        return userObj;
      } else {
        // Fallback simulate Google login
        const googleDemo = {
          uid: `google_${Date.now()}`,
          displayName: 'Google Campus User',
          email: 'campus.user@gmail.com',
          role: 'student',
          department: null,
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          isDemo: true,
        };
        setCurrentUser(googleDemo);
        return googleDemo;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn('Firebase signout warning', e);
      }
    }
    setCurrentUser(null);
  };

  // Update role dynamically (useful for switching roles in the UI)
  const updateUserRole = (role, department = null) => {
    setCurrentUser((prev) => (prev ? { ...prev, role, department } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        isFirebaseConfigured,
        loginAsDemo,
        signupWithEmail,
        loginWithEmail,
        loginWithGoogle,
        logout,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
