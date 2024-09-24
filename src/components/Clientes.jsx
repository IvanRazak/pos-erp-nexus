import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClienteForm from './ClienteForm';
import ClienteList from './ClienteList';

const Clientes = () => {
  const [activeTab, setActiveTab] = useState("lista");

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Clientes</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="lista">Lista de Clientes</TabsTrigger>
          <TabsTrigger value="cadastro">Cadastro de Cliente</TabsTrigger>
        </TabsList>
        <TabsContent value="lista">
          <ClienteList />
        </TabsContent>
        <TabsContent value="cadastro">
          <ClienteForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Clientes;
