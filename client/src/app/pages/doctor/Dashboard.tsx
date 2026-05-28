import { Link } from 'react-router';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { StatusBadge } from '../../components/StatusBadge';
import { Header } from '../../components/Header';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { mockAppointments, mockDoctors } from '../../data/mockData';

export function DoctorDashboard() {
  const { language } = useMedicalApp();
  const t = translations[language];

  // Mock data for the logged-in doctor
  const currentDoctor = mockDoctors[0];
  const todayAppointments = mockAppointments.filter(
    (apt) => apt.doctorId === currentDoctor.id && apt.date === '2026-05-30'
  );

  const stats = [
    {
      title: language === 'en' ? "Today's Appointments" : 'مواعيد اليوم',
      value: '8',
      icon: Calendar,
      color: 'text-primary',
    },
    {
      title: language === 'en' ? 'Total Patients' : 'إجمالي المرضى',
      value: currentDoctor.patients.toString(),
      icon: Users,
      color: 'text-accent',
    },
    {
      title: language === 'en' ? 'Pending Requests' : 'الطلبات المعلقة',
      value: '3',
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: language === 'en' ? 'Rating' : 'التقييم',
      value: currentDoctor.rating.toString(),
      icon: TrendingUp,
      color: 'text-green-600',
    },
  ];

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
              <Link to="/doctor/appointments">
                <Button variant="ghost">{t.appointments}</Button>
              </Link>
              <Link to="/doctor/availability">
                <Button variant="ghost">{t.availability}</Button>
              </Link>
              <Link to="/doctor/profile">
                <Button variant="outline">{t.profile}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {language === 'en' ? `Welcome, ${currentDoctor.name}` : `مرحباً، ${currentDoctor.nameAr}`}
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t.todaySchedule}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {language === 'en' ? 'No appointments today' : 'لا توجد مواعيد اليوم'}
                  </p>
                ) : (
                  todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {appointment.patientName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {language === 'en' ? appointment.patientName : appointment.patientNameAr}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {appointment.time}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/doctor/appointments">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'View All Appointments' : 'عرض جميع المواعيد'}
                  </Button>
                </Link>
                <Link to="/doctor/availability">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    {t.manageAvailability}
                  </Button>
                </Link>
                <Link to="/doctor/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Edit Profile' : 'تعديل الملف'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
