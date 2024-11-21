import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PageSizeSelector = ({ pageSize, onPageSizeChange }) => {
  return (
    <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Items per page" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="10">10 per page</SelectItem>
        <SelectItem value="20">20 per page</SelectItem>
        <SelectItem value="50">50 per page</SelectItem>
        <SelectItem value="100">100 per page</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default PageSizeSelector;