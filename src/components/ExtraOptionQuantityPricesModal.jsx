import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const ExtraOptionQuantityPricesModal = ({ isOpen, onClose, extraOptionId }) => {
  const { data: quantityPrices, isLoading } = useQuery({
    queryKey: ['extra_option_quantity_prices', extraOptionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('extra_option_quantity_prices')
        .select('*')
        .eq('extra_option_id', extraOptionId)
        .order('quantity', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!extraOptionId && isOpen
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Preços por Quantidade</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Última Atualização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Carregando...</TableCell>
                </TableRow>
              ) : quantityPrices?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Nenhum preço por quantidade encontrado</TableCell>
                </TableRow>
              ) : (
                quantityPrices?.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell>{price.quantity}</TableCell>
                    <TableCell>R$ {price.price.toFixed(2)}</TableCell>
                    <TableCell>{new Date(price.created_at).toLocaleString()}</TableCell>
                    <TableCell>{new Date(price.updated_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ExtraOptionQuantityPricesModal;