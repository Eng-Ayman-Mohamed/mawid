import { Link } from 'react-router';
import { Calendar, Users, Shield, Star, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { NavBar } from '../../components/NavBar';
import { DoctorCardSkeleton } from '../../components/Skeletons';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../utils/translations';
import { patientService } from '../../services/patient.service';
import { useApiCall } from '../../hooks/useApiCall';

export function PatientLanding() {
  const { language } = usePreferences();
  const t = translations[language];
  const isRTL = language === 'ar';

  const { data: doctors, loading: doctorsLoading } = useApiCall(
    () => patientService.getDoctors(),
    []
  );
  const topDoctors = (doctors || []).slice(0, 3);

  const features = [
    {
      icon: Calendar,
      title: language === 'en' ? 'Easy Booking' : 'حجز سهل',
      description: language === 'en'
        ? 'Book appointments with top doctors in just a few clicks'
        : 'احجز مواعيد مع أفضل الأطباء ببضع نقرات فقط',
    },
    {
      icon: Users,
      title: language === 'en' ? 'Expert Doctors' : 'أطباء خبراء',
      description: language === 'en'
        ? 'Access to qualified and experienced medical professionals'
        : 'الوصول إلى متخصصين طبيين مؤهلين وذوي خبرة',
    },
    {
      icon: Shield,
      title: language === 'en' ? 'Secure & Private' : 'آمن وخاص',
      description: language === 'en'
        ? 'Your health data is protected with industry-leading security'
        : 'بياناتك الصحية محمية بأمان رائد في الصناعة',
    },
  ];

  const navLinks = [
    { label: t.home, to: '/' },
    { label: t.doctors, to: '/doctors' },
  ];

  const navActions = [
    { label: t.login, to: '/login', variant: 'ghost' as const },
    { label: t.register, to: '/register', variant: 'default' as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar links={navLinks} actions={navActions} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {language === 'en' ? 'Your Health, Our Priority' : 'صحتك، أولويتنا'}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {language === 'en'
                  ? 'Book appointments with qualified doctors, manage your health records, and get expert medical care.'
                  : 'احجز مواعيد مع أطباء مؤهلين، وأدر سجلاتك الصحية، واحصل على رعاية طبية متخصصة.'}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/doctors">
                  <Button size="lg" className="gap-2">
                    {t.findDoctor}
                    <ChevronRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline">
                    {t.getStarted}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=500&fit=crop"
                alt="Medical professionals"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>



      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t.whyChooseUs}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'en'
                ? 'We provide comprehensive healthcare services with a focus on quality and patient satisfaction.'
                : 'نحن نقدم خدمات رعاية صحية شاملة مع التركيز على الجودة ورضا المرضى.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6 pb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Doctors — live API */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t.topDoctors}</h2>
              <p className="text-muted-foreground">
                {language === 'en'
                  ? 'Meet our most experienced and highly rated doctors'
                  : 'تعرف على أطبائنا الأكثر خبرة وتقييماً'}
              </p>
            </div>
            <Link to="/doctors">
              <Button variant="outline" className="gap-2">
                {t.viewDoctors}
                <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
          </div>

          {doctorsLoading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => <DoctorCardSkeleton key={i} />)}
            </div>
          ) : topDoctors.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {language === 'en' ? 'No doctors available yet.' : 'لا يوجد أطباء متاحون بعد.'}
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {topDoctors.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={doctor.image} alt={doctor.name} />
                        <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold mb-1">
                        {language === 'en' ? doctor.name : doctor.nameAr}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {language === 'en' ? doctor.specialty : doctor.specialtyAr}
                      </p>
                      {doctor.experience > 0 && (
                        <div className="flex items-center gap-1 mb-4 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>
                            {doctor.experience} {language === 'en' ? 'yrs exp.' : 'سنة خبرة'}
                          </span>
                        </div>
                      )}
                      <Link to={`/doctors/${doctor.id}`} className="w-full">
                        <Button className="w-full" size="sm">
                          {language === 'en' ? 'View Profile' : 'عرض الملف'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {language === 'en'
              ? 'Ready to Take Control of Your Health?'
              : 'هل أنت مستعد لتولي مسؤولية صحتك؟'}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {language === 'en'
              ? 'Join thousands of patients who trust us with their healthcare needs.'
              : 'انضم إلى آلاف المرضى الذين يثقون بنا لتلبية احتياجاتهم الصحية.'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary">
                {t.register}
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
              >
                {language === 'en' ? 'Sign In' : 'تسجيل الدخول'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/favicon.png" alt="Mawid" className="w-8 h-8 rounded-lg" />
                <span className="font-semibold">{language === 'en' ? 'Mawid' : 'مواعيد'}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Your trusted healthcare partner.' : 'شريكك الموثوق في الرعاية الصحية.'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{language === 'en' ? 'Quick Links' : 'روابط سريعة'}</h4>
              <div className="space-y-2">
                <Link to="/doctors" className="block text-sm text-muted-foreground hover:text-primary">
                  {t.doctors}
                </Link>
                <Link to="/my-appointments" className="block text-sm text-muted-foreground hover:text-primary">
                  {t.appointments}
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              © 2026 {language === 'en' ? 'Mawid. All rights reserved.' : 'مواعيد. جميع الحقوق محفوظة.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
