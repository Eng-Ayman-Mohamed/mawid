import { RouterProvider } from 'react-router';
import { MedicalAppProvider } from './context/MedicalAppContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <MedicalAppProvider>
      <RouterProvider router={router} />
      <Toaster />
    </MedicalAppProvider>
  );
}
