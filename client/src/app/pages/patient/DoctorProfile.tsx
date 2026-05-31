import { Link, useParams } from 'react-router';
import { Star, Award, Users, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { NavBar } from '../../components/NavBar';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../apiService';
import { useApiCall } from '../../hooks/useApiCall';

export function DoctorProfile() {
  const { id } = useParams();
  const { language } = useMedicalApp();
  const { user } = useAuth();
  const t = translations[language];

  const { data: doctor, loading } = useApiCall(() => apiService.getDoctor(id!), [id]);

  const patientLinks = user?.role === 'patient'
    ? [{ label: t.myAppointments, to: '/my-appointments' }]
    : [];
  const patientActions = user?.role === 'patient'
    ? [{ label: t.findDoctor, to: '/doctors', variant: 'ghost' as const }]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar links={patientLinks} actions={patientActions} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card><CardContent className="p-6"><Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" /><Skeleton className="h-6 w-40 mx-auto mb-2" /><Skeleton className="h-4 w-24 mx-auto" /></CardContent></Card>
            <div className="md:col-span-2 space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">{language === 'en' ? 'Doctor not found' : 'الطبيب غير موجود'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar links={patientLinks} actions={patientActions} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/doctors">
          <Button variant="ghost" className="mb-6">&larr; {t.back}</Button>
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={doctor.image} alt={doctor.name} />
                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold mb-1">{doctor.name}</h2>
                  <p className="text-muted-foreground mb-4">{doctor.specialty}</p>
                  {doctor.rating > 0 && (
                    <div className="flex items-center gap-1 mb-6">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-lg">{doctor.rating}</span>
                    </div>
                  )}
                  {user?.role === 'patient' && (
                    <Link to={`/book/${doctor.id}`} className="w-full">
                      <Button className="w-full gap-2">
                        <Calendar className="h-4 w-4" />
                        {t.bookAppointment}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="p-6 space-y-4">
                {doctor.experience > 0 && (
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{language === 'en' ? 'Experience' : 'الخبرة'}</p>
                      <p className="font-semibold">{doctor.experience} {language === 'en' ? 'Years' : 'سنة'}</p>
                    </div>
                  </div>
                )}
                {doctor.patients > 0 && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{language === 'en' ? 'Patients Treated' : 'المرضى المعالجون'}</p>
                      <p className="font-semibold">{doctor.patients}+</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            {doctor.bio && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">{language === 'en' ? 'About' : 'نبذة'}</h3>
                  <p className="text-muted-foreground leading-relaxed">{doctor.bio}</p>
                </CardContent>
              </Card>
            )}

            {doctor.availability?.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">{language === 'en' ? 'Available Days' : 'الأيام المتاحة'}</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.availability.map((slot: any) => (
                      <span key={slot.id} className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                        {slot.day_of_week} — {slot.start_time} – {slot.end_time}
                      </span>
                    ))}
                  </div>
                  {user?.role === 'patient' && (
                    <Link to={`/book/${doctor.id}`}>
                      <Button className="mt-4 gap-2">
                        <Calendar className="h-4 w-4" />
                        {t.bookAppointment}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
