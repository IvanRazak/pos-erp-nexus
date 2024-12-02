import { HomeIcon, ClipboardListIcon, FileTextIcon } from "lucide-react";
import Index from "./pages/Index.jsx";
import PedidosKanban from "./pages/PedidosKanban.jsx";
import Relatorios from "./components/Relatorios.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/dashboard",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Pedidos",
    to: "/dashboard/pedidos-kanban",
    icon: <ClipboardListIcon className="h-4 w-4" />,
    page: <PedidosKanban />,
  },
  {
    title: "Relatórios",
    to: "/dashboard/relatorios",
    icon: <FileTextIcon className="h-4 w-4" />,
    page: <Relatorios />,
  },
];