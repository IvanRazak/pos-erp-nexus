import React from 'react';
import { Input } from "@/components/ui/input";

const VendaDateTime = ({ dataEntrega, setDataEntrega }) => {
  const handleDateTimeChange = (e) => {
    const selectedDateTime = e.target.value ? new Date(e.target.value) : null;
    setDataEntrega(selectedDateTime);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Data e Hora de Entrega</label>
      <Input
        type="datetime-local"
        value={dataEntrega ? dataEntrega.toISOString().slice(0, 16) : ''}
        onChange={handleDateTimeChange}
        className="w-full"
      />
    </div>
  );
};

export default VendaDateTime;