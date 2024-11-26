import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAddEventLog } from '../integrations/supabase/hooks/events_log';

export const useAuth = () => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const addEventLog = useAddEventLog();

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

      if (!username || !password) {
        setError('Usuário e senha são obrigatórios');
        return false;
      }

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError || !user) {
        setError('Usuário não encontrado');
        return false;
      }

      if (user.password_hash !== password) {
        setError('Senha incorreta');
        return false;
      }

      const userData = {
        id: user.id,
        username: user.username,
        isAdmin: user.role === 'admin',
        role: user.role
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Log do evento de login com IP padrão para teste
      await addEventLog.mutateAsync({
        user_name: username,
        description: 'Login realizado com sucesso',
        ip_address: '127.0.0.1'
      });

      return true;
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro ao fazer login. Tente novamente.');
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