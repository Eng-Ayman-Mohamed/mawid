import { Link } from 'react-router';
import { Calendar, Users, Clock, TrendingUp, LogOut } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { NavBar } from '../../components/NavBar';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../apiService';
import { useApiCall } from '../../hooks/useApiCall';

export function DoctorDashboard() {
  const { language } = useMedicalApp();
  const { user, logout } = useAuth();
  const t = translations[language];

  const { data: profile, loading: profileLoading } = useApiCall(() => apiService.getDoctorProfile(), []);
  const { data: appointments, loading: aptsLoading } = useApiCall(() => apiService.getDoctorAppointments(), []);

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = (appointments || []).filter((a: any) => a.date === today);
  const pendingCount = (appointments || []).filter((a: any) => a.status === 'pending').length;

  const navLinks = [
    { label: t.appointments, to: '/doctor/appointments' },
    { label: t.availability, to: '/doctor/availability' },
  ];
  const navActions = [{ label: t.profile, to: '/doctor/profile', variant: 'outline' as const }];

  const loading = profileLoading || aptsLoading;

  return (
    <div className="min-h-screen bg-background">
      <NavBar brandTo="/doctor/dashboard" links={navLinks} actions={navActions} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            {loading ? (
              <><Skeleton className="h-8 w-64 mb-2" /><Skeleton className="h-4 w-40" /></>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2">
                  {language === 'en'
                    ? `Welcome, ${profile?.name || user?.first_name || ''}`
                    : `مرحباً، ${profile?.name || user?.first_name || ''}`}
                </h1>
                <p className="text-muted-foreground">
                  {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            {language === 'en' ? 'Logout' : 'تسجيل الخروج'}
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { title: language === 'en' ? "Today's Appointments" : 'مواعيد اليوم', value: loading ? '—' : String(todayAppointments.length), icon: Calendar, color: 'text-primary' },
            { title: language === 'en' ? 'Total Appointments' : 'إجمالي المواعيد', value: loading ? '—' : String((appointments || []).length), icon: Users, color: 'text-accent' },
            { title: language === 'en' ? 'Pending' : 'قيد الانتظار', value: loading ? '—' : String(pendingCount), icon: Clock, color: 'text-yellow-600' },
            { title: language === 'en' ? 'Experience' : 'الخبرة', value: loading ? '—' : `${profile?.experience || 0}y`, icon: TrendingUp, color: 'text-green-600' },
          ].map((stat) => (
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
                {loading ? (
                  [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)
                ) : todayAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {language === 'en' ? 'No appointments today' : 'لا توجد مواعيد اليوم'}
                  </p>
                ) : (
                  todayAppointments.map((apt: any) => (
                    <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>{apt.patientName?.charAt(0) || 'P'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{apt.patientName}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />{apt.time}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>{language === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/doctor/appointments">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Calendar className="h-4 w-4" />
                    {language === 'en' ? 'View All Appointments' : 'عرض جميع المواعيد'}
                  </Button>
                </Link>
                <Link to="/doctor/availability">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Clock className="h-4 w-4" />
                    {t.manageAvailability}
                  </Button>
                </Link>
                <Link to="/doctor/profile">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
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
