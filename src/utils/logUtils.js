import { useAddSystemLog } from '../integrations/supabase/hooks/system_logs';

export const createSystemLog = async (addSystemLog, {
  userId,
  username,
  action,
  tableName,
  recordId,
  description,
  level = 'info'
}) => {
  try {
    await addSystemLog.mutateAsync({
      user_id: userId,
      username,
      action,
      table_name: tableName,
      record_id: recordId.toString(),
      description,
      level
    });
  } catch (error) {
    console.error('Erro ao criar log:', error);
  }
};