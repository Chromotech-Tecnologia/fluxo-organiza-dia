import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthGuard } from "./components/auth/AuthGuard";

// Modals
import { TaskModal } from "./components/modals/TaskModal";
import { PersonModal } from "./components/modals/PersonModal";
import { DeleteModal } from "./components/modals/DeleteModal";
import { DailyCloseModal } from "./components/modals/DailyCloseModal";

// Pages
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import CalendarPage from "./pages/CalendarPage";
import PeoplePage from "./pages/PeoplePage";
import ReportsPage from "./pages/ReportsPage";
import DailyClosePage from "./pages/DailyClosePage";
import StatsPage from "./pages/StatsPage";
import SettingsPage from "./pages/SettingsPage";
import BackupPage from "./pages/BackupPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthGuard>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/people" element={<PeoplePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/daily-close" element={<DailyClosePage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/backup" element={<BackupPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
          
          {/* Global Modals */}
          <TaskModal />
          <PersonModal />
          <DeleteModal />
          <DailyCloseModal />
        </AuthGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
