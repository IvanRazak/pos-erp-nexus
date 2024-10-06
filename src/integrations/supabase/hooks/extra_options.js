import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### extra_options

| name       | type                    | format                    | required |
|------------|-------------------------|---------------------------|----------|
| id         | uuid                    | uuid                      | true     |
| name       | text                    | string                    | true     |
| price      | numeric                 | number                    | true     |
| created_at | timestamp with time zone| string                    | false    |
| updated_at | timestamp with time zone| string                    | false    |
*/

export const useExtraOption = (id) => useQuery({
  queryKey: ['extra_options', id],
  queryFn: () => fromSupabase(supabase.from('extra_options').select('*').eq('id', id).single()),
});

export const useExtraOptions = () => useQuery({
  queryKey: ['extra_options'],
  queryFn: () => fromSupabase(supabase.from('extra_options').select('*')),
});

export const useAddExtraOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newExtraOption) => fromSupabase(supabase.from('extra_options').insert([newExtraOption])),
    onSuccess: () => {
      queryClient.invalidateQueries(['extra_options']);
    },
  });
};

export const useUpdateExtraOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('extra_options').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['extra_options']);
    },
  });
};

export const useDeleteExtraOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('extra_options').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['extra_options']);
    },
  });
};