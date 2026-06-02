import { Link } from 'react-router'; 
import { usePreferences } from '../context/PreferencesContext';
import { NavBar } from '../components/NavBar';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  const { language } = usePreferences();
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <NavBar />
      <LoginForm />
      <div className="text-center text-sm -mt-8 pb-12">
        <span className="text-muted-foreground">
          {language === 'en' ? "Don't have an account? " : 'ليس لديك حساب؟ '}
        </span>
        <Link to="/register" className="text-primary hover:underline font-medium">
          {language === 'en' ? 'Register' : 'تسجيل'}
        </Link>
      </div>
    </div>
  );
}
