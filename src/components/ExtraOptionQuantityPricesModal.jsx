import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from "@/components/ui/use-toast";

const ExtraOptionQuantityPricesModal = ({ isOpen, onClose, extraOptionId }) => {
  const queryClient = useQueryClient();
  
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

  const updatePrice = useMutation({
    mutationFn: async ({ id, quantity, price }) => {
      const { error } = await supabase
        .from('extra_option_quantity_prices')
        .update({ quantity, price })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['extra_option_quantity_prices', extraOptionId]);
      toast({
        title: "Preço atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar preço",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deletePrice = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('extra_option_quantity_prices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['extra_option_quantity_prices', extraOptionId]);
      toast({
        title: "Preço removido com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover preço",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleUpdate = async (id, field, value) => {
    const price = quantityPrices.find(p => p.id === id);
    if (!price) return;

    const updatedPrice = {
      ...price,
      [field]: parseFloat(value)
    };

    updatePrice.mutate({
      id,
      quantity: updatedPrice.quantity,
      price: updatedPrice.price
    });
  };

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
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Carregando...</TableCell>
                </TableRow>
              ) : quantityPrices?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Nenhum preço por quantidade encontrado</TableCell>
                </TableRow>
              ) : (
                quantityPrices?.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell>
                      <Input
                        type="number"
                        defaultValue={price.quantity}
                        onBlur={(e) => handleUpdate(price.id, 'quantity', e.target.value)}
                        min="1"
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        defaultValue={price.price}
                        onBlur={(e) => handleUpdate(price.id, 'price', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>{new Date(price.created_at).toLocaleString()}</TableCell>
                    <TableCell>{new Date(price.updated_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deletePrice.mutate(price.id)}
                      >
                        Excluir
                      </Button>
                    </TableCell>
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