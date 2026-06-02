import { Link, useParams } from 'react-router'; 
import { Star, Award, Users, Calendar, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Header } from '../../components/Header';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../utils/translations';
import { patientService } from '../../services/patient.service'; 
import { useApiCall } from '../../hooks/useApiCall';

export function DoctorProfile() {
  const { id } = useParams();
  const { language } = usePreferences();
  const t = translations[language];
  const isRTL = language === 'ar';

  // 🔑 Step 1: Use your real custom API hook instead of mock data
  const { data: doctor, loading, error } = useApiCall(
    () => patientService.getDoctor(id || ''),
    [id]
  );

  // Hardcoded placeholders for metrics if your backend model doesn't have rating fields yet
  const rating = doctor?.rating || '4.9';
  const reviewsCount = doctor?.reviewsCount || doctor?.patients || '120';
  const patientsCount = doctor?.patientsTreated || doctor?.patients || '500';
  const experienceYears = doctor?.experience || '5';

  // Fallback slots for display purposes
  const availableSlots = [
    { date: '2026-06-02', times: ['9:00 AM', '10:30 AM', '2:00 PM', '4:00 PM'] },
    { date: '2026-06-03', times: ['9:00 AM', '11:00 AM', '3:00 PM'] },
    { date: '2026-06-04', times: ['10:00 AM', '1:00 PM', '3:30 PM', '5:00 PM'] },
  ];

  if (loading) {
    return <div className="p-8 text-center">{language === 'en' ? 'Loading profile...' : 'جاري التحميل...'}</div>;
  }

  if (error || !doctor) {
    return <div className="p-8 text-center">{language === 'en' ? 'Doctor not found' : 'الطبيب غير موجود'}</div>;
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
<img src="/favicon.png" alt="Mawid" className="w-8 h-8 rounded-lg" />
              <span className="font-semibold">
                {language === 'en' ? 'MediCare' : 'ميديكير'}
              </span>
            </Link>
            <Header />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/doctors">
          <Button variant="ghost" className="mb-6 gap-2">
            <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t.back}
          </Button>
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={doctor.image} alt={language === 'en' ? doctor.name : doctor.nameAr} />
                    <AvatarFallback>{doctor.name ? doctor.name.charAt(0) : 'D'}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold mb-1">
                    {language === 'en' ? doctor.name : doctor.nameAr}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {language === 'en' ? doctor.specialty : doctor.specialtyAr}
                  </p>
                  <div className="flex items-center gap-1 mb-6">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-lg">{rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({reviewsCount} {language === 'en' ? 'reviews' : 'تقييم'})
                    </span>
                  </div>
                  {/* 🔑 Updated link to match standard routing expectations for booking */}
                  <Link to={`/book/${doctor.id}`} className="w-full">
                    <Button className="w-full gap-2">
                      <Calendar className="h-4 w-4" />
                      {t.bookAppointment}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Experience' : 'الخبرة'}
                    </p>
                    <p className="font-semibold">
                      {experienceYears} {language === 'en' ? 'Years' : 'سنة'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Patients Treated' : 'المرضى المعالجون'}
                    </p>
                    <p className="font-semibold">{patientsCount}+</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">
                  {language === 'en' ? 'About' : 'نبذة'}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {language === 'en' ? doctor.bio : doctor.bioAr}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'en' ? 'Available Slots' : 'المواعيد المتاحة'}
                </h3>
                <div className="space-y-4">
                  {availableSlots.map((slot) => (
                    <div key={slot.date}>
                      <p className="font-medium mb-2">
                        {new Date(slot.date).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {slot.times.map((time) => (
                          <Link key={time} to={`/book/${doctor.id}`}>
                            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                              {time}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}