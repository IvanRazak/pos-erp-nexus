import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { format, parseISO, addHours } from 'date-fns';
import { useKanbanSettings } from '@/hooks/useKanbanSettings';

const KanbanCard = ({ item, index, onClick }) => {
  const { data: kanbanSettings } = useKanbanSettings();
  const now = new Date();
  const deliveryDate = item.delivery_date ? new Date(item.delivery_date) : null;
  const warningHours = kanbanSettings?.warning_hours || 0;
  const warningDate = deliveryDate ? addHours(deliveryDate, -warningHours) : null;
  
  const isLateDelivery = deliveryDate && 
    kanbanSettings?.late_orders_highlight &&
    (now >= deliveryDate || (warningHours > 0 && now >= warningDate));

  const formatDeliveryDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    return {
      date: format(date, 'dd/MM/yyyy'),
      time: format(date, 'HH:mm')
    };
  };

  const { date, time } = formatDeliveryDateTime(item.delivery_date);

  // Determina a intensidade do destaque com base no tempo até a entrega
  const getHighlightClass = () => {
    if (!isLateDelivery) return '';
    
    if (now >= deliveryDate) {
      // Pedido já está atrasado
      return 'animate-pulse bg-red-200/90 dark:bg-red-900/40';
    } else {
      // Pedido está dentro do período de alerta
      return 'animate-pulse bg-orange-600/20 dark:bg-orange-900/40';
    }
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white dark:bg-gray-700 p-4 rounded shadow cursor-pointer hover:shadow-md transition-shadow ${
            getHighlightClass()
          }`}
          onClick={onClick}
        >
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <p className="font-semibold">#{item.order_number}
              <p className="text-sm text-gray-600 dark:text-gray-300">
              {item.customer?.name}
            </p>
              </p>
              <div className="text-right">
                <p className={`text-sm ${isLateDelivery ? (now >= deliveryDate ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400') : ''}`}>
                  {date}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {time}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
