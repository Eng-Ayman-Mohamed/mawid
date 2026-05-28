import { Link } from 'react-router';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Header } from '../../components/Header';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { mockSpecialties } from '../../data/mockData';
import { toast } from 'sonner';
import { useState } from 'react';

export function AdminSpecialties() {
  const { language } = useMedicalApp();
  const t = translations[language];
  const [newSpecialty, setNewSpecialty] = useState({ name: '', nameAr: '' });

  const handleAdd = () => {
    toast.success(language === 'en' ? 'Specialty added successfully!' : 'تمت إضافة التخصص بنجاح!');
    setNewSpecialty({ name: '', nameAr: '' });
  };

  const handleDelete = (id: string) => {
    toast.success(language === 'en' ? 'Specialty deleted' : 'تم حذف التخصص');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">M</span>
              </div>
              <span className="font-semibold">
                {language === 'en' ? 'MediCare Admin' : 'ميديكير - الإدارة'}
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Header />
              <Link to="/admin/dashboard">
                <Button variant="ghost">{t.dashboard}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
              <Dialog>
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
                      <Label htmlFor="name">
                        {language === 'en' ? 'Name (English)' : 'الاسم (بالإنجليزية)'}
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g., Cardiology"
                        value={newSpecialty.name}
                        onChange={(e) => setNewSpecialty({ ...newSpecialty, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameAr">
                        {language === 'en' ? 'Name (Arabic)' : 'الاسم (بالعربية)'}
                      </Label>
                      <Input
                        id="nameAr"
                        placeholder="مثال: القلب"
                        value={newSpecialty.nameAr}
                        onChange={(e) => setNewSpecialty({ ...newSpecialty, nameAr: e.target.value })}
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
                  <TableHead>{language === 'en' ? 'Name (English)' : 'الاسم (بالإنجليزية)'}</TableHead>
                  <TableHead>{language === 'en' ? 'Name (Arabic)' : 'الاسم (بالعربية)'}</TableHead>
                  <TableHead>{language === 'en' ? 'Doctors' : 'الأطباء'}</TableHead>
                  <TableHead className="text-right">{language === 'en' ? 'Actions' : 'الإجراءات'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSpecialties.map((specialty) => (
                  <TableRow key={specialty.id}>
                    <TableCell className="font-medium">{specialty.name}</TableCell>
                    <TableCell>{specialty.nameAr}</TableCell>
                    <TableCell>{specialty.doctorCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Edit className="h-3 w-3" />
                          {t.edit}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleDelete(specialty.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          {t.delete}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
