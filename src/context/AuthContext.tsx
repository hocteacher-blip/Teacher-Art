import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/lms';
import { StorageService } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string) => boolean;
  register: (userData: Partial<User>) => User;
  switchUser: (userId: string) => void;
  logout: () => void;
  isRole: (role: UserRole) => boolean;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const refreshUsers = () => {
    const db = StorageService.loadDatabase();
    setUsers(db.users || []);
    
    // Check saved active user id
    const savedUserId = localStorage.getItem('ELEMS_ACTIVE_USER_ID');
    if (savedUserId && db.users?.length > 0) {
      const found = db.users.find(u => u.id === savedUserId);
      if (found) {
        setCurrentUser(found);
        return;
      }
    }

    if (!db.users || db.users.length === 0) {
      setCurrentUser(null);
      localStorage.removeItem('ELEMS_ACTIVE_USER_ID');
      return;
    }

    // Default to the authentic Teacher (Thầy Nguyễn Văn Học - Hoc.teacher@gmail.com)
    const teacher = db.users.find(u => u.email.toLowerCase() === 'hoc.teacher@gmail.com') ||
                    db.users.find(u => u.role === 'teacher') ||
                    db.users[0];
    if (teacher) {
      setCurrentUser(teacher);
      localStorage.setItem('ELEMS_ACTIVE_USER_ID', teacher.id);
    } else {
      setCurrentUser(null);
      localStorage.removeItem('ELEMS_ACTIVE_USER_ID');
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const login = (email: string): boolean => {
    const db = StorageService.loadDatabase();
    const found = db.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() ||
           u.code.toLowerCase() === email.toLowerCase()
    );
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('ELEMS_ACTIVE_USER_ID', found.id);
      return true;
    }
    return false;
  };

  const register = (userData: Partial<User>): User => {
    const db = StorageService.loadDatabase();
    const rawUsername = userData.username || (userData.email ? userData.email.split('@')[0] : 'user' + Date.now());
    const newUser: User = {
      id: 'USR_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: userData.name || 'Người dùng mới',
      username: rawUsername.toLowerCase().trim(),
      email: userData.email || `${rawUsername}@th-tieuhoc.edu.vn`,
      role: userData.role || 'teacher',
      status: 'active',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      code: userData.code || (userData.role === 'teacher' ? 'GV-' + Math.floor(100 + Math.random() * 900) : 'ND-' + Math.floor(1000 + Math.random() * 9000)),
      schoolId: 'SCH_01',
      className: userData.className,
      classId: userData.classId,
      phone: userData.phone || '',
      birthDate: userData.birthDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextDb = {
      ...db,
      users: [...(db.users || []), newUser],
    };
    StorageService.saveDatabase(nextDb);
    setUsers(nextDb.users);
    setCurrentUser(newUser);
    localStorage.setItem('ELEMS_ACTIVE_USER_ID', newUser.id);
    return newUser;
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('ELEMS_ACTIVE_USER_ID', found.id);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ELEMS_ACTIVE_USER_ID');
  };

  const isRole = (role: UserRole) => {
    return currentUser?.role === role;
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, register, switchUser, logout, isRole, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
