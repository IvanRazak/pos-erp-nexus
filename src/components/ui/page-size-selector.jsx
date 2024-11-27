import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PageSizeSelector = ({ pageSize, onPageSizeChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Itens por página:</span>
      <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PageSizeSelector;