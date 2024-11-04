import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSystemLogs } from '../integrations/supabase/hooks/system_logs';
import { format } from 'date-fns';

const SystemLogs = ({ isOpen, onClose }) => {
  const { data: logs, isLoading } = useSystemLogs();

  if (isLoading) {
    return <div>Carregando logs...</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Logs do Sistema</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Tabela</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Nível</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                  <TableCell>{log.username}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.table_name}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      log.level === 'error' ? 'bg-red-100 text-red-800' :
                      log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {log.level}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SystemLogs;