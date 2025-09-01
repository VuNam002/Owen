import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { AuthProvider } from "./context/AuthContext.tsx"; 

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider> 
          <App />
        </AuthProvider>
        <ToastContainer /> 
      </BrowserRouter>
    </StrictMode>
  );
} else {
  throw new Error("Root element not found");
}