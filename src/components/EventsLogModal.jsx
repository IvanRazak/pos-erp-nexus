import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import PageSizeSelector from "./ui/page-size-selector";

const EventsLogModal = ({ isOpen, onClose }) => {
  const [pageSize, setPageSize] = useState(10);

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

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Log de Eventos</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <PageSizeSelector pageSize={pageSize} onPageSizeChange={setPageSize} />
        </div>
        <ScrollArea className="h-[500px] rounded-md border p-4">
          {isLoading ? (
            <p className="text-center">Carregando logs...</p>
          ) : (
            <div className="space-y-4">
              {logs?.slice(0, pageSize).map((log, index) => (
                <div key={index} className="border-b pb-2">
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