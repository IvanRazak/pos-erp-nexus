import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useExtraOptions, useAddExtraOption, useUpdateExtraOption, useDeleteExtraOption } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";
import ExtraOptionForm from './ExtraOptionForm';
import SelectOptionsModal from './SelectOptionsModal';

const GerenciarOpcoesExtras = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOption, setEditingOption] = useState(null);
  const [isSelectOptionsModalOpen, setIsSelectOptionsModalOpen] = useState(false);
  const [currentExtraOption, setCurrentExtraOption] = useState(null);
  const { data: extraOptions, refetch } = useExtraOptions();
  const addExtraOption = useAddExtraOption();
  const updateExtraOption = useUpdateExtraOption();
  const deleteExtraOption = useDeleteExtraOption();

  const filteredOptions = extraOptions?.filter(option => 
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveExtraOption = (extraOption) => {
    const saveFunction = extraOption.id ? updateExtraOption : addExtraOption;
    const optionToSave = {
      ...extraOption,
      options: extraOption.options ? JSON.stringify(extraOption.options) : null
    };
    saveFunction.mutate(optionToSave, {
      onSuccess: () => {
        toast({ title: `Opção extra ${extraOption.id ? 'atualizada' : 'cadastrada'} com sucesso!` });
        setEditingOption(null);
        refetch();
      },
      onError: (error) => {
        toast({ title: `Erro ao ${extraOption.id ? 'atualizar' : 'cadastrar'} opção extra`, description: error.message, variant: "destructive" });
      }
    });
  };

  const handleDeleteExtraOption = (id) => {
    deleteExtraOption.mutate(id, {
      onSuccess: () => {
        toast({ title: "Opção extra excluída com sucesso!" });
        setEditingOption(null);
        refetch();
      },
      onError: (error) => {
        toast({ title: "Erro ao excluir opção extra", description: error.message, variant: "destructive" });
      }
    });
  };

  const handleOpenSelectOptions = (extraOption) => {
    setCurrentExtraOption(extraOption);
    setIsSelectOptionsModalOpen(true);
  };

  const handleSaveSelectOptions = (options) => {
    setCurrentExtraOption(prev => ({ ...prev, options }));
    setIsSelectOptionsModalOpen(false);
    if (editingOption) {
      handleSaveExtraOption({ ...editingOption, options });
    }
  };

  const parseOptions = (optionsString) => {
    try {
      return optionsString ? JSON.parse(optionsString) : [];
    } catch (error) {
      console.error("Error parsing options:", error);
      return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Opções Extras</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Buscar opção extra..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {filteredOptions?.map((option) => (
              <div key={option.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                <span>{option.name} - R$ {option.price?.toFixed(2)}</span>
                <Button onClick={() => setEditingOption(option)}>Editar</Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Button onClick={() => setEditingOption({})} className="mt-4">Adicionar Nova Opção Extra</Button>
      </DialogContent>
      {editingOption && (
        <Dialog open={!!editingOption} onOpenChange={() => setEditingOption(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingOption.id ? 'Editar' : 'Adicionar'} Opção Extra</DialogTitle>
            </DialogHeader>
            <ExtraOptionForm
              extraOption={{...editingOption, options: parseOptions(editingOption.options)}}
              onSave={handleSaveExtraOption}
              onDelete={editingOption.id ? () => handleDeleteExtraOption(editingOption.id) : undefined}
              onOpenSelectOptions={handleOpenSelectOptions}
            />
          </DialogContent>
        </Dialog>
      )}
      <SelectOptionsModal
        isOpen={isSelectOptionsModalOpen}
        onClose={() => setIsSelectOptionsModalOpen(false)}
        onSave={handleSaveSelectOptions}
        initialOptions={parseOptions(currentExtraOption?.options)}
      />
    </Dialog>
  );
};

export default GerenciarOpcoesExtras;