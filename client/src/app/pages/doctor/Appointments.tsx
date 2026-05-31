import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Calendar, Clock, Check, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { NavBar } from '../../components/NavBar';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../apiService';
import { toast } from 'sonner';

export function DoctorAppointments() {
  const { language } = useMedicalApp();
  const t = translations[language];

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    apiService.getDoctorAppointments()
      .then(setAppointments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await apiService.updateDoctorAppointmentStatus(id, { status });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      toast.success(
        status === 'confirmed'
          ? (language === 'en' ? 'Appointment confirmed' : 'تم تأكيد الموعد')
          : (language === 'en' ? 'Appointment rejected' : 'تم رفض الموعد')
      );
    } catch (err: any) {
      toast.error(err.message || (language === 'en' ? 'Update failed' : 'فشل التحديث'));
    } finally {
      setUpdating(null);
    }
  };

  const navLinks = [
    { label: t.dashboard, to: '/doctor/dashboard' },
    { label: t.availability, to: '/doctor/availability' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar brandTo="/doctor/dashboard" links={navLinks} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">{t.appointments}</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              {language === 'en' ? 'No appointments found' : 'لا توجد مواعيد'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarFallback>{apt.patientName?.charAt(0) || 'P'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{apt.patientName}</h3>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(apt.date).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {apt.time}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={apt.status} />
                      </div>
                      {apt.notes && (
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-2">{apt.notes}</p>
                      )}
                    </div>
                  </div>
                  {apt.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="gap-2" disabled={updating === apt.id}
                        onClick={() => updateStatus(apt.id, 'confirmed')}>
                        <Check className="h-4 w-4" />{t.approve}
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2" disabled={updating === apt.id}
                        onClick={() => updateStatus(apt.id, 'cancelled')}>
                        <X className="h-4 w-4" />{t.reject}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">{t.addNotes}</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>{t.addNotes}</DialogTitle></DialogHeader>
                          <Textarea
                            placeholder={language === 'en' ? 'Add notes...' : 'أضف ملاحظات...'}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                          />
                          <Button onClick={async () => {
                            try {
                              await apiService.updateDoctorAppointmentStatus(apt.id, { notes });
                              setAppointments((prev) => prev.map((a) => a.id === apt.id ? { ...a, notes } : a));
                              toast.success(language === 'en' ? 'Notes saved' : 'تم حفظ الملاحظات');
                              setNotes('');
                            } catch (err: any) {
                              toast.error(err.message);
                            }
                          }}>{t.save}</Button>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
