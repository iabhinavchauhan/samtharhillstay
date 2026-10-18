import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('samthar_user_token') || '');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('samthar_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Sync token and user profile
  useEffect(() => {
    if (!token) {
      setUser(null);
      setCart([]);
      setCartTotal(0);
      setLoading(false);
      localStorage.removeItem('samthar_user_token');
      localStorage.removeItem('samthar_user_profile');
      return;
    }

    localStorage.setItem('samthar_user_token', token);

    // Verify token & fetch fresh profile and cart
    Promise.all([
      fetch('/api/user/me', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(async ([profileRes, cartRes]) => {
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData.user);
          localStorage.setItem('samthar_user_profile', JSON.stringify(profileData.user));
        } else {
          logout();
        }

        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCart(cartData.items || []);
          setCartTotal(cartData.totalAmount || 0);
        }
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed. Please check credentials.');
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('samthar_user_token', data.token);
    localStorage.setItem('samthar_user_profile', JSON.stringify(data.user));
    return data.user;
  };

  const signup = async (name, email, password, phone = '') => {
    const res = await fetch('/api/user/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Signup failed. Please try again.');
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('samthar_user_token', data.token);
    localStorage.setItem('samthar_user_profile', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setCart([]);
    setCartTotal(0);
    localStorage.removeItem('samthar_user_token');
    localStorage.removeItem('samthar_user_profile');
  };

  const updateProfile = async (updates) => {
    if (!token) throw new Error('Not authenticated');
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile.');
    setUser(data.user);
    localStorage.setItem('samthar_user_profile', JSON.stringify(data.user));
    return data.user;
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!token) throw new Error('Not authenticated');
    const res = await fetch('/api/user/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password.');
    return data.message;
  };

  const fetchCart = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.items || []);
        setCartTotal(data.totalAmount || 0);
      }
    } catch (err) {
      console.warn('Error fetching cart:', err);
    }
  }, [token]);

  const addToCart = async (itemPayload) => {
    if (!token) {
      throw new Error('AUTH_REQUIRED');
    }
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(itemPayload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not add to cart.');
    setCart(data.items || []);
    setCartTotal(data.totalAmount || 0);
    return data;
  };

  const updateCartItem = async (itemId, updates) => {
    if (!token) return;
    const res = await fetch(`/api/cart/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not update item.');
    setCart(data.items || []);
    setCartTotal(data.totalAmount || 0);
    return data;
  };

  const removeFromCart = async (itemId) => {
    if (!token) return;
    const res = await fetch(`/api/cart/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not remove item.');
    setCart(data.items || []);
    setCartTotal(data.totalAmount || 0);
    return data;
  };

  const clearCart = async () => {
    if (!token) return;
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setCart([]);
    setCartTotal(0);
  };

  const recordRecentView = async (staySlug) => {
    if (!token || !staySlug) return;
    try {
      await fetch('/api/user/recent-views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ staySlug })
      });
    } catch {
      // Non-blocking
    }
  };

  const fetchRecentViews = async () => {
    if (!token) return [];
    try {
      const res = await fetch('/api/user/recent-views', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        return data.stays || [];
      }
    } catch {
      return [];
    }
    return [];
  };

  const fetchBookings = async () => {
    if (!token) return [];
    const res = await fetch('/api/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load bookings');
    const data = await res.json();
    return data.bookings || [];
  };

  const fetchPayments = async () => {
    if (!token) return [];
    const res = await fetch('/api/payments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load payment history');
    const data = await res.json();
    return data.payments || [];
  };

  return (
    <UserAuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token && !!user,
        cart,
        cartCount: cart.length,
        cartTotal,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        recordRecentView,
        fetchRecentViews,
        fetchBookings,
        fetchPayments
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}
