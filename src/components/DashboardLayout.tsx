import { useEffect, useState } from "react";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import { Mail, FileText, Send, LogOut, Home, Menu, X, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) navigate("/");
  }, [navigate]);

  // Handle logout

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  const navItems = [
    // { label: "Dashboard", path: "/index", icon: Home },
   { label: "Templates", path: "/dashboard", icon: FileText },
    { label: "Email Campaigns", path: "/send-campaign", icon: Send },
    { label: "voice agent", path: "/voice-agent", icon: Phone },
    { path: "/contacts", label: "Contacts", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-sidebar flex flex-col shadow-xl transition-all duration-300 z-50 ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Logo */}
        <div className="p-3 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-sidebar-primary rounded-lg">
              <Mail className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="text-sidebar-foreground font-bold text-lg leading-tight">
                  LynksApp
                </h1>
                <p className="text-sidebar-foreground/70 text-xs">
                  Lead Management CRM
                </p>
              </div>
            )}
          </div>

          <button
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground ml-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 px-3 space-y-1">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {isSidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 ${
              !isSidebarOpen ? "justify-center px-0" : ""
            }`}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 bg-background overflow-y-auto transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {/* ===== Top bar when sidebar collapsed ===== */}
        {!isSidebarOpen && (
          <div className="sticky top-0 z-50 flex items-center bg-background border-b border-gray-200 px-4 py-3 shadow-sm">
            <button
              className="text-gray-700 hover:text-gray-900"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="ml-3 text-lg font-semibold text-gray-800">
              LynksApp
            </h1>
          </div>
        )}

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
