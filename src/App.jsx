import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useSelector, useDispatch } from "react-redux";
import { persistor, store } from "./store";
import { silentRefresh } from "./store/slices/authSlice";
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
import HeadInternCreateIntern from "./pages/HeadInternCreateIntern";
import MarsIdReturn from "./pages/MarsIdReturn";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authInitialized } = useSelector((state) => state.auth);
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-base-content/70">
        Загрузка...
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const HeadInternGuard = ({ children }) => {
  const { user, authInitialized } = useSelector((state) => state.auth);
  if (!authInitialized) return null;
  if (!user?.isHeadIntern) return <Navigate to="/dashboard" replace />;
  return children;
};

const P = ({ children }) => (
  <ProtectedRoute>
    <PageTransition>{children}</PageTransition>
  </ProtectedRoute>
);

const AppRoutes = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, authInitialized, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authInitialized) return;
    // Always try silent refresh on cold boot — the refresh cookie may be
    // there even when nothing is in Redux/localStorage. If no cookie, the
    // server will 401 and the thunk's rejected handler flips
    // authInitialized=true with the user still logged out.
    dispatch(silentRefresh());
  }, [authInitialized, dispatch]);

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <PageTransition><Login /></PageTransition>} />
        <Route path="/auth/marsid/return" element={<PageTransition><MarsIdReturn /></PageTransition>} />
        <Route path="/dashboard" element={<P><Dashboard /></P>} />
        <Route path="/lessons" element={<P><Lessons /></P>} />
        <Route path="/feedback" element={<P><Feedback /></P>} />
        <Route path="/rules" element={<P><Rules /></P>} />
        <Route path="/profile" element={<P><Profile /></P>} />
        <Route path="/rating" element={<P><Rating /></P>} />
        <Route path="/activity" element={<P><RecentActivity /></P>} />
        <Route path="/head-intern" element={<P><HeadInternGuard><HeadInternWarnings /></HeadInternGuard></P>} />
        <Route path="/head-intern/create" element={<P><HeadInternGuard><HeadInternCreateIntern /></HeadInternGuard></P>} />
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