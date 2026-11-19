import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';
import { AuthContext } from './AuthContext.js';
const ADMIN_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const ADMIN_SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

function readTokenExpiry(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)).exp * 1000;
  } catch {
    return 0;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('samthar_admin_token') || '');
  const [user, setUser] = useState(() => {
    if (!localStorage.getItem('samthar_admin_token')) return null;
    try {
      const saved = localStorage.getItem('samthar_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('samthar_admin_token')));

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    localStorage.removeItem('samthar_admin_token');
    localStorage.removeItem('samthar_admin_user');
  }, []);

  const updateToken = useCallback((nextToken) => {
    setToken(nextToken);
    localStorage.setItem('samthar_admin_token', nextToken);
  }, []);

  useEffect(() => {
    if (!token) return undefined;

    // Verify token with server
    apiFetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        localStorage.setItem('samthar_admin_user', JSON.stringify(data.user));
      })
      .catch((error) => {
        if ([401, 403, 404].includes(error.status)) {
          logout();
        } else {
          // Keep a valid session during a transient API outage; a network blip
          // must not look like the admin account disappeared.
          console.warn('[Admin Auth] Session verification temporarily unavailable:', error.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, logout]);

  useEffect(() => {
    if (!token) return undefined;

    let idleTimer;
    const tokenExpiry = readTokenExpiry(token) || Date.now() + ADMIN_SESSION_MAX_AGE_MS;
    const resetIdleTimer = () => {
      window.clearTimeout(idleTimer);
      const remainingSession = tokenExpiry - Date.now();
      if (remainingSession <= 0) {
        logout();
        return;
      }
      idleTimer = window.setTimeout(logout, Math.min(ADMIN_IDLE_TIMEOUT_MS, remainingSession));
    };
    const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'mousemove'];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      window.clearTimeout(idleTimer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, resetIdleTimer));
    };
  }, [token, logout]);

  const login = async (username, password) => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to authenticate');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('samthar_admin_token', data.token);
    localStorage.setItem('samthar_admin_user', JSON.stringify(data.user));
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateToken, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}
