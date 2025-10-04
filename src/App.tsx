import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryMCQs from "./pages/CategoryMCQs";
import AdminMCQs from "./pages/AdminMCQs";
import Auth from "./pages/Auth";
import StaticGKSubcategories from "./pages/StaticGKSubcategories";
import TopicsPage from "./pages/TopicsPage";
import ExamTypesPage from "./pages/ExamTypesPage";
import ExamSyllabusPage from "./pages/ExamSyllabusPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/static-gk-subcategories" element={<StaticGKSubcategories />} />
            <Route path="/category/:category/:subcategory/:topic" element={<CategoryMCQs />} />
            <Route path="/category/:category/:subcategory" element={<CategoryMCQs />} />
            <Route path="/category/:category" element={<CategoryMCQs />} />
            <Route path="/topics/:category/:subcategory" element={<TopicsPage />} />
            <Route path="/exam-types/:category" element={<ExamTypesPage />} />
            <Route path="/exam/:category/:examId/syllabus" element={<ExamSyllabusPage />} />
            <Route path="/admin/mcqs" element={<AdminMCQs />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
