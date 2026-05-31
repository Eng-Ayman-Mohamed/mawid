import { useState, useEffect } from 'react';
import { User, Mail, Phone, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { NavBar } from '../../components/NavBar';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../apiService';
import { toast } from 'sonner';

export function PatientProfile() {
  const { language } = useMedicalApp();
  const { user, logout } = useAuth();
  const t = translations[language];

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ phone: '', date_of_birth: '', address: '' });

  useEffect(() => {
    apiService.getPatientProfile()
      .then((data: any) => {
        setProfile(data);
        setFormData({
          phone: data.phone || '',
          date_of_birth: data.date_of_birth || '',
          address: data.address || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updatePatientProfile(formData);
      toast.success(language === 'en' ? 'Profile updated successfully!' : 'تم تحديث الملف الشخصي بنجاح!');
    } catch (err: any) {
      toast.error(err.message || (language === 'en' ? 'Update failed' : 'فشل التحديث'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const displayName = user ? `${user.first_name} ${user.last_name}`.trim() || user.email : '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const navLinks = [{ label: t.myAppointments, to: '/my-appointments' }, { label: t.findDoctor, to: '/doctors' }];

  return (
    <div className="min-h-screen bg-background">
      <NavBar links={navLinks} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{t.profile}</h1>
          <Button variant="outline" onClick={handleLogout}>
            {language === 'en' ? 'Logout' : 'تسجيل الخروج'}
          </Button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full" />
            <div className="md:col-span-2 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{displayName}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-1">{language === 'en' ? 'Patient' : 'مريض'}</p>
              </CardContent>
            </Card>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'en' ? 'Personal Information' : 'المعلومات الشخصية'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        <div className="flex items-center gap-2"><User className="h-4 w-4" />{language === 'en' ? 'First Name' : 'الاسم الأول'}</div>
                      </Label>
                      <Input value={user?.first_name || ''} readOnly className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'en' ? 'Last Name' : 'اسم العائلة'}</Label>
                      <Input value={user?.last_name || ''} readOnly className="bg-muted" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{t.email}</div>
                    </Label>
                    <Input value={user?.email || ''} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{t.phone}</div>
                    </Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">{language === 'en' ? 'Date of Birth' : 'تاريخ الميلاد'}</Label>
                    <Input id="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">{language === 'en' ? 'Address' : 'العنوان'}</Label>
                    <Input id="address" value={formData.address} onChange={handleChange} />
                  </div>
                  <Button onClick={handleSave} className="w-full gap-2" disabled={saving}>
                    <Save className="h-4 w-4" />
                    {saving ? t.loading : t.save}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
