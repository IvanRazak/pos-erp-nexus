import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ArteModal = ({ isOpen, onClose, onConfirm }) => {
  const [arteOption, setArteOption] = React.useState("mesma_arte");

  const handleConfirm = () => {
    onConfirm(arteOption);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Todos são do mesmo arquivo?</DialogTitle>
        </DialogHeader>
        <RadioGroup value={arteOption} onValueChange={setArteOption}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mesma_arte" id="mesma_arte" />
            <Label htmlFor="mesma_arte">Mesma Arte</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="arte_diferente" id="arte_diferente" />
            <Label htmlFor="arte_diferente">Arte Diferente</Label>
          </div>
        </RadioGroup>
        <Button onClick={handleConfirm}>Confirmar</Button>
      </DialogContent>
    </Dialog>
  );
};

export default ArteModal;