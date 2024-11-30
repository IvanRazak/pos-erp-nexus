import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useOrders } from '../integrations/supabase/hooks/orders';
import { useUpdateOrder } from '../integrations/supabase/hooks/orders';
import { useAddEventLog } from '../integrations/supabase/hooks/events_log';
import KanbanColumn from '../components/kanban/KanbanColumn';
import KanbanPedidoDetalhesModal from '../components/kanban/KanbanPedidoDetalhesModal';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../hooks/useAuth';

const PedidosKanban = () => {
  const { data: orders, isLoading } = useOrders();
  const updateOrder = useUpdateOrder();
  const addEventLog = useAddEventLog();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedPedido, setSelectedPedido] = React.useState(null);

  const columns = {
    'awaiting_approval': {
      title: 'Aguardando Aprovação',
      items: orders?.filter(order => order.status === 'awaiting_approval') || []
    },
    'in_production': {
      title: 'Em Produção',
      items: orders?.filter(order => order.status === 'in_production') || []
    },
    'ready_for_pickup': {
      title: 'Pronto para Retirada',
      items: orders?.filter(order => order.status === 'ready_for_pickup') || []
    },
    'delivered': {
      title: 'Entregue',
      items: orders?.filter(order => order.status === 'delivered') || []
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    const order = orders.find(o => o.id === draggableId);

    try {
      await updateOrder.mutateAsync({
        id: draggableId,
        status: newStatus
      });

      await addEventLog.mutateAsync({
        user_name: user.username,
        description: `Status do Pedido #${order.order_number} alterado para ${columns[newStatus].title}`
      });

      toast({
        title: "Status atualizado",
        description: `Pedido movido para ${columns[newStatus].title}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do pedido",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <KanbanColumn
              key={columnId}
              id={columnId}
              title={column.title}
              items={column.items}
              onItemClick={setSelectedPedido}
            />
          ))}
        </div>
      </DragDropContext>

      {selectedPedido && (
        <KanbanPedidoDetalhesModal
          pedido={selectedPedido}
          onClose={() => setSelectedPedido(null)}
        />
      )}
    </div>
  );
};

export default PedidosKanban;