import { HomeIcon, ClipboardListIcon } from "lucide-react";
import Index from "./pages/Index.jsx";
import PedidosKanban from "./pages/PedidosKanban.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Pedidos",
    to: "/pedidos-kanban",
    icon: <ClipboardListIcon className="h-4 w-4" />,
    page: <PedidosKanban />,
  },
];