import { Link } from 'react-router'; 
import { usePreferences } from '../../context/PreferencesContext';
import { NavBar } from '../../components/NavBar';
import { RegisterForm } from '../../components/auth/RegisterForm';

export function PatientRegister() {
  const { language } = usePreferences();
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <NavBar
        actions={[
          { label: language === 'en' ? 'Sign In' : 'تسجيل الدخول', to: '/login', variant: 'ghost' },
        ]}
      />
      <RegisterForm />
      <div className="text-center text-sm -mt-8 pb-12">
        <span className="text-muted-foreground">
          {language === 'en' ? 'Already have an account? ' : 'لديك حساب بالفعل؟ '}
        </span>
        <Link to="/login" className="text-primary hover:underline font-medium">
          {language === 'en' ? 'Login' : 'تسجيل دخول'}
        </Link>
      </div>
    </div>
  );
}
