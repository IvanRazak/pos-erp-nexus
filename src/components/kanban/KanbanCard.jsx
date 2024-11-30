import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { format, isBefore } from 'date-fns';

const KanbanCard = ({ item, index, onClick }) => {
  const isLateDelivery = item.delivery_date && 
    isBefore(new Date(item.delivery_date), new Date()) && 
    localStorage.getItem('lateOrdersHighlight') === 'true';

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white dark:bg-gray-700 p-4 rounded shadow cursor-pointer hover:shadow-md transition-shadow ${
            isLateDelivery ? 'animate-pulse bg-red-100 dark:bg-red-900/20' : ''
          }`}
          onClick={onClick}
        >
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <p className="font-semibold">Pedido #{item.order_number}</p>
              <p className={`text-sm ${isLateDelivery ? 'text-red-600 dark:text-red-400' : ''}`}>
                {item.delivery_date ? format(new Date(item.delivery_date), 'dd/MM/yyyy') : 'N/A'}
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {item.customer?.name}
            </p>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;