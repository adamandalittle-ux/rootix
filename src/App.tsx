import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Builder from "./pages/Builder.tsx";
import Admin from "./pages/Admin.tsx";
import Success from "./pages/Success.tsx";
import PlatformPage from "./pages/PlatformPage.tsx";
import PlatformAdmin from "./pages/PlatformAdmin.tsx";
import Pricing from "./pages/Pricing.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/success" element={<Success />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/m/:slug" element={<PlatformPage />} />
          <Route path="/platform-admin/:slug" element={<PlatformAdmin />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
