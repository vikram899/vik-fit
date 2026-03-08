import React, { createContext, useContext, useState } from 'react';

interface AuthContextValue {
  hasUser: boolean;
  setHasUser: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextValue>({
  hasUser: false,
  setHasUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasUser, setHasUser] = useState(false);
  return (
    <AuthContext.Provider value={{ hasUser, setHasUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
