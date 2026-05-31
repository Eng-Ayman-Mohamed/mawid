import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { registerSchema, type RegisterFormData } from '../../utils/validators/auth.schema';
import { translations } from '../../utils/translations';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function RegisterForm() {
  const { language } = usePreferences();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor'>('patient');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: selectedRole,
      });
      navigate(selectedRole === 'doctor' ? '/doctor/dashboard' : '/my-appointments');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-xl border shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {language === 'en' ? 'Create Account' : 'إنشاء حساب'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'en'
              ? 'Choose your role and fill in your details'
              : 'اختر دورك واملأ بياناتك'}
          </p>
        </div>

        {/* Role Picker */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSelectedRole('patient')}
            className={`flex-1 p-3 rounded-lg border-2 text-center transition-colors ${
              selectedRole === 'patient'
                ? 'border-primary bg-primary/5 text-primary font-medium'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <div className="text-sm">
              {language === 'en' ? 'Patient' : 'مريض'}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('doctor')}
            className={`flex-1 p-3 rounded-lg border-2 text-center transition-colors ${
              selectedRole === 'doctor'
                ? 'border-primary bg-primary/5 text-primary font-medium'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <div className="text-sm">
              {language === 'en' ? 'Doctor' : 'طبيب'}
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.name}</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone}</Label>
            <Input id="phone" type="tel" {...register('phone')} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {language === 'en' ? 'Confirm Password' : 'تأكيد كلمة المرور'}
            </Label>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (language === 'en' ? 'Creating account...' : 'جاري الإنشاء...') : t.register}
          </Button>
        </form>
      </div>
    </div>
  );
}
