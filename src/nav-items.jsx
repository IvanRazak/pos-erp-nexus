import {
  Users,
  Package,
  ShoppingCart,
  ClipboardList,
  KanbanSquare,
  DollarSign,
  FileText,
} from "lucide-react";

export const navItems = [
  {
    title: "Venda",
    href: "/",
    icon: ShoppingCart,
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    title: "Produtos",
    href: "/produtos",
    icon: Package,
  },
  {
    title: "Pedidos",
    href: "/pedidos",
    icon: ClipboardList,
  },
  {
    title: "Pedidos Kanban",
    href: "/pedidos-kanban",
    icon: KanbanSquare,
  },
  {
    title: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
  },
  {
    title: "Relatórios",
    href: "/relatorios",
    icon: FileText,
  },
];