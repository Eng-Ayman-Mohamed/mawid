import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const translations = {
  en: {
    // Common
    'app.title': 'MediCare',
    'common.welcome': 'Welcome',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.loading': 'Loading...',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.phone': 'Phone Number',
    
    // Patient
    'patient.findDoctor': 'Find a Doctor',
    'patient.bookAppointment': 'Book Appointment',
    'patient.myAppointments': 'My Appointments',
    'patient.upcoming': 'Upcoming',
    'patient.past': 'Past',
    'patient.cancelled': 'Cancelled',
    
    // Doctor
    'doctor.dashboard': 'Dashboard',
    'doctor.availability': 'Availability',
    'doctor.appointments': 'Appointments',
    'doctor.profile': 'Profile',
    
    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.users': 'Users',
    'admin.specialties': 'Specialties',
    'admin.allAppointments': 'All Appointments',
    
    // Status
    'status.pending': 'Pending',
    'status.confirmed': 'Confirmed',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',
  },
  ar: {
    // Common
    'app.title': 'ميديكير',
    'common.welcome': 'مرحباً',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.loading': 'جاري التحميل...',
    
    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.register': 'التسجيل',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.firstName': 'الاسم الأول',
    'auth.lastName': 'اسم العائلة',
    'auth.phone': 'رقم الهاتف',
    
    // Patient
    'patient.findDoctor': 'البحث عن طبيب',
    'patient.bookAppointment': 'حجز موعد',
    'patient.myAppointments': 'مواعيدي',
    'patient.upcoming': 'القادمة',
    'patient.past': 'السابقة',
    'patient.cancelled': 'الملغاة',
    
    // Doctor
    'doctor.dashboard': 'لوحة التحكم',
    'doctor.availability': 'التوفر',
    'doctor.appointments': 'المواعيد',
    'doctor.profile': 'الملف الشخصي',
    
    // Admin
    'admin.dashboard': 'لوحة التحكم',
    'admin.users': 'المستخدمون',
    'admin.specialties': 'التخصصات',
    'admin.allAppointments': 'جميع المواعيد',
    
    // Status
    'status.pending': 'قيد الانتظار',
    'status.confirmed': 'مؤكد',
    'status.completed': 'مكتمل',
    'status.cancelled': 'ملغي',
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
