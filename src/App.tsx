
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import Index from "@/pages/Index";
import TasksPage from "@/pages/TasksPage";
import PeoplePage from "@/pages/PeoplePage";
import SkillsPage from "@/pages/SkillsPage";
import StatsPage from "@/pages/StatsPage";
import CalendarPage from "@/pages/CalendarPage";
import ReportsPage from "@/pages/ReportsPage";
import DailyClosePage from "@/pages/DailyClosePage";
import BackupPage from "@/pages/BackupPage";
import SettingsPage from "@/pages/SettingsPage";
import MigrationPage from "@/pages/MigrationPage";
import NotFound from "@/pages/NotFound";
import "./App.css";

// Configure React Query with security considerations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Limit retries to prevent abuse
        return failureCount < 2;
      },
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false, // Prevent data leaks
    },
    mutations: {
      retry: false, // Don't retry mutations to prevent duplicate operations
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthGuard>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/people" element={<PeoplePage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/daily-close" element={<DailyClosePage />} />
                <Route path="/backup" element={<BackupPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/migration" element={<MigrationPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </AuthGuard>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
