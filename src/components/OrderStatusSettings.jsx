import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const OrderStatusSettings = ({ isOpen, onClose }) => {
  const [fullPaymentStatus, setFullPaymentStatus] = useState('in_production');
  const [partialPaymentStatus, setPartialPaymentStatus] = useState('partial_payment');
  const [zeroPaymentStatus, setZeroPaymentStatus] = useState('pending');
  const [allowZeroPayment, setAllowZeroPayment] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('orderStatusSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setFullPaymentStatus(settings.fullPaymentStatus || 'in_production');
      setPartialPaymentStatus(settings.partialPaymentStatus || 'partial_payment');
      setZeroPaymentStatus(settings.zeroPaymentStatus || 'pending');
      setAllowZeroPayment(settings.allowZeroPayment || false);
    }
  }, []);

  const handleSave = () => {
    const settings = {
      fullPaymentStatus,
      partialPaymentStatus,
      zeroPaymentStatus,
      allowZeroPayment
    };
    localStorage.setItem('orderStatusSettings', JSON.stringify(settings));
    toast.success("Configurações salvas com sucesso!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Status dos Pedidos</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Status para Pagamento Total</Label>
            <Select value={fullPaymentStatus} onValueChange={setFullPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_production">Em Produção</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status para Pagamento Parcial</Label>
            <Select value={partialPaymentStatus} onValueChange={setPartialPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="partial_payment">Pagamento Parcial</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_production">Em Produção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status para Pagamento Zero</Label>
            <Select value={zeroPaymentStatus} onValueChange={setZeroPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_production">Em Produção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allow-zero-payment"
              checked={allowZeroPayment}
              onCheckedChange={setAllowZeroPayment}
            />
            <Label htmlFor="allow-zero-payment">Permitir pagamento com valor zero</Label>
          </div>

          <Button onClick={handleSave} className="w-full">Salvar Configurações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusSettings;