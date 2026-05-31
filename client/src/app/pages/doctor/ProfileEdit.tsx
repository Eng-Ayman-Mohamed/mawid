import { useState, useEffect } from 'react';
import { Save, LogOut } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { NavBar } from '../../components/NavBar';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../apiService';
import { toast } from 'sonner';

export function DoctorProfileEdit() {
  const { language } = useMedicalApp();
  const { logout } = useAuth();
  const t = translations[language];

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    years_of_experience: '',
    contact: '',
  });

  useEffect(() => {
    apiService.getDoctorProfile()
      .then((data: any) => {
        setProfile(data);
        setFormData({
          bio: data.bio || '',
          years_of_experience: String(data.experience || ''),
          contact: data.contact || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updateDoctorProfile({
        bio: formData.bio,
        years_of_experience: Number(formData.years_of_experience) || 0,
        contact: formData.contact,
      });
      toast.success(language === 'en' ? 'Profile updated successfully!' : 'تم تحديث الملف الشخصي بنجاح!');
    } catch (err: any) {
      toast.error(err.message || (language === 'en' ? 'Update failed' : 'فشل التحديث'));
    } finally {
      setSaving(false);
    }
  };

  const navLinks = [
    { label: t.dashboard, to: '/doctor/dashboard' },
    { label: t.appointments, to: '/doctor/appointments' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar brandTo="/doctor/dashboard" links={navLinks} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{language === 'en' ? 'Edit Profile' : 'تعديل الملف الشخصي'}</h1>
          <Button variant="outline" size="sm" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            {language === 'en' ? 'Logout' : 'تسجيل الخروج'}
          </Button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full" />
            <div className="md:col-span-2 space-y-3">
              <Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile?.image} alt={profile?.name} />
                  <AvatarFallback>{profile?.name?.charAt(0) || 'D'}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{profile?.name}</h3>
                <p className="text-sm text-muted-foreground">{profile?.specialty}</p>
                <p className="text-xs text-muted-foreground mt-1">{profile?.email}</p>
              </CardContent>
            </Card>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'en' ? 'Professional Information' : 'المعلومات المهنية'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="years_of_experience">
                      {language === 'en' ? 'Years of Experience' : 'سنوات الخبرة'}
                    </Label>
                    <Input id="years_of_experience" type="number" value={formData.years_of_experience} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">{t.phone}</Label>
                    <Input id="contact" type="tel" value={formData.contact} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">{language === 'en' ? 'Bio' : 'نبذة'}</Label>
                    <Textarea id="bio" value={formData.bio} onChange={handleChange} rows={5} />
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
