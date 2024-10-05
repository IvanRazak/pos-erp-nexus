import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExtraOptions } from '../integrations/supabase';

const ProdutoExtraOptionsModal = ({ produto, onClose, onConfirm }) => {
  const [extrasEscolhidas, setExtrasEscolhidas] = useState([]);
  const [quantidade, setQuantidade] = useState(1);
  const [altura, setAltura] = useState('');
  const [largura, setLargura] = useState('');
  const [m2, setM2] = useState(0);
  const { data: opcoesExtras } = useExtraOptions();

  const handleExtraChange = (extra) => {
    setExtrasEscolhidas(prev => {
      const isAlreadySelected = prev.some(item => item.id === extra.id);
      if (isAlreadySelected) {
        return prev.filter(item => item.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const updateM2 = (newAltura, newLargura) => {
    setM2((parseFloat(newAltura) * parseFloat(newLargura)).toFixed(2));
  };

  const handleConfirm = () => {
    onConfirm({
      ...produto,
      quantidade,
      altura: parseFloat(altura) || 0,
      largura: parseFloat(largura) || 0,
      m2: parseFloat(m2) || 0,
      extras: extrasEscolhidas
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opções Extras para {produto.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Quantidade"
            value={quantidade}
            onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
          />
          {produto.unit_type === 'square_meter' && (
            <>
              <Input
                type="number"
                placeholder="Altura"
                value={altura}
                onChange={(e) => {
                  const newAltura = e.target.value;
                  setAltura(newAltura);
                  updateM2(newAltura, largura);
                }}
              />
              <Input
                type="number"
                placeholder="Largura"
                value={largura}
                onChange={(e) => {
                  const newLargura = e.target.value;
                  setLargura(newLargura);
                  updateM2(altura, newLargura);
                }}
              />
              <Input
                type="number"
                placeholder="M²"
                value={m2}
                readOnly
              />
            </>
          )}
          {opcoesExtras?.filter(opcao => produto.extra_options?.includes(opcao.id)).map((opcao) => (
            <div key={opcao.id} className="flex items-center space-x-2">
              <Checkbox
                id={`extra-${opcao.id}`}
                checked={extrasEscolhidas.some(item => item.id === opcao.id)}
                onCheckedChange={() => handleExtraChange(opcao)}
              />
              <label htmlFor={`extra-${opcao.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {opcao.name} - R$ {opcao.price.toFixed(2)}
              </label>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProdutoExtraOptionsModal;