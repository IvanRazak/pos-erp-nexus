import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useAddPaymentOption, useAddCustomerType } from '../integrations/supabase';
import { toast } from "sonner";
import GerenciarOpcoesExtras from './GerenciarOpcoesExtras';
import GerenciarOpcoesSelecao from './GerenciarOpcoesSelecao';
import PrintTemplateEditor from './PrintTemplateEditor';
import PdfTemplateEditor from './PdfTemplateEditor';
import EventsLogModal from './EventsLogModal';
import OrderStatusSettings from './OrderStatusSettings';
import UserManagementDialog from './UserManagementDialog';
import { Menu } from 'lucide-react';

const AdminMenu = () => {
  const [isGerenciarOpcoesExtrasOpen, setIsGerenciarOpcoesExtrasOpen] = useState(false);
  const [isGerenciarOpcoesSelecaoOpen, setIsGerenciarOpcoesSelecaoOpen] = useState(false);
  const [isEventsLogOpen, setIsEventsLogOpen] = useState(false);
  const [isOrderStatusSettingsOpen, setIsOrderStatusSettingsOpen] = useState(false);
  const [isLateOrdersHighlightEnabled, setIsLateOrdersHighlightEnabled] = useState(() => {
    return localStorage.getItem('lateOrdersHighlight') === 'true';
  });
  
  const addPaymentOption = useAddPaymentOption();
  const addCustomerType = useAddCustomerType();

  const handleLateOrdersHighlightChange = (checked) => {
    setIsLateOrdersHighlightEnabled(checked);
    localStorage.setItem('lateOrdersHighlight', checked);
    toast.success(checked ? "Destaque de pedidos atrasados ativado" : "Destaque de pedidos atrasados desativado");
  };

  const handleCadastrarOpcaoPagamento = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('paymentOption');
    addPaymentOption.mutate({ name }, {
      onSuccess: () => {
        toast.success("Opção de pagamento cadastrada com sucesso!");
        event.target.reset();
      },
      onError: (error) => {
        toast.error("Erro ao cadastrar opção de pagamento: " + error.message);
      }
    });
  };

  const handleCadastrarTipoCliente = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('customerType');
    addCustomerType.mutate({ name }, {
      onSuccess: () => {
        toast.success("Tipo de cliente cadastrado com sucesso!");
        event.target.reset();
      },
      onError: (error) => {
        toast.error("Erro ao cadastrar tipo de cliente: " + error.message);
      }
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 right-4">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menu Administrativo</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">Configurar Destaque de Pedidos Atrasados</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Destaque de Pedidos Atrasados</DialogTitle>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isLateOrdersHighlightEnabled}
                  onCheckedChange={handleLateOrdersHighlightChange}
                />
                <span>
                  {isLateOrdersHighlightEnabled ? "Desativar" : "Ativar"} destaque de pedidos atrasados
                </span>
              </div>
            </DialogContent>
          </Dialog>

          <Button className="w-full" onClick={() => setIsOrderStatusSettingsOpen(true)}>
            Configurar Status dos Pedidos
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">Cadastrar Opção de Pagamento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Opção de Pagamento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCadastrarOpcaoPagamento}>
                <Input name="paymentOption" placeholder="Nome da opção de pagamento" className="mb-4" />
                <Button type="submit">Cadastrar</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">Cadastrar Tipo de Cliente</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Tipo de Cliente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCadastrarTipoCliente}>
                <Input name="customerType" placeholder="Nome do tipo de cliente" className="mb-4" />
                <Button type="submit">Cadastrar</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">Gerenciar Usuários</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Gerenciar Usuários</DialogTitle>
              </DialogHeader>
              <UserManagementDialog />
            </DialogContent>
          </Dialog>

          <PrintTemplateEditor />
          
          <PdfTemplateEditor />

          <Button className="w-full" onClick={() => setIsGerenciarOpcoesExtrasOpen(true)}>
            Gerenciar Opções Extras
          </Button>

          <Button className="w-full" onClick={() => setIsGerenciarOpcoesSelecaoOpen(true)}>
            Gerenciar Opções de Seleção
          </Button>

          <Button className="w-full" onClick={() => setIsEventsLogOpen(true)}>
            Log de Eventos
          </Button>
        </div>

        <OrderStatusSettings
          isOpen={isOrderStatusSettingsOpen}
          onClose={() => setIsOrderStatusSettingsOpen(false)}
        />

        <GerenciarOpcoesExtras
          isOpen={isGerenciarOpcoesExtrasOpen}
          onClose={() => setIsGerenciarOpcoesExtrasOpen(false)}
        />

        <GerenciarOpcoesSelecao
          isOpen={isGerenciarOpcoesSelecaoOpen}
          onClose={() => setIsGerenciarOpcoesSelecaoOpen(false)}
        />

        <EventsLogModal
          isOpen={isEventsLogOpen}
          onClose={() => setIsEventsLogOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
};

export default AdminMenu;