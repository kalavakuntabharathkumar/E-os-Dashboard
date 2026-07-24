import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./store";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import HRMS from "./pages/HRMS";
import CRM from "./pages/CRM";
import ERP from "./pages/ERP";
import Finance from "./pages/Finance";
import ProjectMgmt from "./pages/ProjectMgmt";
import AICopilot from "./pages/AICopilot";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && role && !roles.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/hrms" replace />} />
            <Route
              path="hrms"
              element={
                <ProtectedRoute roles={["Admin", "HR"]}>
                  <HRMS />
                </ProtectedRoute>
              }
            />
            <Route
              path="crm"
              element={
                <ProtectedRoute roles={["Admin", "Sales"]}>
                  <CRM />
                </ProtectedRoute>
              }
            />
            <Route
              path="erp"
              element={
                <ProtectedRoute roles={["Admin", "Finance", "PM"]}>
                  <ERP />
                </ProtectedRoute>
              }
            />
            <Route
              path="finance"
              element={
                <ProtectedRoute roles={["Admin", "Finance"]}>
                  <Finance />
                </ProtectedRoute>
              }
            />
            <Route
              path="pm"
              element={
                <ProtectedRoute roles={["Admin", "PM", "Employee"]}>
                  <ProjectMgmt />
                </ProtectedRoute>
              }
            />
            <Route
              path="ai"
              element={
                <ProtectedRoute>
                  <AICopilot />
                </ProtectedRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <ProtectedRoute roles={["Admin"]}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
