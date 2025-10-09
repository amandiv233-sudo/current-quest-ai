import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
//import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryMCQs from "./pages/CategoryMCQs";
import AdminMCQs from "./pages/AdminMCQs";
import Auth from "./pages/Auth";
import StaticGKSubcategories from "./pages/StaticGKSubcategories";
import TopicsPage from "./pages/TopicsPage";
import ExamTypesPage from "./pages/ExamTypesPage";
import ExamSyllabusPage from "./pages/ExamSyllabusPage";
import MonthlyCurrentAffairsPage from "./pages/MonthlyCurrentAffairsPage";
import BankingCurrentAffairsManager from "./pages/BankingCurrentAffairsManager";
import BankingCurrentAffairs from "./pages/BankingCurrentAffairs";
import MockTestGenerator from "./pages/MockTestGenerator";
import MockTest from "./pages/MockTest";
import MockTestResult from "./pages/MockTestResult";
import AdminSyllabusManager from "./pages/AdminSyllabusManager"; 
import AuthProvider from "@/components/AuthProvider"; // Should have NO curly braces
import ProtectedRoute from "@/components/ProtectedRoute";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/static-gk-subcategories" element={<StaticGKSubcategories />} />
            <Route path="/banking-current-affairs" element={<BankingCurrentAffairs />} />
            <Route path="/category/:category/:subcategory/:topic" element={<CategoryMCQs />} />
            <Route path="/category/:category/:subcategory" element={<CategoryMCQs />} />
            <Route path="/category/:category" element={<CategoryMCQs />} />
            <Route path="/topics/:category/:subcategory" element={<TopicsPage />} />
            <Route path="/exam-types/:category" element={<ExamTypesPage />} />
            <Route path="/exam/:category/:examId/syllabus" element={<ExamSyllabusPage />} />
            <Route path="/exam/:category/:examId/monthly-current-affairs" element={<MonthlyCurrentAffairsPage />} />
            <Route path="/admin/mcqs" element={<ProtectedRoute><AdminMCQs /></ProtectedRoute>} />
            <Route path="/admin/banking-current-affairs" element={<ProtectedRoute><BankingCurrentAffairsManager /></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/mock-test-generator" element={<MockTestGenerator />} />
            <Route path="/mock-test/:testId" element={<MockTest />} />
            <Route path="/mock-test-result/:testId" element={<MockTestResult />} />
            <Route path="/admin/syllabus-manager" element={<ProtectedRoute><AdminSyllabusManager /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
