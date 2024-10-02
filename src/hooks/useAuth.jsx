import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;

      if (data && data.password_hash === password) {
        const userData = { username, isAdmin: data.role === 'admin' };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return true;
      } else {
        setError('Usuário ou senha inválidos');
        return false;
      }
    } catch (error) {
      setError('Ocorreu um erro durante o login');
      console.error('Erro de login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return { login, logout, error, user, loading };
};