import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import router from "./routes/route";
import "./App.css";
import { AlertProvider } from "./context/alert/AlertContext";
import AlertContainer from "./context/alert/AlertContainer";
import { OrderProvider } from "./context/OrderContext";

function App() {
  return (
    <OrderProvider>
    <AlertProvider>
      <AuthProvider>
        <div className="App">
           <RouterProvider router={router} />
          <AlertContainer />
        </div>
      </AuthProvider>
    </AlertProvider>
    </OrderProvider>
  );
}

export default App;
