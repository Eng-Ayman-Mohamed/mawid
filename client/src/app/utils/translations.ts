export const translations = {
  en: {
    // Common
    welcome: "Welcome",
    login: "Login",
    register: "Register",
    logout: "Logout",
    email: "Email",
    password: "Password",
    name: "Name",
    phone: "Phone",
    search: "Search",
    filter: "Filter",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    back: "Back",
    next: "Next",
    submit: "Submit",
    loading: "Loading...",

    // Navigation
    home: "Home",
    doctors: "Doctors",
    appointments: "Appointments",
    profile: "Profile",
    dashboard: "Dashboard",
    patients: "Patients",
    availability: "Availability",
    users: "Users",
    specialties: "Specialties",

    // Patient Portal
    findDoctor: "Find a Doctor",
    bookAppointment: "Book Appointment",
    myAppointments: "My Appointments",
    upcoming: "Upcoming",
    past: "Past",
    cancelled: "Cancelled",
    viewDoctors: "View Doctors",
    topDoctors: "Top Rated Doctors",
    whyChooseUs: "Why Choose Us",
    getStarted: "Get Started",

    // Doctor Portal
    todaySchedule: "Today's Schedule",
    weeklyAvailability: "Weekly Availability",
    manageAvailability: "Manage Availability",
    appointmentRequests: "Appointment Requests",
    approve: "Approve",
    reject: "Reject",
    addNotes: "Add Notes",

    // Admin Portal
    totalUsers: "Total Users",
    totalDoctors: "Total Doctors",
    totalPatients: "Total Patients",
    totalAppointments: "Total Appointments",
    userManagement: "User Management",
    specialtyManagement: "Specialty Management",
    approveUser: "Approve",
    blockUser: "Block",
    addSpecialty: "Add Specialty",

    // Appointment Status
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",

    // Specialties
    cardiology: "Cardiology",
    dermatology: "Dermatology",
    neurology: "Neurology",
    pediatrics: "Pediatrics",
    orthopedics: "Orthopedics",
    psychiatry: "Psychiatry",
  },
  ar: {
    // Common
    welcome: "مرحباً",
    login: "تسجيل الدخول",
    register: "التسجيل",
    logout: "تسجيل الخروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    name: "الاسم",
    phone: "الهاتف",
    search: "بحث",
    filter: "تصفية",
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    view: "عرض",
    back: "رجوع",
    next: "التالي",
    submit: "إرسال",
    loading: "جاري التحميل...",

    // Navigation
    home: "الرئيسية",
    doctors: "الأطباء",
    appointments: "المواعيد",
    profile: "الملف الشخصي",
    dashboard: "لوحة التحكم",
    patients: "المرضى",
    availability: "التوفر",
    users: "المستخدمين",
    specialties: "التخصصات",

    // Patient Portal
    findDoctor: "ابحث عن طبيب",
    bookAppointment: "احجز موعد",
    myAppointments: "مواعيدي",
    upcoming: "القادمة",
    past: "السابقة",
    viewDoctors: "عرض الأطباء",
    topDoctors: "أفضل الأطباء تقييماً",
    whyChooseUs: "لماذا تختارنا",
    getStarted: "ابدأ الآن",

    // Doctor Portal
    todaySchedule: "جدول اليوم",
    weeklyAvailability: "التوفر الأسبوعي",
    manageAvailability: "إدارة التوفر",
    appointmentRequests: "طلبات المواعيد",
    approve: "موافقة",
    reject: "رفض",
    addNotes: "إضافة ملاحظات",

    // Admin Portal
    totalUsers: "إجمالي المستخدمين",
    totalDoctors: "إجمالي الأطباء",
    totalPatients: "إجمالي المرضى",
    totalAppointments: "إجمالي المواعيد",
    userManagement: "إدارة المستخدمين",
    specialtyManagement: "إدارة التخصصات",
    approveUser: "موافقة",
    blockUser: "حظر",
    addSpecialty: "إضافة تخصص",

    // Appointment Status
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    completed: "مكتمل",
    cancelled: "ملغى",

    // Specialties
    cardiology: "القلب",
    dermatology: "الجلدية",
    neurology: "الأعصاب",
    pediatrics: "الأطفال",
    orthopedics: "العظام",
    psychiatry: "الطب النفسي",
  },
};

export type TranslationKey = keyof typeof translations.en;
