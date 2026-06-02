import { Link } from 'react-router';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../utils/translations';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';

interface Specialty {
  id: number;
  name: string;
  doctor_count: number;
}

export function AdminSpecialties() {
  const { language } = usePreferences();
  const t = translations[language];
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [newSpecialty, setNewSpecialty] = useState({ name: '' });
  const [isOpen, setIsOpen] = useState(false); 

  const loadSpecialties = async () => {
    try {
      const data = await adminService.getSpecialties();
      setSpecialties(Array.isArray(data) ? data : data.results || []);
    } catch (error: any) {
      setSpecialties([]);
      toast.error(error.message || (language === 'en' ? 'Failed to load specialties' : 'فشل تحميل التخصصات'));
    }
  };

  useEffect(() => {
    loadSpecialties();
  }, []);

  const handleAdd = async () => {
    const name = newSpecialty.name.trim();
    if (!name) return;

    try {
      await adminService.createSpecialty({ name });
      toast.success(language === 'en' ? 'Specialty added successfully!' : 'تمت إضافة التخصص بنجاح!');
      setNewSpecialty({ name: '' });
      setIsOpen(false); // إغلاق النافذة
      loadSpecialties();
    } catch (error: any) {
      toast.error(error.message || 'Error adding specialty');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminService.deleteSpecialty(id);
      toast.success(language === 'en' ? 'Specialty deleted' : 'تم حذف التخصص');
      loadSpecialties();
    } catch (error: any) {
      toast.error(error.message || 'Error deleting specialty');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t.specialtyManagement}</h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Manage medical specialties' : 'إدارة التخصصات الطبية'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{language === 'en' ? 'All Specialties' : 'جميع التخصصات'}</CardTitle>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t.addSpecialty}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t.addSpecialty}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{language === 'en' ? 'Name' : 'الاسم'}</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Cardiology"
                        value={newSpecialty.name}
                        onChange={(e) => setNewSpecialty({ name: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleAdd} className="w-full">
                      {language === 'en' ? 'Add Specialty' : 'إضافة التخصص'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'en' ? 'Name' : 'الاسم'}</TableHead>
                  <TableHead>{language === 'en' ? 'Doctors' : 'الأطباء'}</TableHead>
                  <TableHead className="text-right">{language === 'en' ? 'Actions' : 'الإجراءات'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specialties.map((specialty) => (
                  <TableRow key={specialty.id}>
                    <TableCell className="font-medium">{specialty.name}</TableCell>
                    <TableCell>{specialty.doctor_count}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => handleDelete(specialty.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        {t.delete}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}