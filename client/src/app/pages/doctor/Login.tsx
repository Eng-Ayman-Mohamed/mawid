import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { NavBar } from '../../components/NavBar';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';
import { toast } from 'sonner';

export function DoctorLogin() {
  const { language, setUserRole } = useMedicalApp();
  const { login } = useAuth();
  const t = translations[language];
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'doctor') {
        toast.error(language === 'en' ? 'This login is for doctors only.' : 'هذا الدخول للأطباء فقط.');
        return;
      }
      setUserRole('doctor');
      navigate('/doctor/dashboard');
    } catch (err: any) {
      toast.error(err.message || (language === 'en' ? 'Login failed' : 'فشل تسجيل الدخول'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="flex items-center justify-center py-20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{language === 'en' ? 'Doctor Portal' : 'بوابة الأطباء'}</CardTitle>
            <CardDescription>
              {language === 'en'
                ? 'Sign in to manage your appointments and patients'
                : 'سجل الدخول لإدارة مواعيدك ومرضاك'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input id="email" type="email" required placeholder="doctor@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <Input id="password" type="password" required
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t.loading : t.login}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {language === 'en' ? 'Are you a patient? ' : 'هل أنت مريض؟ '}
                <Link to="/login" className="text-primary hover:underline">{t.login}</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
