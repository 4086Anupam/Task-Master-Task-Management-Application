import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar, { getNavItems } from './Sidebar';
import useAuthStore from '../../store/authStore';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const navItems = getNavItems(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="md:hidden sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              TaskMaster
            </h1>
            <p className="text-xs text-muted-foreground truncate max-w-48">{user?.role || 'User'}</p>
          </div>

          <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DialogTrigger render={<Button variant="outline" size="icon" className="shrink-0" />}>
              <Menu size={18} />
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-1rem)] max-w-sm p-0 overflow-hidden sm:max-w-sm">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <p className="text-xs text-muted-foreground">Navigate your workspace</p>
                </div>
                <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                  <X size={18} />
                </Button>
              </div>

              <div className="p-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                        isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-primary' : ''} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <div className="mt-4 rounded-xl bg-muted/50 p-4">
                  <p className="text-sm font-medium">Role: {user?.role}</p>
                </div>

                <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 overflow-y-auto min-h-screen relative">
        <div className="max-w-6xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
