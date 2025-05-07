
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import ApiGenerator from "./pages/ApiGenerator";
import NotFound from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/generator" element={<ApiGenerator />} />
            
            {/* API Reference routes */}
            <Route path="/intro" element={<PlaceholderPage title="API Introduction" />} />
            <Route path="/auth" element={<PlaceholderPage title="Authentication" />} />
            
            {/* Endpoints routes */}
            <Route path="/endpoints/products" element={<PlaceholderPage title="Products API" />} />
            <Route path="/endpoints/users" element={<PlaceholderPage title="Users API" />} />
            <Route path="/endpoints/orders" element={<PlaceholderPage title="Orders API" />} />
            
            {/* Guides routes */}
            <Route path="/guides/getting-started" element={<PlaceholderPage title="Getting Started" />} />
            <Route path="/guides/best-practices" element={<PlaceholderPage title="API Best Practices" />} />
            <Route path="/guides/advanced" element={<PlaceholderPage title="Advanced Usage" />} />
            
            {/* Resources routes */}
            <Route path="/resources/faq" element={<PlaceholderPage title="FAQ" />} />
            <Route path="/resources/errors" element={<PlaceholderPage title="Errors" />} />
            <Route path="/resources/sandbox" element={<PlaceholderPage title="Sandbox" />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
