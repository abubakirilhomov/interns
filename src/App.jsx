import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { persistor, store } from "./store";
import Layout from "./components/Layout/Layout";
import PageTransition from "./components/UI/PageTransition";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Lessons from "./pages/Lessons";
import Feedback from "./pages/Feedback";
import Profile from "./pages/Profile";
import Rules from "./pages/Rules";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Rating from "./pages/Rating";
import RecentActivity from "./pages/RecentActivity";
import HeadInternWarnings from "./pages/HeadInternWarnings";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const P = ({ children }) => (
  <ProtectedRoute>
    <PageTransition>{children}</PageTransition>
  </ProtectedRoute>
);

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <PageTransition><Login /></PageTransition>} />
        <Route path="/dashboard" element={<P><Dashboard /></P>} />
        <Route path="/lessons" element={<P><Lessons /></P>} />
        <Route path="/feedback" element={<P><Feedback /></P>} />
        <Route path="/rules" element={<P><Rules /></P>} />
        <Route path="/profile" element={<P><Profile /></P>} />
        <Route path="/rating" element={<P><Rating /></P>} />
        <Route path="/activity" element={<P><RecentActivity /></P>} />
        <Route path="/head-intern" element={<P><HeadInternWarnings /></P>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Загрузка...</div>} persistor={persistor}>
        <Router>
          <AppRoutes />
        </Router>
      </PersistGate>
      <ToastContainer />
    </Provider>
  );
}

export default App;