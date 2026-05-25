import { createRoot } from "react-dom/client";
import "./index.css";
import "react-day-picker/style.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "./hooks/useTheme";
import { AlertProvider } from "./hooks/useAlert";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="543592430618-bsmvaihuhltlsmkq9gprds0h51ph4kmn.apps.googleusercontent.com">
    <Provider store={store}>
      <ThemeProvider defaultTheme="light">
        <AlertProvider position="bottom-right" defaultDuration={5000}>
          <App />
        </AlertProvider>
      </ThemeProvider>
    </Provider>
  </GoogleOAuthProvider>,
);
