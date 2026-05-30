import { RouterProvider } from 'react-router';
import { MedicalAppProvider } from './context/MedicalAppContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <MedicalAppProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </MedicalAppProvider>
    </ErrorBoundary>
  );
}
