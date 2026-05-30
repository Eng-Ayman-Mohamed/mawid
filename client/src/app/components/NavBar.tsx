import { useState } from 'react';
import { Link } from 'react-router';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Header } from './Header';
import { useMedicalApp } from '../context/MedicalAppContext';

export interface NavLink {
  label: string;
  to: string;
  variant?: 'ghost' | 'outline' | 'default';
}

interface NavBarProps {
  brand?: string;
  brandTo?: string;
  links?: NavLink[];
  actions?: NavLink[];
}

const BRAND_NAME = { en: 'Mawid', ar: 'مواعيد' };

export function NavBar({ brandTo = '/', links = [], actions = [] }: NavBarProps) {
  const { language } = useMedicalApp();
  const [open, setOpen] = useState(false);

  const brand = BRAND_NAME[language];

  return (
    <>
      <nav className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to={brandTo} className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">م</span>
                </div>
                <span className="font-semibold">{brand}</span>
              </Link>

              {/* Desktop links */}
              {links.length > 0 && (
                <div className="hidden md:flex items-center gap-6">
                  {links.map((l) => (
                    <Link key={l.to} to={l.to} className="text-sm hover:text-primary transition-colors">
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop right side */}
            <div className="hidden md:flex items-center gap-3">
              <Header />
              {actions.map((a) => (
                <Link key={a.to} to={a.to}>
                  <Button variant={a.variant ?? 'ghost'} size="sm">{a.label}</Button>
                </Link>
              ))}
            </div>

            {/* Mobile hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <Header />
              <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-card shadow-xl flex flex-col p-6 gap-6">
            <div className="flex items-center justify-between">
              <Link to={brandTo} onClick={() => setOpen(false)} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">م</span>
                </div>
                <span className="font-semibold">{brand}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {actions.length > 0 && (
              <div className="flex flex-col gap-2 mt-auto">
                {actions.map((a) => (
                  <Link key={a.to} to={a.to} onClick={() => setOpen(false)}>
                    <Button variant={a.variant ?? 'ghost'} className="w-full">{a.label}</Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
