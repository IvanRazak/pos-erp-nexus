import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSelectionOptions, useAddSelectionOption, useUpdateSelectionOption, useDeleteSelectionOption } from '../integrations/supabase';
import { toast } from "sonner";

const GerenciarOpcoesSelecao = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOption, setEditingOption] = useState(null);
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
        toast.success(`Opção de seleção ${option.id ? 'atualizada' : 'cadastrada'} com sucesso!`);
        setEditingOption(null);
        refetch();
      },
      onError: (error) => {
        toast.error(`Erro ao ${option.id ? 'atualizar' : 'cadastrar'} opção de seleção: ${error.message}`);
      }
    });
  };

  const handleDeleteSelectionOption = (id) => {
    deleteSelectionOption.mutate(id, {
      onSuccess: () => {
        toast.success("Opção de seleção excluída com sucesso!");
        setEditingOption(null);
        refetch();
      },
      onError: (error) => {
        toast.error("Erro ao excluir opção de seleção: " + error.message);
      }
    });
  };

  const renderOptionForm = () => (
    <div className="space-y-4">
      <Input
        placeholder="Nome da opção"
        value={editingOption?.name || ''}
        onChange={(e) => setEditingOption({ ...editingOption, name: e.target.value })}
      />
      <Input
        type="number"
        placeholder="Valor"
        value={editingOption?.value || ''}
        onChange={(e) => setEditingOption({ ...editingOption, value: parseFloat(e.target.value) })}
      />
      <Button onClick={() => handleSaveSelectionOption(editingOption)}>
        {editingOption?.id ? 'Atualizar' : 'Adicionar'}
      </Button>
    </div>
  );

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
                <span>{option.name} - R$ {option.value.toFixed(2)}</span>
                <div>
                  <Button onClick={() => setEditingOption(option)} className="mr-2">Editar</Button>
                  <Button variant="destructive" onClick={() => handleDeleteSelectionOption(option.id)}>Excluir</Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Button onClick={() => setEditingOption({ name: '', value: '' })} className="mt-4">Adicionar Nova Opção de Seleção</Button>
        {editingOption && renderOptionForm()}
      </DialogContent>
    </Dialog>
  );
};

export default GerenciarOpcoesSelecao;
