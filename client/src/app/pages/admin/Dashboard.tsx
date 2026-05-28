import { Link } from 'react-router';
import { Users, UserCheck, Calendar, Activity } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Header } from '../../components/Header';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AdminDashboard() {
  const { language } = useMedicalApp();
  const t = translations[language];

  const stats = [
    {
      title: t.totalUsers,
      value: '1,245',
      icon: Users,
      color: 'text-primary',
      change: '+12% from last month',
    },
    {
      title: t.totalDoctors,
      value: '156',
      icon: UserCheck,
      color: 'text-accent',
      change: '+8 new this month',
    },
    {
      title: t.totalPatients,
      value: '1,089',
      icon: Users,
      color: 'text-purple-600',
      change: '+15% from last month',
    },
    {
      title: t.totalAppointments,
      value: '3,842',
      icon: Calendar,
      color: 'text-green-600',
      change: '234 this week',
    },
  ];

  const chartData = [
    { month: language === 'en' ? 'Jan' : 'يناير', appointments: 245, patients: 180 },
    { month: language === 'en' ? 'Feb' : 'فبراير', appointments: 310, patients: 220 },
    { month: language === 'en' ? 'Mar' : 'مارس', appointments: 380, patients: 280 },
    { month: language === 'en' ? 'Apr' : 'أبريل', appointments: 425, patients: 310 },
    { month: language === 'en' ? 'May' : 'مايو', appointments: 520, patients: 390 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">M</span>
              </div>
              <span className="font-semibold">
                {language === 'en' ? 'MediCare Admin' : 'ميديكير - الإدارة'}
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Header />
              <Link to="/admin/users">
                <Button variant="ghost">{t.users}</Button>
              </Link>
              <Link to="/admin/specialties">
                <Button variant="ghost">{t.specialties}</Button>
              </Link>
              <Link to="/admin/appointments">
                <Button variant="ghost">{t.appointments}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
                <p className="text-xs text-muted-foreground">{stat.change}</p>
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
    </div>
  );
}
