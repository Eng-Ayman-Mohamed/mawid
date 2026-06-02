import { Link } from 'react-router';
import { Users, UserCheck, Calendar, Activity } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../utils/translations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';

interface DashboardStats {
  total_users: number;
  total_doctors: number;
  total_patients: number;
  total_appointments: number;
}

interface MonthlyStat {
  month: string;
  appointments: number;
  patients: number;
}

export function AdminDashboard() {
  const { language } = usePreferences();
  const t = translations[language];
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_users: 0,
    total_doctors: 0,
    total_patients: 0,
    total_appointments: 0,
  });
  const [chartData, setChartData] = useState<MonthlyStat[]>([]);

  useEffect(() => {
    adminService
      .getDashboard()
      .then((data) => {
        setDashboardStats(data.stats);
        setChartData(data.monthly || []);
      })
      .catch(() => {
        setDashboardStats({
          total_users: 0,
          total_doctors: 0,
          total_patients: 0,
          total_appointments: 0,
        });
        setChartData([]);
      });
  }, []);

  const stats = [
    {
      title: t.totalUsers,
      value: dashboardStats.total_users.toLocaleString(),
      icon: Users,
      color: 'text-primary',
    },
    {
      title: t.totalDoctors,
      value: dashboardStats.total_doctors.toLocaleString(),
      icon: UserCheck,
      color: 'text-accent',
    },
    {
      title: t.totalPatients,
      value: dashboardStats.total_patients.toLocaleString(),
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: t.totalAppointments,
      value: dashboardStats.total_appointments.toLocaleString(),
      icon: Calendar,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {language === 'en' ? 'Admin Dashboard' : 'لوحة تحكم الإدارة'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Platform overview and statistics' : 'نظرة عامة وإحصائيات المنصة'}
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Monthly Statistics' : 'الإحصائيات الشهرية'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="appointments" fill="var(--chart-1)" name={t.appointments} />
                  <Bar dataKey="patients" fill="var(--chart-2)" name={t.patients} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  {t.userManagement}
                </Button>
              </Link>
              <Link to="/admin/specialties">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  {t.specialtyManagement}
                </Button>
              </Link>
              <Link to="/admin/appointments">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'View All Appointments' : 'عرض جميع المواعيد'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
