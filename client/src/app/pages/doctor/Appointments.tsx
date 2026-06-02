import { useState, useCallback } from 'react';
import { Calendar, Clock, Check, X, Search, Filter, FileText, Phone, Droplets } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { StatusBadge } from '../../components/StatusBadge';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { AppointmentListSkeleton } from '../../components/Skeletons';

import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../utils/translations';
import { doctorService, type DoctorAppointment } from '../../services/doctor.service';
import { useApiCall } from '../../hooks/useApiCall';
import { toast } from 'sonner';

// ─── Appointment Card ───────────────────────────────────────────────────────
interface AppointmentCardProps {
  appointment: DoctorAppointment;
  language: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onAddNotes: (appointment: DoctorAppointment) => void;
  actionLoading: string | null;
}

function AppointmentCard({
  appointment,
  language,
  onApprove,
  onReject,
  onAddNotes,
  actionLoading,
}: AppointmentCardProps) {
  const t = translations[language as 'en' | 'ar'];
  const isLoading = actionLoading === appointment.id;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback>{appointment.patientName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold">{appointment.patientName}</h3>
                {appointment.patientEmail && (
                  <p className="text-xs text-muted-foreground">{appointment.patientEmail}</p>
                )}
              </div>
              <StatusBadge status={appointment.status} />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {appointment.date
                  ? new Date(appointment.date).toLocaleDateString(
                      language === 'en' ? 'en-US' : 'ar-EG',
                      { month: 'long', day: 'numeric', year: 'numeric' }
                    )
                  : '—'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {appointment.time || '—'}
              </span>
              {appointment.patientPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {appointment.patientPhone}
                </span>
              )}
              {appointment.patientBloodGroup && (
                <span className="flex items-center gap-1">
                  <Droplets className="h-3 w-3" />
                  {appointment.patientBloodGroup}
                </span>
              )}
            </div>

            {appointment.notes && (
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-3">
                <FileText className="inline h-3 w-3 mr-1" />
                {appointment.notes}
              </p>
            )}

            {appointment.status === 'pending' && (
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => onApprove(appointment.id)}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4" />
                  {t.approve}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-2"
                  onClick={() => onReject(appointment.id)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                  {t.reject}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => onAddNotes(appointment)}
                  disabled={isLoading}
                >
                  <FileText className="h-4 w-4" />
                  {t.addNotes}
                </Button>
              </div>
            )}

            {/* Allow adding notes to confirmed appointments too */}
            {appointment.status === 'confirmed' && (
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => onAddNotes(appointment)}
                  disabled={isLoading}
                >
                  <FileText className="h-4 w-4" />
                  {t.addNotes}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export function DoctorAppointments() {
  const { language } = usePreferences();
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Notes dialog state
  const [notesDialog, setNotesDialog] = useState<{
    open: boolean;
    appointment: DoctorAppointment | null;
  }>({ open: false, appointment: null });
  const [notesText, setNotesText] = useState('');
  const [notesAction, setNotesAction] = useState<'confirm' | 'reject' | 'notes'>('notes');

  const { data: appointments, loading, refetch } = useApiCall(
    () => doctorService.getAppointments(),
    []
  );

  const all = appointments || [];

  // Filter
  const filtered = all.filter((a) => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.patientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pending = filtered.filter((a) => a.status === 'pending');
  const confirmed = filtered.filter((a) => a.status === 'confirmed');
  const completed = filtered.filter((a) => a.status === 'completed');
  const cancelled = filtered.filter((a) => a.status === 'cancelled');

  const handleApprove = useCallback(
    async (id: string) => {
      setActionLoading(id);
      try {
        await doctorService.updateAppointmentStatus(id, 'confirmed');
        toast.success(language === 'en' ? 'Appointment confirmed' : 'تم تأكيد الموعد');
        refetch();
      } catch (e: any) {
        toast.error(e.message || (language === 'en' ? 'Action failed' : 'فشل الإجراء'));
      } finally {
        setActionLoading(null);
      }
    },
    [language, refetch]
  );

  const handleReject = useCallback(
    async (id: string) => {
      setActionLoading(id);
      try {
        await doctorService.updateAppointmentStatus(id, 'rejected');
        toast.success(language === 'en' ? 'Appointment rejected' : 'تم رفض الموعد');
        refetch();
      } catch (e: any) {
        toast.error(e.message || (language === 'en' ? 'Action failed' : 'فشل الإجراء'));
      } finally {
        setActionLoading(null);
      }
    },
    [language, refetch]
  );

  const openNotesDialog = useCallback(
    (appointment: DoctorAppointment, action: 'confirm' | 'reject' | 'notes' = 'notes') => {
      setNotesDialog({ open: true, appointment });
      setNotesText(appointment.notes || '');
      setNotesAction(action);
    },
    []
  );

  const handleNotesSave = useCallback(async () => {
    if (!notesDialog.appointment) return;
    const id = notesDialog.appointment.id;
    setActionLoading(id);
    try {
      if (notesAction === 'confirm') {
        await doctorService.updateAppointmentStatus(id, 'confirmed', notesText);
        toast.success(language === 'en' ? 'Appointment confirmed with notes' : 'تم التأكيد مع الملاحظات');
      } else if (notesAction === 'reject') {
        await doctorService.updateAppointmentStatus(id, 'rejected', notesText);
        toast.success(language === 'en' ? 'Appointment rejected' : 'تم رفض الموعد');
      } else {
        // Just add notes — send current status to preserve it
        await doctorService.updateAppointmentStatus(
          id,
          notesDialog.appointment.status as any,
          notesText
        );
        toast.success(language === 'en' ? 'Notes saved' : 'تم حفظ الملاحظات');
      }
      setNotesDialog({ open: false, appointment: null });
      refetch();
    } catch (e: any) {
      toast.error(e.message || (language === 'en' ? 'Action failed' : 'فشل الإجراء'));
    } finally {
      setActionLoading(null);
    }
  }, [notesDialog, notesText, notesAction, language, refetch]);

  const emptyState = (msg: string) => (
    <Card>
      <CardContent className="p-12 text-center">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">{msg}</p>
      </CardContent>
    </Card>
  );

  const renderList = (list: DoctorAppointment[], emptyMsg: string) =>
    list.length === 0
      ? emptyState(emptyMsg)
      : list.map((a) => (
          <AppointmentCard
            key={a.id}
            appointment={a}
            language={language}
            onApprove={handleApprove}
            onReject={handleReject}
            onAddNotes={(apt) => openNotesDialog(apt, 'notes')}
            actionLoading={actionLoading}
          />
        ));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t.appointments}</h1>
        <p className="text-muted-foreground">
          {language === 'en'
            ? 'Manage and respond to appointment requests'
            : 'إدارة طلبات المواعيد والرد عليها'}
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              language === 'en' ? 'Search by patient name or email...' : 'بحث باسم المريض أو البريد...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t.filter} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'en' ? 'All Status' : 'جميع الحالات'}</SelectItem>
            <SelectItem value="pending">{t.pending}</SelectItem>
            <SelectItem value="confirmed">{t.confirmed}</SelectItem>
            <SelectItem value="completed">{t.completed}</SelectItem>
            <SelectItem value="cancelled">{language === 'en' ? 'Cancelled' : 'ملغى'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <AppointmentListSkeleton count={4} />
      ) : (
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="pending">
              {t.pending} ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              {t.confirmed} ({confirmed.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              {t.completed} ({completed.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              {language === 'en' ? 'Cancelled' : 'ملغى'} ({cancelled.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {renderList(
              pending,
              language === 'en' ? 'No pending appointments' : 'لا توجد مواعيد معلقة'
            )}
          </TabsContent>
          <TabsContent value="confirmed" className="space-y-4">
            {renderList(
              confirmed,
              language === 'en' ? 'No confirmed appointments' : 'لا توجد مواعيد مؤكدة'
            )}
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            {renderList(
              completed,
              language === 'en' ? 'No completed appointments' : 'لا توجد مواعيد مكتملة'
            )}
          </TabsContent>
          <TabsContent value="cancelled" className="space-y-4">
            {renderList(
              cancelled,
              language === 'en' ? 'No cancelled appointments' : 'لا توجد مواعيد ملغاة'
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Notes / Action Dialog */}
      <Dialog
        open={notesDialog.open}
        onOpenChange={(open) => setNotesDialog((s) => ({ ...s, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {notesAction === 'confirm'
                ? language === 'en' ? 'Confirm Appointment' : 'تأكيد الموعد'
                : notesAction === 'reject'
                ? language === 'en' ? 'Reject Appointment' : 'رفض الموعد'
                : t.addNotes}
            </DialogTitle>
          </DialogHeader>

          {notesDialog.appointment && (
            <div className="text-sm text-muted-foreground mb-2">
              <p>
                <span className="font-medium text-foreground">
                  {language === 'en' ? 'Patient: ' : 'المريض: '}
                </span>
                {notesDialog.appointment.patientName}
              </p>
              <p>
                <span className="font-medium text-foreground">
                  {language === 'en' ? 'Date: ' : 'التاريخ: '}
                </span>
                {notesDialog.appointment.date} {language === 'en' ? 'at' : 'الساعة'}{' '}
                {notesDialog.appointment.time}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">
              {language === 'en' ? 'Notes (optional)' : 'ملاحظات (اختياري)'}
            </Label>
            <Textarea
              id="notes"
              placeholder={language === 'en' ? 'Add notes for the patient...' : 'أضف ملاحظات للمريض...'}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNotesDialog({ open: false, appointment: null })}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleNotesSave}
              disabled={actionLoading !== null}
              variant={notesAction === 'reject' ? 'destructive' : 'default'}
            >
              {actionLoading !== null
                ? language === 'en' ? 'Saving...' : 'جاري الحفظ...'
                : t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
