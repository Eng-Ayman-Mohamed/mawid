import { Link } from 'react-router';
import { Check, X, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Header } from '../../components/Header';
import { useMedicalApp } from '../../context/MedicalAppContext';
import { translations } from '../../utils/translations';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { adminService } from './adminService';

interface AdminUser {
  id: number;
  display_name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  status: 'active' | 'pending' | 'blocked' | 'inactive';
}

export function AdminUsers() {
  const { language } = useMedicalApp();
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);

  const loadUsers = () => {
    adminService
      .getUsers(searchTerm ? { search: searchTerm } : {})
      .then((data) => {
        setUsers(Array.isArray(data) ? data : data.results || []);
      })
      .catch(() => {
        setUsers([]);
        toast.error(language === 'en' ? 'Failed to load users' : 'Failed to load users');
      });
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm]);

  const handleApprove = (userId: number) => {
    adminService
      .approveUser(userId)
      .then(() => {
        toast.success(language === 'en' ? 'User approved' : 'User approved');
        loadUsers();
      })
      .catch((error) => toast.error(error.message));
  };

  const handleBlock = (userId: number) => {
    adminService
      .blockUser(userId)
      .then(() => {
        toast.success(language === 'en' ? 'User blocked' : 'User blocked');
        loadUsers();
      })
      .catch((error) => toast.error(error.message));
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t.userManagement}</h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Manage users and permissions' : 'إدارة المستخدمين والصلاحيات'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{language === 'en' ? 'All Users' : 'جميع المستخدمين'}</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'en' ? 'Search users...' : 'ابحث عن المستخدمين...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.email}</TableHead>
                  <TableHead>{language === 'en' ? 'Role' : 'الدور'}</TableHead>
                  <TableHead>{language === 'en' ? 'Status' : 'الحالة'}</TableHead>
                  <TableHead className="text-right">{language === 'en' ? 'Actions' : 'الإجراءات'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.display_name || user.email}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === 'active' ? 'default' : user.status === 'pending' ? 'secondary' : 'destructive'}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {user.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleApprove(user.id)}
                          >
                            <Check className="h-3 w-3" />
                            {t.approveUser}
                          </Button>
                        )}
                        {user.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleBlock(user.id)}
                          >
                            <X className="h-3 w-3" />
                            {t.blockUser}
                          </Button>
                        )}
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
