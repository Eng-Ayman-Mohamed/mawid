import { Link } from 'react-router';
import { useState } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { StatusBadge } from '../../components/StatusBadge';
import { Header } from '../../components/Header';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { mockAppointments, mockDoctors } from '../../data/mockData';

export function MyAppointments() {
  const { language } = useMedicalApp();
  const t = translations[language];

  const upcomingAppointments = mockAppointments.filter(
    (apt) => apt.status === 'confirmed' || apt.status === 'pending'
  );
  const pastAppointments = mockAppointments.filter((apt) => apt.status === 'completed');
  const cancelledAppointments = mockAppointments.filter((apt) => apt.status === 'cancelled');

  const AppointmentCard = ({ appointment }: { appointment: typeof mockAppointments[0] }) => {
    const doctor = mockDoctors.find((d) => d.id === appointment.doctorId);
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={doctor?.image} alt={appointment.doctorName} />
              <AvatarFallback>{appointment.doctorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">
                    {language === 'en' ? appointment.doctorName : appointment.doctorNameAr}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? appointment.specialty : appointment.specialtyAr}
                  </p>
                </div>
                <StatusBadge status={appointment.status} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(appointment.date).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
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
          {appointment.status === 'confirmed' && (
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm">
                {language === 'en' ? 'Reschedule' : 'إعادة جدولة'}
              </Button>
              <Button variant="outline" size="sm">
                {language === 'en' ? 'Cancel' : 'إلغاء'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">M</span>
              </div>
              <span className="font-semibold">
                {language === 'en' ? 'MediCare' : 'ميديكير'}
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Header />
              <Link to="/doctors">
                <Button variant="ghost">{t.findDoctor}</Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline">{t.profile}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t.myAppointments}</h1>
            <p className="text-muted-foreground">
              {language === 'en' ? 'View and manage your appointments' : 'عرض وإدارة مواعيدك'}
            </p>
          </div>
          <Link to="/doctors">
            <Button>
              {language === 'en' ? 'Book New Appointment' : 'حجز موعد جديد'}
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              {t.upcoming} ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              {t.past} ({pastAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              {t.cancelled} ({cancelledAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'No upcoming appointments' : 'لا توجد مواعيد قادمة'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'No past appointments' : 'لا توجد مواعيد سابقة'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'No cancelled appointments' : 'لا توجد مواعيد ملغاة'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              cancelledAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}