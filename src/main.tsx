import "./index.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import AppRoutes from './app/components/AppRoutes';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
      <Toaster />
    </AuthProvider>
  </BrowserRouter>
);
