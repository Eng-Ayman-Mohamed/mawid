import { Link } from 'react-router';
import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Header } from '../../components/Header';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { mockDoctors } from '../../data/mockData';
import { toast } from 'sonner';

export function DoctorProfileEdit() {
  const { language } = useMedicalApp();
  const t = translations[language];
  const currentDoctor = mockDoctors[0];

  const [formData, setFormData] = useState({
    name: currentDoctor.name,
    specialty: currentDoctor.specialty,
    experience: currentDoctor.experience.toString(),
    bio: currentDoctor.bio,
    email: 'sarah.johnson@medical.com',
    phone: '+1 234 567 8900',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSave = () => {
    toast.success(language === 'en' ? 'Profile updated successfully!' : 'تم تحديث الملف الشخصي بنجاح!');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/doctor/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">M</span>
              </div>
              <span className="font-semibold">
                {language === 'en' ? 'MediCare' : 'ميديكير'}
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Header />
              <Link to="/doctor/dashboard">
                <Button variant="ghost">{t.dashboard}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {language === 'en' ? 'Edit Profile' : 'تعديل الملف الشخصي'}
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={currentDoctor.image} alt={currentDoctor.name} />
                <AvatarFallback>{currentDoctor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{formData.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{formData.specialty}</p>
              <Button variant="outline" size="sm" className="w-full">
                {language === 'en' ? 'Change Photo' : 'تغيير الصورة'}
              </Button>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Professional Information' : 'المعلومات المهنية'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.name}</Label>
                    <Input id="name" value={formData.name} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">
                      {language === 'en' ? 'Specialty' : 'التخصص'}
                    </Label>
                    <Input id="specialty" value={formData.specialty} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">
                    {language === 'en' ? 'Years of Experience' : 'سنوات الخبرة'}
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phone}</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">
                    {language === 'en' ? 'Bio' : 'نبذة'}
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
                <Button onClick={handleSave} className="w-full gap-2">
                  <Save className="h-4 w-4" />
                  {t.save}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}