// App.js
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import router from "./routes/route";
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
}

export default App;