import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from 'react-toastify'; // Added
import 'react-toastify/dist/ReactToastify.css'; // Added
import { AuthProvider } from "./context/AuthContext.tsx"; // Import AuthProvider

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider> {/* Wrap your app with AuthProvider */}
          <App />
        </AuthProvider>
        <ToastContainer /> {/* Added */}
      </BrowserRouter>
    </StrictMode>
  );
} else {
  throw new Error("Root element not found");
}