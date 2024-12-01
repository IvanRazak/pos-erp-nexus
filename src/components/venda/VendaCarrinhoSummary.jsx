import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VendaCarrinhoSummary = ({
  desconto,
  setDesconto,
  valorAdicional,
  setValorAdicional,
  descricaoValorAdicional,
  setDescricaoValorAdicional,
  dataEntrega,
  setDataEntrega,
  opcaoPagamento,
  setOpcaoPagamento,
  opcoesPagamento,
  valorPago,
  setValorPago,
  total,
  handleDateChange,
  handleTimeChange,
  finalizarVenda
}) => {
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Desconto Geral (R$)</label>
          <Input 
            type="number" 
            placeholder="0.00" 
            value={desconto} 
            onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Valor Adicional (R$)</label>
          <Input 
            type="number" 
            placeholder="0.00" 
            value={valorAdicional} 
            onChange={(e) => setValorAdicional(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Descrição do Valor Adicional</label>
          <Input 
            type="text" 
            placeholder="Ex: Taxa de entrega" 
            value={descricaoValorAdicional} 
            onChange={(e) => setDescricaoValorAdicional(e.target.value)}
          />
        </div>
      </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data e Hora de Entrega</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-[200px] justify-start text-left font-normal", !dataEntrega && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataEntrega ? format(dataEntrega, "PPP") : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dataEntrega} onSelect={handleDateTimeSelect} initialFocus />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={handleTimeChange}
                  className="w-[120px]"
                />
              </div>
            </div>
          </div>

          // ... keep existing code (payment options and paid amount)
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Forma de Pagamento</label>
          <Select onValueChange={setOpcaoPagamento} value={opcaoPagamento}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {opcoesPagamento?.map((opcao) => (
                <SelectItem key={opcao.id} value={opcao.name}>{opcao.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Valor Pago (R$)</label>
          <Input 
            type="number" 
            placeholder="0.00" 
            value={valorPago} 
            onChange={(e) => setValorPago(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
        <p className="text-xl font-bold">Total: R$ {total.toFixed(2)}</p>
        <p className="text-xl font-bold">Saldo Restante: R$ {Math.max(total - valorPago, 0).toFixed(2)}</p>
        <button 
          onClick={finalizarVenda}
          className="w-full mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          Finalizar Venda
        </button>
      </div>
    </div>
  );
};

export default VendaCarrinhoSummary;
