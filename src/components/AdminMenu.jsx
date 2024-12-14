import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

// Components
import GerenciarOpcoesExtras from './GerenciarOpcoesExtras';
import GerenciarOpcoesSelecao from './GerenciarOpcoesSelecao';
import PrintTemplateEditor from './PrintTemplateEditor';
import PdfTemplateEditor from './PdfTemplateEditor';
import EventsLogModal from './EventsLogModal';
import OrderStatusSettings from './OrderStatusSettings';
import UserList from './UserList';
import RolePermissionsManager from './RolePermissionsManager';

// Hooks
import { 
  useAddPaymentOption, 
  useAddCustomerType, 
  useAddUser, 
  useWebhookSettings, 
  useUpdateWebhookSettings 
} from '../integrations/supabase';
import { useKanbanSettings, useUpdateKanbanSettings } from '@/hooks/useKanbanSettings';

const AdminMenu = () => {
  const [isGerenciarOpcoesExtrasOpen, setIsGerenciarOpcoesExtrasOpen] = useState(false);
  const [isGerenciarOpcoesSelecaoOpen, setIsGerenciarOpcoesSelecaoOpen] = useState(false);
  const [isEventsLogOpen, setIsEventsLogOpen] = useState(false);
  const [isOrderStatusSettingsOpen, setIsOrderStatusSettingsOpen] = useState(false);
  const [isWebhookSettingsOpen, setIsWebhookSettingsOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isPermissionsManagerOpen, setIsPermissionsManagerOpen] = useState(false);

  const { data: kanbanSettings, isLoading: isLoadingKanbanSettings } = useKanbanSettings();
  const updateKanbanSettings = useUpdateKanbanSettings();
  
  const addPaymentOption = useAddPaymentOption();
  const addCustomerType = useAddCustomerType();
  const addUser = useAddUser();
  const { data: webhookSettings } = useWebhookSettings();
  const updateWebhookSettings = useUpdateWebhookSettings();

  const KanbanSettings = () => {
    const { data: settings } = useKanbanSettings();
    const { mutate: updateSettings } = useUpdateKanbanSettings();

    const handleLateOrdersHighlightChange = (e) => {
      updateSettings({
        ...settings,
        late_orders_highlight: e.target.checked
      });
    };

    const handleWarningHoursChange = (e) => {
      const hours = parseInt(e.target.value) || 0;
      updateSettings({
        ...settings,
        warning_hours: hours
      });
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Configurações do Kanban</h3>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="lateOrdersHighlight"
            checked={settings?.late_orders_highlight || false}
            onChange={handleLateOrdersHighlightChange}
            className="h-4 w-4 text-blue-600"
          />
          <label htmlFor="lateOrdersHighlight">
            Destacar pedidos atrasados
          </label>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="warningHours">
            Horas de antecedência para alerta
          </label>
          <input
            type="number"
            id="warningHours"
            min="0"
            value={settings?.warning_hours || 0}
            onChange={handleWarningHoursChange}
            className="px-3 py-2 border rounded"
          />
        </div>
      </div>
    );
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

  const handleGerenciarUsuarios = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');
  
    addUser.mutate({ 
      username, 
      email, 
      password_hash: password, // Usando a senha diretamente
      role 
    }, {
      onSuccess: () => {
        toast.success("Usuário cadastrado com sucesso!");
        event.target.reset();
      },
      onError: (error) => {
        toast.error("Erro ao cadastrar usuário: " + error.message);
      }
    });
  };

  const handleWebhookSettingsSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const webhook_url = formData.get('webhookUrl');

    try {
      await updateWebhookSettings.mutateAsync({ webhook_url });
      toast.success("URL do webhook atualizada com sucesso!");
      setIsWebhookSettingsOpen(false);
    } catch (error) {
      toast.error("Erro ao atualizar URL do webhook: " + error.message);
    }
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
              <KanbanSettings />
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

          <Dialog open={isUserManagementOpen} onOpenChange={setIsUserManagementOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Gerenciar Usuários</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Gerenciar Usuários</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  <form onSubmit={handleGerenciarUsuarios} className="space-y-4 mb-8">
                    <h3 className="text-lg font-semibold">Adicionar Novo Usuário</h3>
                    <Input name="username" placeholder="Nome do usuário" required />
                    <Input name="email" type="email" placeholder="E-mail" required />
                    <Input name="password" type="password" placeholder="Senha" required />
                    <Select name="role" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Nível de acesso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="operator">Operador</SelectItem>
                        <SelectItem value="seller">Vendedor</SelectItem>
                        <SelectItem value="producao">Produção</SelectItem>
                        <SelectItem value="gerente">Gerente</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit">Adicionar Usuário</Button>
                  </form>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Usuários Existentes</h3>
                    <UserList />
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Dialog open={isPermissionsManagerOpen} onOpenChange={setIsPermissionsManagerOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Gerenciar Permissões de Acesso</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Gerenciar Permissões de Acesso</DialogTitle>
              </DialogHeader>
              <RolePermissionsManager />
            </DialogContent>
          </Dialog>

          <Dialog open={isWebhookSettingsOpen} onOpenChange={setIsWebhookSettingsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Configurar Webhook</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar URL do Webhook</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleWebhookSettingsSubmit}>
                <Input 
                  name="webhookUrl" 
                  placeholder="URL do webhook" 
                  defaultValue={webhookSettings?.webhook_url}
                  className="mb-4" 
                />
                <Button type="submit">Salvar</Button>
              </form>
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
