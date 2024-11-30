import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { formatCurrency } from '../../utils/formatters';

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
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">Pedido #{item.order_number}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {item.customer?.name}
              </p>
            </div>
            <span className="text-sm font-medium">
              {formatCurrency(item.total_amount)}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;