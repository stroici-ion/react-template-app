import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import TaskDetailPage from "./pages/TaskDetailPage";
import { useLayoutEffect } from "react";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { fetchMe } from "./redux/auth/asyncThunks";
import { PageLoader } from "./components/PageLoader";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import PersonalInformation from "./pages/PersonalInformation";
import Security from "./pages/Security";
import ConfirmEmail from "./pages/ConfirmEmail";
import EmailVerification from "./pages/EmailVerification";
import ConfirmEmailChange from "./pages/ConfirmEmailChange";
import { AppLayout } from "./components/layouts/AppLayout";

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
  defaultChild?: string;
}

interface RoutesConfig {
  public: RouteConfig[];
  authorized: RouteConfig[];
}

function App() {
  const dispatch = useAppDispatch();
  const { initialized } = useAppSelector((state) => state.auth);

  useLayoutEffect(() => {
    dispatch(fetchMe());
  }, []);

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <PageLoader />
      </div>
    );
  }

  const routes: RoutesConfig = {
    public: [
      { path: "/auth/login", element: <Login /> },
      { path: "/auth/register", element: <Register /> },
      { path: "/auth/forgot-password", element: <ForgotPassword /> },
      { path: "/auth/reset-password/:token", element: <ResetPassword /> },
      { path: "/auth/confirm-email/:token", element: <ConfirmEmail /> },
      {
        path: "/auth/confirm-email-change/:token",
        element: <ConfirmEmailChange />,
      },
      { path: "/auth/email-verification", element: <EmailVerification /> },
    ],
    authorized: [
      {
        path: "/settings",
        element: <Settings />,
        defaultChild: "personal-info",
        children: [
          { path: "personal-info", element: <PersonalInformation /> },
          { path: "security", element: <Security /> },
        ],
      },
    ],
  };

  const renderRoutes = (routes: RouteConfig[]) => {
    return routes.map((route) => (
      <Route key={route.path} path={route.path} element={route.element}>
        {route.children?.map((child) => (
          <Route key={child.path} path={child.path} element={child.element} />
        ))}
        {route.defaultChild && (
          <Route index element={<Navigate to={route.defaultChild} replace />} />
        )}
      </Route>
    ));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route
            path="/projects/:id/tasks/:taskId"
            element={<TaskDetailPage />}
          />
          {renderRoutes(routes.authorized)}
          <Route
            path="*"
            element={
              <div className="flex min-h-screen items-center justify-center bg-gray-100 text-2xl text-gray-900 dark:bg-gray-900 dark:text-white">
                404 - Page Not Found
              </div>
            }
          />
        </Route>

        {renderRoutes(routes.public)}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
