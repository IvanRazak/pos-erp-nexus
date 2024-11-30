import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ id, title, items, onItemClick }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
      <h2 className="font-semibold mb-4">{title}</h2>
      <Droppable droppableId={id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2 min-h-[200px]"
          >
            {items.map((item, index) => (
              <KanbanCard
                key={item.id}
                item={item}
                index={index}
                onClick={() => onItemClick(item)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;