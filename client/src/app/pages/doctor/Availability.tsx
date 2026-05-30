import { Link } from 'react-router';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Header } from '../../components/Header';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { toast } from 'sonner';

export function DoctorAvailability() {
  const { language } = useMedicalApp();
  const t = translations[language];

  const [weekSchedule, setWeekSchedule] = useState([
    { day: language === 'en' ? 'Monday' : 'الاثنين', enabled: true, slots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
    { day: language === 'en' ? 'Tuesday' : 'الثلاثاء', enabled: true, slots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
    { day: language === 'en' ? 'Wednesday' : 'الأربعاء', enabled: true, slots: ['9:00 AM - 12:00 PM'] },
    { day: language === 'en' ? 'Thursday' : 'الخميس', enabled: true, slots: ['10:00 AM - 1:00 PM', '3:00 PM - 6:00 PM'] },
    { day: language === 'en' ? 'Friday' : 'الجمعة', enabled: false, slots: [] },
    { day: language === 'en' ? 'Saturday' : 'السبت', enabled: true, slots: ['9:00 AM - 2:00 PM'] },
    { day: language === 'en' ? 'Sunday' : 'الأحد', enabled: false, slots: [] },
  ]);

  const toggleDay = (index: number) => {
    const updated = [...weekSchedule];
    updated[index].enabled = !updated[index].enabled;
    setWeekSchedule(updated);
  };

  const handleSave = () => {
    toast.success(language === 'en' ? 'Availability updated successfully!' : 'تم تحديث التوفر بنجاح!');
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
              <Link to="/doctor/appointments">
                <Button variant="ghost">{t.appointments}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t.weeklyAvailability}</h1>
            <p className="text-muted-foreground">
              {language === 'en' ? 'Manage your weekly schedule' : 'أدر جدولك الأسبوعي'}
            </p>
          </div>
          <Button onClick={handleSave}>{t.save}</Button>
        </div>

        <div className="space-y-4">
          {weekSchedule.map((schedule, index) => (
            <Card key={schedule.day}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={() => toggleDay(index)}
                    />
                    <Label className="text-lg font-semibold">{schedule.day}</Label>
                  </div>
                  {schedule.enabled && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      {language === 'en' ? 'Add Slot' : 'إضافة فترة'}
                    </Button>
                  )}
                </div>
                {schedule.enabled && schedule.slots.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {schedule.slots.map((slot, slotIndex) => (
                      <Badge
                        key={slotIndex}
                        variant="secondary"
                        className="text-sm py-2 px-3 gap-2"
                      >
                        {slot}
                        <Trash2 className="h-3 w-3 cursor-pointer hover:text-destructive" />
                      </Badge>
                    ))}
                  </div>
                )}
                {schedule.enabled && schedule.slots.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'No time slots added' : 'لم تضاف فترات زمنية'}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}