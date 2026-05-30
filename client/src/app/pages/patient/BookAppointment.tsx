import { Link, useParams, useNavigate } from 'react-router';
import { useState } from 'react';
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Calendar } from '../../components/ui/calendar';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Header } from '../../components/Header';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { mockDoctors } from '../../data/mockData';
import { toast } from 'sonner';

export function BookAppointment() {
  const { doctorId } = useParams();
  const { language } = useMedicalApp();
  const t = translations[language];
  const isRTL = language === 'ar';
  const navigate = useNavigate();

  const doctor = mockDoctors.find((d) => d.id === doctorId);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');

  const availableTimes = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast.error(language === 'en' ? 'Please select date and time' : 'يرجى اختيار التاريخ والوقت');
      return;
    }
    toast.success(language === 'en' ? 'Appointment booked successfully!' : 'تم حجز الموعد بنجاح!');
    setTimeout(() => navigate('/my-appointments'), 1500);
  };

  if (!doctor) {
    return <div>{language === 'en' ? 'Doctor not found' : 'الطبيب غير موجود'}</div>;
  }

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
            <Header />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={`/doctors/${doctorId}`}>
          <Button variant="ghost" className="mb-6 gap-2">
            <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t.back}
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t.bookAppointment}</h1>
          <p className="text-muted-foreground">
            {language === 'en' ? `with ${doctor.name}` : `مع ${doctor.nameAr}`}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Select Date' : 'اختر التاريخ'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Select Time' : 'اختر الوقت'}
                </CardTitle>
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
                <CardTitle>
                  {language === 'en' ? 'Additional Notes (Optional)' : 'ملاحظات إضافية (اختياري)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder={language === 'en' 
                    ? 'Describe your symptoms or reason for visit...'
                    : 'صف أعراضك أو سبب الزيارة...'}
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
            <h3 className="font-semibold mb-4">
              {language === 'en' ? 'Booking Summary' : 'ملخص الحجز'}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {language === 'en' ? 'Doctor' : 'الطبيب'}
                </span>
                <span className="font-medium">
                  {language === 'en' ? doctor.name : doctor.nameAr}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {language === 'en' ? 'Specialty' : 'التخصص'}
                </span>
                <span>{language === 'en' ? doctor.specialty : doctor.specialtyAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {language === 'en' ? 'Date' : 'التاريخ'}
                </span>
                <span>
                  {selectedDate
                    ? selectedDate.toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {language === 'en' ? 'Time' : 'الوقت'}
                </span>
                <span>{selectedTime || '-'}</span>
              </div>
            </div>
            <Button 
              className="w-full mt-6" 
              size="lg"
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime}
            >
              {language === 'en' ? 'Confirm Booking' : 'تأكيد الحجز'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}