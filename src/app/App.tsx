import { RouterProvider } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';
import { ErrorBoundary } from './components/error-boundary';
import { Suspense } from 'react';

// Force dark mode — always
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark');
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" />
      </Suspense>
    </ErrorBoundary>
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}