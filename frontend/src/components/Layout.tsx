import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store";
import { cn } from "@/lib/utils";

const ALL_MODULES = [
  { path: "/hrms",      label: "HRMS",         roles: ["Admin", "HR"] },
  { path: "/crm",       label: "CRM",          roles: ["Admin", "Sales"] },
  { path: "/erp",       label: "ERP",          roles: ["Admin", "Finance", "PM"] },
  { path: "/finance",   label: "Finance",      roles: ["Admin", "Finance"] },
  { path: "/pm",        label: "Projects",     roles: ["Admin", "PM", "Employee"] },
  { path: "/ai",        label: "AI Copilot",   roles: ["Admin", "HR", "Sales", "Finance", "PM", "Employee"] },
  { path: "/analytics", label: "Analytics",    roles: ["Admin"] },
];

export default function Layout() {
  const { role, name, department, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const permitted = ALL_MODULES.filter((m) => role && m.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <nav className="w-52 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-gray-700">
          <div className="font-bold text-base tracking-wide">Enterprise OS</div>
          <div className="text-xs text-gray-400 mt-1">{name}</div>
          <div className="text-xs text-gray-500">{role} · {department}</div>
        </div>

        <div className="flex-1 flex flex-col gap-0.5 p-2 mt-1">
          {permitted.map((m) => (
            <Link
              key={m.path}
              to={m.path}
              className={cn(
                "px-3 py-2 rounded text-sm transition-colors",
                location.pathname.startsWith(m.path)
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              {m.label}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
