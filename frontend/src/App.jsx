import { Routes, Route, Navigate } from "react-router-dom";
import LoginView from "../Views/LoginView";
import RegisterView from "../Views/RegisterView";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
      </Routes>
  );
}

export default App;