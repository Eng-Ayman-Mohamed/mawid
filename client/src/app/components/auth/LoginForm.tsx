import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { loginSchema, type LoginFormData } from '../../utils/validators/auth.schema';
import { translations } from '../../utils/translations';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const redirectMap: Record<string, string> = {
  patient: '/my-appointments',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard',
};

export function LoginForm() {
  const { language } = usePreferences();
  const { login } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await login(data.email, data.password);
      const target = redirectMap[user.role];
      navigate(target || '/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-xl border shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {language === 'en' ? 'Sign In' : 'تسجيل الدخول'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'en'
              ? 'Sign in to your account'
              : 'سجل الدخول إلى حسابك'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (language === 'en' ? 'Signing in...' : 'جاري التسجيل...') : t.login}
          </Button>
        </form>
      </div>
    </div>
  );
}
