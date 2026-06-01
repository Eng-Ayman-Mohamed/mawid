import { Link } from 'react-router'; 
import { useState, useMemo } from 'react';
import { Search, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { NavBar } from '../../components/NavBar';
import { DoctorListSkeleton } from '../../components/Skeletons';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../utils/translations';
import { patientService } from '../../services/patient.service'; 
import { useApiCall } from '../../hooks/useApiCall';

export function DoctorList() {
  const { language } = usePreferences();
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const { data: doctors, loading: doctorsLoading } = useApiCall(() => patientService.getDoctors(), []);
  const { data: specialties, loading: specialtiesLoading } = useApiCall(() => patientService.getSpecialties(), []);

  const filteredDoctors = useMemo(() => {
    if (!doctors) return [];
    return doctors.filter((doctor) => {
      const name = language === 'en' ? doctor.name : doctor.nameAr;
      const matchesSearch = name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchTerm, selectedSpecialty, language]);

  const navLinks = [
    { label: t.home, to: '/' },
    { label: t.myAppointments, to: '/my-appointments' },
  ];
  const navActions = [
    { label: t.profile, to: '/profile', variant: 'outline' as const },
  ];

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <NavBar links={navLinks} actions={navActions} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.findDoctor}</h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Browse our network of qualified medical professionals'
              : 'تصفح شبكتنا من المتخصصين الطبيين المؤهلين'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={language === 'en' ? 'Search doctors by name...' : 'ابحث عن الأطباء بالاسم...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={language === 'ar' ? 'pr-10' : 'pl-10'}
            />
          </div>
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder={t.filter} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === 'en' ? 'All Specialties' : 'جميع التخصصات'}
              </SelectItem>
              {!specialtiesLoading &&
                (specialties || []).map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.name}>
                    {language === 'en' ? specialty.name : specialty.nameAr}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {doctorsLoading ? (
          <DoctorListSkeleton count={6} />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={doctor.image} alt={language === 'en' ? doctor.name : doctor.nameAr} />
                        <AvatarFallback>{doctor.name ? doctor.name.charAt(0) : 'D'}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold mb-1">
                        {language === 'en' ? doctor.name : doctor.nameAr}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {language === 'en' ? doctor.specialty : doctor.specialtyAr}
                      </p>
                      {doctor.experience > 0 && (
                        <div className="flex items-center gap-1 mb-3 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>{doctor.experience} {language === 'en' ? 'yrs exp.' : 'سنة خبرة'}</span>
                        </div>
                      )}
                      {doctor.available ? (
                        <Badge variant="outline" className="mb-4 bg-green-50 text-green-700 border-green-200">
                          {language === 'en' ? 'Available' : 'متاح'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mb-4 bg-gray-50 text-gray-700 border-gray-200">
                          {language === 'en' ? 'Unavailable' : 'غير متاح'}
                        </Badge>
                      )}
                      <Link to={`/doctors/${doctor.id}`} className="w-full">
                        <Button className="w-full">
                          {language === 'en' ? 'View Profile' : 'عرض الملف'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {language === 'en'
                    ? 'No doctors found matching your criteria'
                    : 'لم يتم العثور على أطباء مطابقين لمعاييرك'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}