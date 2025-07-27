
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    async function testSupabaseConnection() {
      try {
        const { data, error } = await supabase.from('orders').select('*').limit(1);
      if (error) {
          console.error('Supabase connection error:', error);
      } else {
          console.log('Supabase connection successful:', data);
        }
      } catch (err) {
        console.error('Supabase connection exception:', err);
      }
    }
    testSupabaseConnection();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
}

export default App;
