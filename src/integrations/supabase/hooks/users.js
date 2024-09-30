import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useUser = (id) => useQuery({
  queryKey: ['users', id],
  queryFn: () => fromSupabase(supabase.from('users').select('*').eq('id', id).single()),
});

export const useUsers = () => useQuery({
  queryKey: ['users'],
  queryFn: () => fromSupabase(supabase.from('users').select('*')),
});

export const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newUser) => fromSupabase(supabase.from('users').insert([newUser])),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('users').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('users').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const getUserByUsername = async (username) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data; // This will be null if no user is found
};
