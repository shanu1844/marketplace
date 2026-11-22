
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingBag,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

const menuItems = [
  {
    label: "Overview",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Seller Applications",
    path: "/admin/seller-applications",
    icon: Store,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Returns & Refunds",
    path: "/admin/returns",
    icon: RotateCcw,
  },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 rounded-2xl border border-[#E7E4DB] bg-white p-5 md:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-[#E4EBE3] p-3 text-[#174B38]">
            <ShieldCheck size={23} />
          </div>

          <div>
            <h2 className="font-bold text-[#174B38]">
              Admin Panel
            </h2>
            <p className="text-xs text-[#73786F]">
              Marketplace Management
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-[#174B38] text-white!"
                    : "text-[#73786F] hover:bg-[#E4EBE3] hover:text-[#174B38]"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Navigation */}
      <nav className="mb-5 flex w-full gap-2 overflow-x-auto rounded-2xl border border-[#E7E4DB] bg-white p-3 md:hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[#174B38] text-white!"
                  : "bg-[#F7F5EF] text-[#73786F]"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default AdminSidebar;
