import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import PageSizeSelector from './ui/page-size-selector';
import { Button } from './ui/button';

const EventsLogModal = ({ isOpen, onClose, events }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = events?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((events?.length || 0) / itemsPerPage);

  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Log de Eventos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <PageSizeSelector pageSize={itemsPerPage} onPageSizeChange={handlePageSizeChange} />
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems?.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      {format(parseISO(event.event_date), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{event.user_name}</TableCell>
                    <TableCell>{event.ip_address}</TableCell>
                    <TableCell>{event.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, events?.length || 0)} de {events?.length || 0} registros
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventsLogModal;