import { Link } from 'react-router';
import { Search, Calendar, Filter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { StatusBadge } from '../../components/StatusBadge';
import { Header } from '../../components/Header';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { mockAppointments } from '../../data/mockData';

export function AdminAppointments() {
  const { language } = useMedicalApp();
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAppointments = mockAppointments.filter((apt) => {
    const matchesSearch = language === 'en'
      ? apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
      : apt.patientNameAr.includes(searchTerm) || apt.doctorNameAr.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              <Link to="/admin/dashboard">
                <Button variant="ghost">{t.dashboard}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t.appointments}</h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'View and manage all appointments' : 'عرض وإدارة جميع المواعيد'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'en' ? 'Search appointments...' : 'ابحث عن المواعيد...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t.filter} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'en' ? 'All Status' : 'جميع الحالات'}</SelectItem>
                  <SelectItem value="pending">{t.pending}</SelectItem>
                  <SelectItem value="confirmed">{t.confirmed}</SelectItem>
                  <SelectItem value="completed">{t.completed}</SelectItem>
                  <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'en' ? 'Patient' : 'المريض'}</TableHead>
                  <TableHead>{language === 'en' ? 'Doctor' : 'الطبيب'}</TableHead>
                  <TableHead>{language === 'en' ? 'Specialty' : 'التخصص'}</TableHead>
                  <TableHead>{language === 'en' ? 'Date' : 'التاريخ'}</TableHead>
                  <TableHead>{language === 'en' ? 'Time' : 'الوقت'}</TableHead>
                  <TableHead>{language === 'en' ? 'Status' : 'الحالة'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {language === 'en' ? appointment.patientName : appointment.patientNameAr}
                    </TableCell>
                    <TableCell>
                      {language === 'en' ? appointment.doctorName : appointment.doctorNameAr}
                    </TableCell>
                    <TableCell>
                      {language === 'en' ? appointment.specialty : appointment.specialtyAr}
                    </TableCell>
                    <TableCell>
                      {new Date(appointment.date).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG')}
                    </TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>
                      <StatusBadge status={appointment.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredAppointments.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {language === 'en' ? 'No appointments found' : 'لم يتم العثور على مواعيد'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
