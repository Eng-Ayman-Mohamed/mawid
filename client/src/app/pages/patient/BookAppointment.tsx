import { Link, useParams, useNavigate } from 'react-router'; 
import { useState, useEffect } from 'react'; 
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Calendar } from '../../components/ui/calendar';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../utils/translations';
import { patientService } from '../../services/patient.service'; 
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext'; 

export function BookAppointment() {
  const { doctorId } = useParams();
  const { language } = usePreferences();
  const t = translations[language];
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management for real loading and database entry
  const [doctor, setDoctor] = useState<any | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hardcoded times for now (can map out of availability layouts later)
  const availableTimes = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

  // 🔑 Step 1: Automatically fetch the real doctor from Django when page opens
  useEffect(() => {
    if (doctorId) {
      patientService.getDoctor(doctorId)
        .then((realDoctor) => {
          setDoctor(realDoctor);
          setLoadingDoctor(false);
        })
        .catch(() => {
          toast.error(language === 'en' ? 'Failed to load doctor details' : 'فشل في تحميل بيانات الطبيب');
          setLoadingDoctor(false);
        });
    }
  }, [doctorId, language]);

  // 🔑 Step 2: Send the booking request to your atomic Django endpoint
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !doctorId) {
      toast.error(language === 'en' ? 'Please select date and time' : 'يرجى اختيار التاريخ والوقت');
      return;
    }

    // Grab the patient profile ID from your auth context
    // The fallback that bypasses TypeScript checking if types aren't fully declared yet
  const patientId = (user as any)?.patient_profile?.id || user?.id;


    if (!patientId) {
      toast.error(language === 'en' ? 'Please log in as a patient first' : 'يرجى تسجيل الدخول كفريق أولاً');
      return;
    }

    setIsSubmitting(true);
    
    const formattedDate = selectedDate.toISOString().split('T')[0];

    // Convert time to 24hr format
    let formattedTime = selectedTime;
    const match = selectedTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (match) {
      let [_, hoursStr, minutes, modifier] = match;
      let hours = parseInt(hoursStr, 10);
      if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
      formattedTime = `${String(hours).padStart(2, '0')}:${minutes}:00`;
    }

    try {
      await patientService.bookAppointment({
        doctor: Number(doctorId),
        appointment_date: formattedDate,
        appointment_time: formattedTime,
        notes: notes
      });

      toast.success(language === 'en' ? 'Appointment booked successfully!' : 'تم حجز الموعد بنجاح!');
      setTimeout(() => navigate('/my-appointments'), 1500);
    } catch (error: any) {
      const serverMessage = error.response?.data?.detail || error.response?.data?.[0];
      toast.error(serverMessage || (language === 'en' ? 'Booking failed.' : 'فشل الحجز.'));
    } finally {
      setIsSubmitting(false);
    }
    
  };

  if (loadingDoctor) {
    return <div className="p-8 text-center">{language === 'en' ? 'Loading doctor details...' : 'جاري تحميل بيانات الطبيب...'}</div>;
  }

  if (!doctor) {
    return <div className="p-8 text-center">{language === 'en' ? 'Doctor not found' : 'الطبيب غير موجود'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <Link to={`/doctors/${doctorId}`}>
          <Button variant="ghost" className="mb-6 gap-2">
            <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t.back}
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t.bookAppointment}</h1>
          <p className="text-muted-foreground">
            {language === 'en' ? `with ${doctor.name}` : `مع ${doctor.nameAr || doctor.name}`}
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
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
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
                  {language === 'en' ? doctor.name : (doctor.nameAr || doctor.name)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {language === 'en' ? 'Specialty' : 'التخصص'}
                </span>
                <span>{language === 'en' ? doctor.specialty : (doctor.specialtyAr || doctor.specialty)}</span>
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
              disabled={!selectedDate || !selectedTime || isSubmitting}
            >
              {isSubmitting 
                ? (language === 'en' ? 'Booking...' : 'جاري الحجز...') 
                : (language === 'en' ? 'Confirm Booking' : 'تأكيد الحجز')}
            </Button>
          </CardContent>
        </Card>
      </div>
  );
}