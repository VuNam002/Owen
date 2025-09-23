import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { AdminProvider } from './context/AuthContext.tsx';
import { UserProvider } from './context/UserContext.tsx';

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <BrowserRouter>
        <AdminProvider>
          <UserProvider>
            <App />
            <ToastContainer /> 
          </UserProvider>
        </AdminProvider>
      </BrowserRouter>
    </StrictMode>
  );
} else {
  throw new Error("Root element not found");
}