import { Routes, Route, Navigate } from "react-router-dom";
import LoginView from "../Views/LoginView";
import RegisterView from "../Views/RegisterView";
import BoardView from "../Views/BoardView";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />
            <Route path="/board" element={<BoardView />} />
        </Routes>
    );
}

export default App;