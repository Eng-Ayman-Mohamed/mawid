import { Link } from 'react-router';
import { Calendar, Users, Clock, CheckCircle, XCircle, TrendingUp, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { StatusBadge } from '../../components/StatusBadge';
import { Skeleton } from '../../components/ui/skeleton';

import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';
import { doctorService, type DoctorAppointment, type DoctorStats } from '../../services/doctor.service';
import { useApiCall } from '../../hooks/useApiCall';
import { useMemo } from 'react';

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-12" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function TodayAppointmentSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}

export function DoctorDashboard() {
  const { language } = usePreferences();
  const { user } = useAuth();
  const t = translations[language];

  const { data: appointments, loading: loadingAppts } = useApiCall(
    () => doctorService.getAppointments(),
    []
  );

  const { data: profile, loading: loadingProfile } = useApiCall(
    () => doctorService.getProfile(),
    []
  );

  const stats: DoctorStats = useMemo(() => {
    if (!appointments) return doctorService.computeStats([]);
    return doctorService.computeStats(appointments);
  }, [appointments]);

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments: DoctorAppointment[] = useMemo(
    () => (appointments || []).filter((a) => a.date === today),
    [appointments, today]
  );

  const doctorName =
    profile
      ? `Dr. ${[profile.user.first_name, profile.user.last_name].filter(Boolean).join(' ') || profile.user.email}`
      : user
      ? `Dr. ${[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}`
      : (language === 'en' ? 'Doctor' : 'الطبيب');

  const statCards = [
    {
      title: language === 'en' ? "Today's Appointments" : 'مواعيد اليوم',
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'text-primary',
    },
    {
      title: language === 'en' ? 'Total Patients' : 'إجمالي المرضى',
      value: stats.uniquePatients,
      icon: Users,
      color: 'text-accent',
    },
    {
      title: language === 'en' ? 'Pending Requests' : 'الطلبات المعلقة',
      value: stats.pendingAppointments,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: language === 'en' ? 'Confirmed' : 'مؤكدة',
      value: stats.confirmedAppointments,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: language === 'en' ? 'Completed' : 'مكتملة',
      value: stats.completedAppointments,
      icon: UserCheck,
      color: 'text-blue-600',
    },
    {
      title: language === 'en' ? 'Total Appointments' : 'إجمالي المواعيد',
      value: stats.totalAppointments,
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        {loadingProfile ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">
              {language === 'en' ? `Welcome, ${doctorName}` : `مرحباً، ${doctorName}`}
            </h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loadingAppts
          ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat) => (
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
        {/* Today's Schedule */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t.todaySchedule}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingAppts ? (
                Array.from({ length: 3 }).map((_, i) => <TodayAppointmentSkeleton key={i} />)
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'No appointments today' : 'لا توجد مواعيد اليوم'}
                  </p>
                </div>
              ) : (
                todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {appointment.patientName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{appointment.patientName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="inline h-3 w-3" />
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

        {/* Quick Actions */}
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

          {/* Profile Summary */}
          {!loadingProfile && profile && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{language === 'en' ? 'Profile Summary' : 'ملخص الملف'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {profile.specialty && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {language === 'en' ? 'Specialty: ' : 'التخصص: '}
                    </span>
                    {profile.specialty}
                  </p>
                )}
                {profile.years_of_experience > 0 && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {language === 'en' ? 'Experience: ' : 'الخبرة: '}
                    </span>
                    {profile.years_of_experience}{' '}
                    {language === 'en' ? 'years' : 'سنوات'}
                  </p>
                )}
                {profile.contact && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {language === 'en' ? 'Contact: ' : 'التواصل: '}
                    </span>
                    {profile.contact}
                  </p>
                )}
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {language === 'en' ? 'Status: ' : 'الحالة: '}
                  </span>
                  <span className={profile.user.is_approved ? 'text-green-600' : 'text-yellow-600'}>
                    {profile.user.is_approved
                      ? language === 'en' ? 'Approved' : 'معتمد'
                      : language === 'en' ? 'Pending Approval' : 'في انتظار الموافقة'}
                  </span>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
