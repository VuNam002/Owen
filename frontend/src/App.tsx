import './App.css'
import {useRoutes} from "react-router-dom";
import {routes} from "./router/";
import { AuthProvider } from './context/userContext';

function App() {
  const element = useRoutes(routes);
  return (
    <AuthProvider>
      {element}
    </AuthProvider>
  )
}

export default App
