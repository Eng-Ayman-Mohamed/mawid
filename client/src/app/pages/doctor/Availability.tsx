import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { NavBar } from '../../components/NavBar';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../apiService';
import { toast } from 'sonner';

const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_AR = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];

export function DoctorAvailability() {
  const { language } = useMedicalApp();
  const t = translations[language];

  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({ day_of_week: 'Monday', start_time: '09:00', end_time: '17:00' });

  useEffect(() => {
    apiService.getDoctorAvailability()
      .then(setSlots)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    setAdding(true);
    try {
      const created = await apiService.addAvailabilitySlot(newSlot) as any;
      setSlots((prev) => [...prev, created]);
      setDialogOpen(false);
      toast.success(language === 'en' ? 'Slot added' : 'تمت إضافة الفترة');
    } catch (err: any) {
      toast.error(err.message || (language === 'en' ? 'Failed to add slot' : 'فشل إضافة الفترة'));
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await apiService.deleteAvailabilitySlot(id);
      setSlots((prev) => prev.filter((s) => s.id !== id));
      toast.success(language === 'en' ? 'Slot removed' : 'تم حذف الفترة');
    } catch (err: any) {
      toast.error(err.message || (language === 'en' ? 'Failed to remove slot' : 'فشل حذف الفترة'));
    } finally {
      setDeleting(null);
    }
  };

  const groupedSlots = DAYS_EN.map((day, i) => ({
    day,
    dayLabel: language === 'en' ? day : DAYS_AR[i],
    slots: slots.filter((s) => s.day_of_week === day),
  }));

  const navLinks = [
    { label: t.dashboard, to: '/doctor/dashboard' },
    { label: t.appointments, to: '/doctor/appointments' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar brandTo="/doctor/dashboard" links={navLinks} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t.weeklyAvailability}</h1>
            <p className="text-muted-foreground">
              {language === 'en' ? 'Manage your weekly schedule' : 'أدر جدولك الأسبوعي'}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {language === 'en' ? 'Add Slot' : 'إضافة فترة'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'en' ? 'Add Availability Slot' : 'إضافة فترة توفر'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Day' : 'اليوم'}</Label>
                  <Select value={newSlot.day_of_week} onValueChange={(v) => setNewSlot({ ...newSlot, day_of_week: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAYS_EN.map((d, i) => (
                        <SelectItem key={d} value={d}>{language === 'en' ? d : DAYS_AR[i]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">{language === 'en' ? 'Start Time' : 'وقت البدء'}</Label>
                    <Input id="start_time" type="time" value={newSlot.start_time}
                      onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">{language === 'en' ? 'End Time' : 'وقت الانتهاء'}</Label>
                    <Input id="end_time" type="time" value={newSlot.end_time}
                      onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })} />
                  </div>
                </div>
                <Button className="w-full" onClick={handleAdd} disabled={adding}>
                  {adding ? t.loading : t.save}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {groupedSlots.map(({ day, dayLabel, slots: daySlots }) => (
              <Card key={day}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3">{dayLabel}</h3>
                  {daySlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'No slots' : 'لا توجد فترات'}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map((slot) => (
                        <div key={slot.id} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                          <span>{slot.start_time} – {slot.end_time}</span>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            disabled={deleting === slot.id}
                            className="hover:text-destructive transition-colors"
                            aria-label="Remove slot"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
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
