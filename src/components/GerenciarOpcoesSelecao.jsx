import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSelectionOptions, useAddSelectionOption, useUpdateSelectionOption, useDeleteSelectionOption } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";
import SelectOptionsModal from './SelectOptionsModal';

const GerenciarOpcoesSelecao = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOption, setEditingOption] = useState(null);
  const [isSelectOptionsModalOpen, setIsSelectOptionsModalOpen] = useState(false);
  const { data: selectionOptions, refetch } = useSelectionOptions();
  const addSelectionOption = useAddSelectionOption();
  const updateSelectionOption = useUpdateSelectionOption();
  const deleteSelectionOption = useDeleteSelectionOption();

  const filteredOptions = selectionOptions?.filter(option => 
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveSelectionOption = (option) => {
    const saveFunction = option.id ? updateSelectionOption : addSelectionOption;
    saveFunction.mutate(option, {
      onSuccess: () => {
        toast({ title: `Opção de seleção ${option.id ? 'atualizada' : 'cadastrada'} com sucesso!` });
        setEditingOption(null);
        refetch();
      },
      onError: (error) => {
        toast({ title: `Erro ao ${option.id ? 'atualizar' : 'cadastrar'} opção de seleção`, description: error.message, variant: "destructive" });
      }
    });
  };

  const handleDeleteSelectionOption = (id) => {
    deleteSelectionOption.mutate(id, {
      onSuccess: () => {
        toast({ title: "Opção de seleção excluída com sucesso!" });
        setEditingOption(null);
        refetch();
      },
      onError: (error) => {
        toast({ title: "Erro ao excluir opção de seleção", description: error.message, variant: "destructive" });
      }
    });
  };

  const handleOpenSelectOptions = (option) => {
    setEditingOption(option);
    setIsSelectOptionsModalOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Opções de Seleção</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Buscar opção de seleção..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {filteredOptions?.map((option) => (
              <div key={option.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                <span>{option.name}</span>
                <div>
                  <Button onClick={() => handleOpenSelectOptions(option)} className="mr-2">Editar</Button>
                  <Button variant="destructive" onClick={() => handleDeleteSelectionOption(option.id)}>Excluir</Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Button onClick={() => handleOpenSelectOptions({ name: '', items: [] })} className="mt-4">Adicionar Nova Opção de Seleção</Button>
      </DialogContent>
      <SelectOptionsModal
        isOpen={isSelectOptionsModalOpen}
        onClose={() => setIsSelectOptionsModalOpen(false)}
        onSave={(items) => {
          handleSaveSelectionOption({ ...editingOption, items });
          setIsSelectOptionsModalOpen(false);
        }}
        initialOptions={editingOption?.items || []}
        title={editingOption?.id ? 'Editar Opção de Seleção' : 'Nova Opção de Seleção'}
      />
    </Dialog>
  );
};

export default GerenciarOpcoesSelecao;