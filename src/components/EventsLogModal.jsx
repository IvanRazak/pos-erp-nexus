import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Trash2, Search } from "lucide-react";
import PageSizeSelector from "./ui/page-size-selector";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EventsLogModal = ({ isOpen, onClose }) => {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const queryClient = useQueryClient();

  const { data: logs, isLoading } = useQuery({
    queryKey: ['events_log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events_log')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Extrair lista única de usuários dos logs
  const uniqueUsers = useMemo(() => {
    if (!logs) return [];
    const users = [...new Set(logs.map(log => log.user_name))];
    return users.sort();
  }, [logs]);

  // Filtrar logs com base na busca e usuário selecionado
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    
    return logs.filter(log => {
      const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUser = selectedUser === 'all' || log.user_name === selectedUser;
      return matchesSearch && matchesUser;
    });
  }, [logs, searchTerm, selectedUser]);

  const deleteLogMutation = useMutation({
    mutationFn: async (logId) => {
      const { error } = await supabase
        .from('events_log')
        .delete()
        .eq('id', logId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events_log'] });
      toast.success('Log excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir log: ' + error.message);
    }
  });

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  const handleDeleteLog = (logId) => {
    if (window.confirm('Tem certeza que deseja excluir este log?')) {
      deleteLogMutation.mutate(logId);
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleUserFilter = (value) => {
    setSelectedUser(value);
    setCurrentPage(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Log de Eventos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar na descrição..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-[200px]">
              <Select value={selectedUser} onValueChange={handleUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-4 flex justify-between items-center">
            <PageSizeSelector pageSize={pageSize} onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }} />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages || 1}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[500px] rounded-md border p-4">
          {isLoading ? (
            <p className="text-center">Carregando logs...</p>
          ) : paginatedLogs.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum log encontrado para os filtros selecionados.</p>
          ) : (
            <div className="space-y-4">
              {paginatedLogs.map((log) => (
                <div key={log.id} className="border-b pb-2 relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteLog(log.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{log.user_name}</span>
                    <span>{formatDate(log.created_at)}</span>
                  </div>
                  <p className="mt-1">{log.description}</p>
                  {log.ip_address && (
                    <p className="text-xs text-muted-foreground mt-1">IP: {log.ip_address}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EventsLogModal;
