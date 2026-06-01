import { useState, useEffect } from 'react';
import { User, Mail, Phone, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../utils/translations';
import { patientService } from '../../services/patient.service'; 
import { toast } from 'sonner';

export function PatientProfile() {
  const { language } = usePreferences();
  const t = translations[language];

  // Starting empty state to fill with real Django data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 🔑 Step 1: Fetch real data from Django when the profile page opens
  useEffect(() => {
    patientService.getProfile()
      .then((data) => {
        // Adapt fields depending on exactly how your backend serializer names them
        setFormData({
          name: data.name || data.user?.first_name + ' ' + (data.user?.last_name || '') || '',
          email: data.email || data.user?.email || '',
          phone: data.phone || data.phone_number || '',
          dateOfBirth: data.dateOfBirth || data.date_of_birth || '',
          address: data.address || '',
        });
        setLoading(false);
      })
      .catch((error) => {
        toast.error(language === 'en' ? 'Failed to fetch profile' : 'فشل في تحميل الملف الشخصي');
        setLoading(false);
      });
  }, [language]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // 🔑 Step 2: Use Axios to send a PATCH request to your backend view
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Map frontend variable naming to backend database field expectations if necessary
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth, // Django style match
        address: formData.address,
      };

      await patientService.updateProfile(payload);
      toast.success(language === 'en' ? 'Profile updated successfully!' : 'تم تحديث الملف الشخصي بنجاح!');
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to save updates.' : 'فشل في حفظ التعديلات.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick fallback layout while waiting for Axios to reply
  if (loading) {
    return <div className="p-8 text-center">{language === 'en' ? 'Loading profile...' : 'جاري التحميل...'}</div>;
  }

  // Generate clean initials for Avatar fallback badge
  const initials = formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'P';

  return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold mb-6">{t.profile}</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{formData.name || '—'}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'en' ? 'Patient' : 'مريض'}
              </p>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Personal Information' : 'المعلومات الشخصية'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t.name}
                      </div>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">
                      {language === 'en' ? 'Date of Birth' : 'تاريخ الميلاد'}
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t.email}
                    </div>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {t.phone}
                    </div>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">
                    {language === 'en' ? 'Address' : 'العنوان'}
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <Button onClick={handleSave} className="w-full gap-2" disabled={isSaving}>
                  <Save className="h-4 w-4" />
                  {isSaving ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') : t.save}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}