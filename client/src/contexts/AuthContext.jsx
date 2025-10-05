import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';


const AuthContext = createContext();

export function AuthProvider({ children }){
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);

  useEffect(()=> {
    if(token) {
      localStorage.setItem('token', token);
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch(e) {
        console.error('Invalid token', e);
        setUser(null);
      }
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  function loginWithToken(t) { setToken(t); }
  function logout() { setToken(null); }

  return (
    <AuthContext.Provider value={{ token, loginWithToken, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(){ return useContext(AuthContext); }
