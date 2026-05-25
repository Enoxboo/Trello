import { Routes, Route, Navigate } from "react-router-dom";
import LoginView from "../Views/LoginView";
import RegisterView from "../Views/RegisterView";
import BoardsView from "../Views/BoardsView";
import BoardView from "../Views/BoardView";
import { isAuthenticated } from "../Services/authService";

// Redirige vers /login si l'utilisateur n'est pas connecté
function PrivateRoute({ children }) {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />
            <Route
                path="/boards"
                element={<PrivateRoute><BoardsView /></PrivateRoute>}
            />
            <Route
                path="/board/:id"
                element={<PrivateRoute><BoardView /></PrivateRoute>}
            />
        </Routes>
    );
}

export default App;
