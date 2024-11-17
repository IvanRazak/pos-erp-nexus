# Sistema de Gestão para Gráfica - Especificação Detalhada

## Visão Geral
Sistema web completo para gestão de gráfica, incluindo gerenciamento de pedidos, clientes, produtos, financeiro e relatórios.

## Tecnologias Principais
- React com Vite
- Tailwind CSS
- shadcn/ui para componentes de UI
- Supabase para backend
- Tanstack Query para gerenciamento de estado e requisições
- React Router para navegação

## Funcionalidades Principais

### 1. Autenticação
- Login com email/senha
- Proteção de rotas
- Níveis de acesso (admin, operador, vendedor)

### 2. Gestão de Clientes
- Cadastro completo com dados pessoais e endereço
- Categorização por tipo (PF/PJ)
- Histórico de pedidos
- Observações e notas
- Bloqueio de clientes

### 3. Gestão de Produtos
- Cadastro de produtos com:
  - Nome, descrição
  - Preço de venda e custo
  - Número de vias
  - Cores
  - Formato
  - Tipo de impressão (frente/frente e verso)
  - Tipo de unidade (unidade, pacote, metro quadrado, folhas)
- Suporte a produtos com preço por metro quadrado
- Sistema de precificação por quantidade para produtos do tipo folhas
- Opções extras configuráveis (acabamentos, materiais, etc.)
- Valor mínimo para produtos por metro quadrado

### 4. Sistema de Vendas
- Interface intuitiva de PDV
- Seleção de cliente
- Busca de produtos
- Carrinho de compras com:
  - Quantidade
  - Dimensões (altura x largura)
  - Cálculo de m²
  - Opções extras
  - Desconto por item
  - Observações por item
  - Opção de arte (única/múltipla)
- Desconto geral
- Valor adicional com descrição
- Data de entrega
- Opções de pagamento
- Pagamento parcial
- Número sequencial de pedido

### 5. Financeiro
- Visualização de saldos restantes
- Registro de pagamentos
- Filtros por:
  - Data
  - Cliente
  - Número do pedido
  - Opção de pagamento
  - Valor
- Status do pedido (produção, aguardando aprovação, pronto para retirada, entregue, cancelado)

### 6. Relatórios
- Vendas por período
- Produtos mais vendidos
- Clientes mais ativos
- Fluxo de caixa
- Status dos pedidos

## Detalhes Técnicos

### Produtos
- Suporte a diferentes tipos de precificação
- Cálculo automático de preços baseado em m² ou quantidade
- Sistema de opções extras com:
  - Checkbox
  - Número
  - Seleção
  - Preços fixos ou variáveis
  - Preços por quantidade

### Pedidos
- Sistema de numeração sequencial
- Cálculo automático de saldo restante
- Histórico de pagamentos
- Status automaticamente atualizado baseado em pagamentos

### Interface
- Design responsivo
- Toasts para feedback
- Modais para ações importantes
- Tabelas com ordenação e filtros
- Formulários validados
- Campos de busca com autocompleção