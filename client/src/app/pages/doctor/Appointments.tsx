import { Link } from 'react-router';
import { useState } from 'react';
import { Calendar, Clock, Check, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { StatusBadge } from '../../components/StatusBadge';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Header } from '../../components/Header';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { mockAppointments } from '../../data/mockData';
import { toast } from 'sonner';

export function DoctorAppointments() {
  const { language } = useMedicalApp();
  const t = translations[language];
  const [notes, setNotes] = useState('');

  const handleApprove = (id: string) => {
    toast.success(language === 'en' ? 'Appointment approved' : 'تم قبول الموعد');
  };

  const handleReject = (id: string) => {
    toast.success(language === 'en' ? 'Appointment rejected' : 'تم رفض الموعد');
  };

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
              <Link to="/doctor/dashboard">
                <Button variant="ghost">{t.dashboard}</Button>
              </Link>
              <Link to="/doctor/availability">
                <Button variant="ghost">{t.availability}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">{t.appointments}</h1>

        <div className="space-y-4">
          {mockAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{appointment.patientName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">
                            {language === 'en' ? appointment.patientName : appointment.patientNameAr}
                          </h3>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(appointment.date).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {appointment.time}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={appointment.status} />
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-2">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {appointment.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleApprove(appointment.id)}
                    >
                      <Check className="h-4 w-4" />
                      {t.approve}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleReject(appointment.id)}
                    >
                      <X className="h-4 w-4" />
                      {t.reject}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          {t.addNotes}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t.addNotes}</DialogTitle>
                        </DialogHeader>
                        <Textarea
                          placeholder={language === 'en' ? 'Add notes...' : 'أضف ملاحظات...'}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                        />
                        <Button onClick={() => toast.success(t.save)}>{t.save}</Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
