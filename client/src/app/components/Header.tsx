import { Moon, Sun, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../utils/translations';

export function Header() {
  const { language, setLanguage, theme, setTheme } = usePreferences();
  const t = translations[language];

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleLanguage}
        aria-label="Toggle language"
      >
        <Globe className="h-5 w-5" />
      </Button>
      <span className="text-sm text-muted-foreground">{language === 'en' ? 'EN' : 'عربي'}</span>
    </div>
  );
}
