import { Link, useParams, useNavigate } from 'react-router';
import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Calendar } from '../../components/ui/calendar';
import { Skeleton } from '../../components/ui/skeleton';
import { Textarea } from '../../components/ui/textarea';
import { NavBar } from '../../components/NavBar';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../apiService';
import { useApiCall } from '../../hooks/useApiCall';
import { toast } from 'sonner';

export function BookAppointment() {
  const { doctorId } = useParams();
  const { language } = useMedicalApp();
  const t = translations[language];
  const navigate = useNavigate();

  const { data: doctor, loading } = useApiCall(() => apiService.getDoctor(doctorId!), [doctorId]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error(language === 'en' ? 'Please select date and time' : 'يرجى اختيار التاريخ والوقت');
      return;
    }
    setSubmitting(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      await apiService.bookAppointment({
        doctor: doctorId,
        appointment_date: dateStr,
        appointment_time: selectedTime,
        notes,
      });
      toast.success(language === 'en' ? 'Appointment booked successfully!' : 'تم حجز الموعد بنجاح!');
      setTimeout(() => navigate('/my-appointments'), 1000);
    } catch (err: any) {
      toast.error(err.message || (language === 'en' ? 'Booking failed' : 'فشل الحجز'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-72 w-full" />
            <div className="space-y-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-32 w-full" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">{language === 'en' ? 'Doctor not found' : 'الطبيب غير موجود'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar links={[{ label: t.myAppointments, to: '/my-appointments' }]} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={`/doctors/${doctorId}`}>
          <Button variant="ghost" className="mb-6">&larr; {t.back}</Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t.bookAppointment}</h1>
          <p className="text-muted-foreground">
            {language === 'en' ? `with ${doctor.name}` : `مع ${doctor.name}`}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {language === 'en' ? 'Select Date' : 'اختر التاريخ'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'en' ? 'Select Time' : 'اختر الوقت'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      onClick={() => setSelectedTime(time)}
                      className="w-full"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{language === 'en' ? 'Notes (Optional)' : 'ملاحظات (اختياري)'}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder={language === 'en' ? 'Describe your symptoms or reason for visit...' : 'صف أعراضك أو سبب الزيارة...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{language === 'en' ? 'Booking Summary' : 'ملخص الحجز'}</h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'en' ? 'Doctor' : 'الطبيب'}</span>
                <span className="font-medium">{doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'en' ? 'Specialty' : 'التخصص'}</span>
                <span>{doctor.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'en' ? 'Date' : 'التاريخ'}</span>
                <span>
                  {selectedDate
                    ? selectedDate.toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'en' ? 'Time' : 'الوقت'}</span>
                <span>{selectedTime || '-'}</span>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={handleBooking}
              disabled={!selectedDate || !selectedTime || submitting}>
              {submitting ? t.loading : (language === 'en' ? 'Confirm Booking' : 'تأكيد الحجز')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
