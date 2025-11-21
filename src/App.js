import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import router from "./routes/route";
import "./App.css";
import { AlertProvider } from "./context/alert/AlertContext";
import AlertContainer from "./context/alert/AlertContainer";

function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <div className="App">
          <RouterProvider router={router} />
          <AlertContainer />
        </div>
      </AuthProvider>
    </AlertProvider>
  );
}

export default App;
