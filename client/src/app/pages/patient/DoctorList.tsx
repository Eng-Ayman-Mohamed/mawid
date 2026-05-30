import { Link } from 'react-router';
import { useState } from 'react';
import { Search, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Header } from '../../components/Header';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { mockDoctors, mockSpecialties } from '../../data/mockData';

export function DoctorList() {
  const { language } = useMedicalApp();
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch = language === 'en'
      ? doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
      : doctor.nameAr.includes(searchTerm);
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

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
            <div className="flex items-center gap-4">
              <Header />
              <Link to="/my-appointments">
                <Button variant="ghost">{t.myAppointments}</Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline">{t.profile}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.findDoctor}</h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Browse our network of qualified medical professionals'
              : 'تصفح شبكتنا من المتخصصين الطبيين المؤهلين'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'en' ? 'Search doctors by name...' : 'ابحث عن الأطباء بالاسم...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder={t.filter} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === 'en' ? 'All Specialties' : 'جميع التخصصات'}
              </SelectItem>
              {mockSpecialties.map((specialty) => (
                <SelectItem key={specialty.id} value={specialty.name}>
                  {language === 'en' ? specialty.name : specialty.nameAr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={doctor.image} alt={language === 'en' ? doctor.name : doctor.nameAr} />
                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold mb-1">
                    {language === 'en' ? doctor.name : doctor.nameAr}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {language === 'en' ? doctor.specialty : doctor.specialtyAr}
                  </p>
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{doctor.rating}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {doctor.experience} {language === 'en' ? 'years' : 'سنة'}
                    </div>
                    <div className="text-muted-foreground">
                      {doctor.patients}+ {language === 'en' ? 'patients' : 'مريض'}
                    </div>
                  </div>
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
              {language === 'en' ? 'No doctors found matching your criteria' : 'لم يتم العثور على أطباء مطابقين لمعاييرك'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}