import { useState, useEffect, useRef } from 'react';
import { Save, Camera, User, Phone, Briefcase, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';
import { doctorService, type DoctorProfile } from '../../services/doctor.service';
import { useApiCall } from '../../hooks/useApiCall';
import { toast } from 'sonner';
import client from '../../services/http/client';

function ProfileSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface FormState {
  bio: string;
  contact: string;
  years_of_experience: string;
  specialty_id: string;
  profile_picture: File | null;
  profile_picture_preview: string;
}

export function DoctorProfileEdit() {
  const { language } = usePreferences();
  const { user } = useAuth();
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [specialties, setSpecialties] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    client.get('/api/specialties/').then((r) => {
      setSpecialties(Array.isArray(r.data) ? r.data : r.data.results || []);
    }).catch(() => {});
  }, []);

  const { data: profile, loading } = useApiCall(
    () => doctorService.getProfile(),
    []
  );

  const [form, setForm] = useState<FormState>({
    bio: '',
    contact: '',
    years_of_experience: '0',
    profile_picture: null,
    profile_picture_preview: '',
  });
  const [saving, setSaving] = useState(false);

  // Populate form once profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        bio: profile.bio || '',
        contact: profile.contact || '',
        years_of_experience: String(profile.years_of_experience || 0),
        specialty_id: profile.specialty_id ? String(profile.specialty_id) : '',
        profile_picture: null,
        profile_picture_preview: profile.profile_picture || '',
      });
    }
  }, [profile]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'en' ? 'File too large (max 5 MB)' : 'حجم الملف كبير جداً (الحد الأقصى 5 ميجا)');
      return;
    }
    const preview = URL.createObjectURL(file);
    setForm((f) => ({ ...f, profile_picture: file, profile_picture_preview: preview }));
  };

  const handleSave = async () => {
    const exp = parseInt(form.years_of_experience, 10);
    if (isNaN(exp) || exp < 0) {
      toast.error(language === 'en' ? 'Years of experience must be a positive number' : 'يجب أن تكون سنوات الخبرة رقمًا موجبًا');
      return;
    }
    setSaving(true);
    try {
      await doctorService.updateProfile({
        bio: form.bio,
        contact: form.contact,
        years_of_experience: exp,
        specialty_id: form.specialty_id ? Number(form.specialty_id) : null,
        ...(form.profile_picture ? { profile_picture: form.profile_picture } : {}),
      });
      toast.success(
        language === 'en' ? 'Profile updated successfully!' : 'تم تحديث الملف الشخصي بنجاح!'
      );
    } catch (e: any) {
      toast.error(e.message || (language === 'en' ? 'Failed to update profile' : 'فشل تحديث الملف الشخصي'));
    } finally {
      setSaving(false);
    }
  };

  const doctorName = profile
    ? `Dr. ${[profile.user.first_name, profile.user.last_name].filter(Boolean).join(' ') || profile.user.email}`
    : user
    ? `Dr. ${[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}`
    : '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {language === 'en' ? 'Edit Profile' : 'تعديل الملف الشخصي'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en'
            ? 'Update your professional information visible to patients'
            : 'حدّث معلوماتك المهنية الظاهرة للمرضى'}
        </p>
      </div>

      {loading ? (
        <ProfileSkeleton />
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {form.profile_picture_preview ? (
                    <AvatarImage src={form.profile_picture_preview} alt={doctorName} />
                  ) : null}
                  <AvatarFallback className="text-2xl">
                    {doctorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 hover:bg-primary/90 transition-colors"
                  title={language === 'en' ? 'Change photo' : 'تغيير الصورة'}
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <div>
                <h3 className="font-semibold text-lg">{doctorName}</h3>
                {profile?.specialty && (
                  <p className="text-sm text-muted-foreground">{profile.specialty}</p>
                )}
              </div>

              {/* Account Status */}
              <div className="w-full space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{language === 'en' ? 'Status' : 'الحالة'}</span>
                  <Badge variant={profile?.user.is_approved ? 'default' : 'secondary'}>
                    {profile?.user.is_approved
                      ? language === 'en' ? 'Approved' : 'معتمد'
                      : language === 'en' ? 'Pending' : 'قيد الانتظار'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{language === 'en' ? 'Email' : 'البريد'}</span>
                  <span className="text-xs font-mono truncate max-w-[130px]">
                    {profile?.user.email || user?.email || '—'}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                {language === 'en' ? 'Change Photo' : 'تغيير الصورة'}
              </Button>
            </CardContent>
          </Card>

          {/* Form Card */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Professional Information' : 'المعلومات المهنية'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Read-only: name from user model */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {language === 'en' ? 'First Name' : 'الاسم الأول'}
                      </div>
                    </Label>
                    <Input
                      value={profile?.user.first_name || user?.first_name || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Last Name' : 'اسم العائلة'}</Label>
                    <Input
                      value={profile?.user.last_name || user?.last_name || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    {language === 'en' ? 'Specialty' : 'التخصص'}
                  </Label>
                  <Select
                    value={form.specialty_id}
                    onValueChange={(value) => setForm((f) => ({ ...f, specialty_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'en' ? 'Select a specialty' : 'اختر التخصص'} />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years_of_experience">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {language === 'en' ? 'Years of Experience' : 'سنوات الخبرة'}
                    </div>
                  </Label>
                  <Input
                    id="years_of_experience"
                    type="number"
                    min="0"
                    max="60"
                    value={form.years_of_experience}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, years_of_experience: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {language === 'en' ? 'Contact Number' : 'رقم التواصل'}
                    </div>
                  </Label>
                  <Input
                    id="contact"
                    type="tel"
                    value={form.contact}
                    onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                    placeholder={language === 'en' ? '+1 234 567 8900' : '+966 50 000 0000'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {language === 'en' ? 'Bio / About' : 'نبذة عنك'}
                    </div>
                  </Label>
                  <Textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    rows={5}
                    placeholder={
                      language === 'en'
                        ? 'Tell patients about your background, specializations, and approach...'
                        : 'أخبر المرضى عن خلفيتك وتخصصاتك وأسلوب عملك...'
                    }
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                  <Save className="h-4 w-4" />
                  {saving
                    ? language === 'en' ? 'Saving...' : 'جاري الحفظ...'
                    : t.save}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
