import { useState, useCallback } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../utils/translations';
import { doctorService, type AvailabilitySlot } from '../../services/doctor.service';
import { useApiCall } from '../../hooks/useApiCall';
import { toast } from 'sonner';

// Day definitions
const DAY_CODES: AvailabilitySlot['day'][] = [
  'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN',
];

const DAY_LABELS: Record<string, { en: string; ar: string }> = {
  MON: { en: 'Monday', ar: 'الاثنين' },
  TUE: { en: 'Tuesday', ar: 'الثلاثاء' },
  WED: { en: 'Wednesday', ar: 'الأربعاء' },
  THU: { en: 'Thursday', ar: 'الخميس' },
  FRI: { en: 'Friday', ar: 'الجمعة' },
  SAT: { en: 'Saturday', ar: 'السبت' },
  SUN: { en: 'Sunday', ar: 'الأحد' },
};

function formatTime(t: string): string {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const min = m || '00';
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${min} ${period}`;
}

interface AddSlotForm {
  day: AvailabilitySlot['day'];
  start_time: string;
  end_time: string;
}

function DayCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-36 rounded-full" />
          <Skeleton className="h-7 w-36 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DoctorAvailability() {
  const { language } = usePreferences();
  const t = translations[language];

  const { data: availability, loading, refetch } = useApiCall(
    () => doctorService.getAvailability(),
    []
  );

  // Add slot dialog
  const [addDialog, setAddDialog] = useState(false);
  const [addForm, setAddForm] = useState<AddSlotForm>({
    day: 'MON',
    start_time: '09:00',
    end_time: '17:00',
  });
  const [addLoading, setAddLoading] = useState(false);

  // Delete confirm
  const [deleteSlot, setDeleteSlot] = useState<AvailabilitySlot | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Group slots by day
  const slotsByDay: Record<string, AvailabilitySlot[]> = {};
  (availability || []).forEach((slot) => {
    if (!slotsByDay[slot.day]) slotsByDay[slot.day] = [];
    slotsByDay[slot.day].push(slot);
  });

  const handleAddSlot = useCallback(async () => {
    if (!addForm.start_time || !addForm.end_time) {
      toast.error(language === 'en' ? 'Please fill in all fields' : 'يرجى ملء جميع الحقول');
      return;
    }
    if (addForm.start_time >= addForm.end_time) {
      toast.error(
        language === 'en'
          ? 'Start time must be before end time'
          : 'وقت البداية يجب أن يكون قبل وقت النهاية'
      );
      return;
    }
    setAddLoading(true);
    try {
      await doctorService.addAvailability({
        day: addForm.day,
        start_time: addForm.start_time,
        end_time: addForm.end_time,
      });
      toast.success(
        language === 'en' ? 'Availability slot added' : 'تم إضافة فترة التوفر'
      );
      setAddDialog(false);
      refetch();
    } catch (e: any) {
      toast.error(e.message || (language === 'en' ? 'Failed to add slot' : 'فشل إضافة الفترة'));
    } finally {
      setAddLoading(false);
    }
  }, [addForm, language, refetch]);

  const handleDeleteSlot = useCallback(async () => {
    if (!deleteSlot) return;
    setDeleteLoading(true);
    try {
      await doctorService.deleteAvailability(deleteSlot.id);
      toast.success(
        language === 'en' ? 'Availability slot removed' : 'تم حذف فترة التوفر'
      );
      setDeleteSlot(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message || (language === 'en' ? 'Failed to remove slot' : 'فشل حذف الفترة'));
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteSlot, language, refetch]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t.weeklyAvailability}</h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Manage your weekly schedule. Add or remove time slots for each day.'
              : 'أدر جدولك الأسبوعي. أضف أو احذف الفترات الزمنية لكل يوم.'}
          </p>
        </div>
        <Button onClick={() => setAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {language === 'en' ? 'Add Slot' : 'إضافة فترة'}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <DayCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {DAY_CODES.map((dayCode) => {
            const slots = slotsByDay[dayCode] || [];
            const label = DAY_LABELS[dayCode][language as 'en' | 'ar'];
            return (
              <Card key={dayCode}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-base">{label}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setAddForm((f) => ({ ...f, day: dayCode }));
                        setAddDialog(true);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                      {language === 'en' ? 'Add Slot' : 'إضافة فترة'}
                    </Button>
                  </div>

                  {slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'No time slots — not available this day' : 'لا توجد فترات — غير متاح هذا اليوم'}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot) => (
                        <Badge
                          key={slot.id}
                          variant="secondary"
                          className="text-sm py-1.5 px-3 gap-2 cursor-default"
                        >
                          <Clock className="h-3 w-3" />
                          {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                          <button
                            onClick={() => setDeleteSlot(slot)}
                            className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                            title={language === 'en' ? 'Remove slot' : 'حذف الفترة'}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Slot Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Add Availability Slot' : 'إضافة فترة توفر'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Day' : 'اليوم'}</Label>
              <div className="grid grid-cols-4 gap-2">
                {DAY_CODES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setAddForm((f) => ({ ...f, day: d }))}
                    className={`py-2 px-3 rounded-md border text-sm transition-colors ${
                      addForm.day === d
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-input hover:bg-muted'
                    }`}
                  >
                    {DAY_LABELS[d][language as 'en' | 'ar'].slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">
                  {language === 'en' ? 'Start Time' : 'وقت البداية'}
                </Label>
                <Input
                  id="start_time"
                  type="time"
                  value={addForm.start_time}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, start_time: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">
                  {language === 'en' ? 'End Time' : 'وقت النهاية'}
                </Label>
                <Input
                  id="end_time"
                  type="time"
                  value={addForm.end_time}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, end_time: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleAddSlot} disabled={addLoading}>
              {addLoading
                ? language === 'en' ? 'Adding...' : 'جاري الإضافة...'
                : language === 'en' ? 'Add Slot' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteSlot} onOpenChange={(open) => !open && setDeleteSlot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Remove Availability Slot' : 'حذف فترة التوفر'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteSlot
                ? language === 'en'
                  ? `Remove ${DAY_LABELS[deleteSlot.day].en} ${formatTime(deleteSlot.start_time)} – ${formatTime(deleteSlot.end_time)}? This action cannot be undone.`
                  : `هل تريد حذف فترة ${DAY_LABELS[deleteSlot.day].ar} ${formatTime(deleteSlot.start_time)} – ${formatTime(deleteSlot.end_time)}؟ لا يمكن التراجع.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSlot}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading
                ? language === 'en' ? 'Removing...' : 'جاري الحذف...'
                : t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
