import { Routes, Route, Navigate } from "react-router-dom";
import LoginView from "../Views/LoginView";
import RegisterView from "../Views/RegisterView";
import BoardView from "../Views/BoardView";
import { isAuthenticated } from "../Services/authService";

function ProtectedRoute({ children }) {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />
            <Route
                path="/board"
                element={
                    <ProtectedRoute>
                        <BoardView />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;
