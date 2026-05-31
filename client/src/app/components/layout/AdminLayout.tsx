import { Outlet, Link, useNavigate } from 'react-router';
import { LayoutDashboard, Users, Calendar, Activity, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Header } from '../Header';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../utils/translations';

export function AdminLayout() {
  const { language } = usePreferences();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: t.dashboard, to: '/admin/dashboard', icon: LayoutDashboard },
    { label: t.users, to: '/admin/users', icon: Users },
    { label: t.appointments, to: '/admin/appointments', icon: Calendar },
    { label: t.specialties, to: '/admin/specialties', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
              <Link to="/admin/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">M</span>
                </div>
                <span className="font-semibold">{language === 'en' ? 'Mawid Admin' : 'مواعيد - إدارة'}</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link key={item.to} to={item.to}>
                    <Button variant="ghost" size="sm">{item.label}</Button>
                  </Link>
                ))}
              </div>
              <Header />
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.email}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-card shadow-xl p-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors mt-auto text-destructive"
            >
              <LogOut className="h-4 w-4" />
              {language === 'en' ? 'Logout' : 'تسجيل خروج'}
            </button>
          </div>
        </div>
      )}

      <main>
        <Outlet />
      </main>
    </div>
  );
}
