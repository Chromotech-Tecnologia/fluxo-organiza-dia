
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthGuard } from "@/components/auth/AuthGuard";
import { SignInPage } from "@/components/auth/SignInPage";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { TasksPage } from "@/pages/TasksPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { PeoplePage } from "@/pages/PeoplePage";
import { SkillsPage } from "@/pages/SkillsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { DailyClosePage } from "@/pages/DailyClosePage";
import { StatsPage } from "@/pages/StatsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { BackupPage } from "@/pages/BackupPage";
import { MigrationPage } from "@/pages/MigrationPage";
import { NotFound } from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<SignInPage />} />
          <Route
            path="/*"
            element={
              <AuthGuard>
                <SidebarProvider>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/tasks" element={<TasksPage />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/people" element={<PeoplePage />} />
                      <Route path="/skills" element={<SkillsPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/daily-close" element={<DailyClosePage />} />
                      <Route path="/stats" element={<StatsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/backup" element={<BackupPage />} />
                      <Route path="/migration" element={<MigrationPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </SidebarProvider>
              </AuthGuard>
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
