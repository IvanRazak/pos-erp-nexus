import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { format } from 'date-fns';

const KanbanCard = ({ item, index, onClick }) => {
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white dark:bg-gray-700 p-4 rounded shadow cursor-pointer hover:shadow-md transition-shadow"
          onClick={onClick}
        >
          <div className="flex flex-col gap-2">
            <div>
              <p className="font-semibold">Pedido #{item.order_number}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {item.customer?.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Data Entrega</p>
              <p className="text-sm">
                {item.delivery_date ? format(new Date(item.delivery_date), 'dd/MM/yyyy') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;