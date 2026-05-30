import { Link } from 'react-router';
import { Calendar, Clock, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { StatusBadge } from '../../components/StatusBadge';
import { NavBar } from '../../components/NavBar';
import { AppointmentListSkeleton } from '../../components/Skeletons';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../apiService';
import { useApiCall } from '../../hooks/useApiCall';

type Appointment = {
  id: string;
  doctorName: string;
  doctorNameAr: string;
  specialty: string;
  specialtyAr: string;
  date: string;
  time: string;
  status: string;
  notes?: string | null;
};

function AppointmentCard({ appointment, language }: { appointment: Appointment; language: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarFallback>{appointment.doctorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold">
                  {language === 'en' ? appointment.doctorName : appointment.doctorNameAr}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? appointment.specialty : appointment.specialtyAr}
                </p>
              </div>
              <StatusBadge status={appointment.status as any} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(appointment.date).toLocaleDateString(
                    language === 'en' ? 'en-US' : 'ar-EG',
                    { month: 'long', day: 'numeric', year: 'numeric' }
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{appointment.time}</span>
              </div>
            </div>
            {appointment.notes && (
              <p className="text-sm text-muted-foreground mt-3 p-3 bg-muted rounded-md">
                {appointment.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MyAppointments() {
  const { language } = useMedicalApp();
  const t = translations[language];

  const { data: appointments, loading } = useApiCall(
    () => apiService.getPatientAppointments(),
    []
  );

  const all = appointments || [];
  const upcoming = all.filter((a) => a.status === 'confirmed' || a.status === 'pending');
  const past = all.filter((a) => a.status === 'completed');
  const cancelled = all.filter((a) => a.status === 'cancelled');

  const navLinks = [
    { label: t.home, to: '/' },
    { label: t.findDoctor, to: '/doctors' },
  ];
  const navActions = [
    { label: t.profile, to: '/profile', variant: 'outline' as const },
  ];

  const emptyState = (icon: React.ReactNode, msg: string) => (
    <Card>
      <CardContent className="p-12 text-center">
        {icon}
        <p className="text-muted-foreground">{msg}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <NavBar links={navLinks} actions={navActions} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t.myAppointments}</h1>
            <p className="text-muted-foreground">
              {language === 'en' ? 'View and manage your appointments' : 'عرض وإدارة مواعيدك'}
            </p>
          </div>
          <Link to="/doctors">
            <Button>{language === 'en' ? 'Book New Appointment' : 'حجز موعد جديد'}</Button>
          </Link>
        </div>

        {loading ? (
          <AppointmentListSkeleton count={3} />
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="upcoming">
                {t.upcoming} ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                {t.past} ({past.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                {t.cancelled} ({cancelled.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcoming.length === 0
                ? emptyState(
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />,
                    language === 'en' ? 'No upcoming appointments' : 'لا توجد مواعيد قادمة'
                  )
                : upcoming.map((a) => (
                    <AppointmentCard key={a.id} appointment={a} language={language} />
                  ))}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {past.length === 0
                ? emptyState(
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />,
                    language === 'en' ? 'No past appointments' : 'لا توجد مواعيد سابقة'
                  )
                : past.map((a) => (
                    <AppointmentCard key={a.id} appointment={a} language={language} />
                  ))}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {cancelled.length === 0
                ? emptyState(
                    <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />,
                    language === 'en' ? 'No cancelled appointments' : 'لا توجد مواعيد ملغاة'
                  )
                : cancelled.map((a) => (
                    <AppointmentCard key={a.id} appointment={a} language={language} />
                  ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
