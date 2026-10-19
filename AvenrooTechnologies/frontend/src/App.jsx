import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import RouteSkeleton from "./components/RouteSkeleton";
import ScrollToTopButton from "./components/ScrollToTopButton";
import StudentLearningLoader from "./components/StudentLearningLoader";
import { ThemeProvider } from "./components/ThemeProvider";

const Home = lazy(() => import("./components/Home"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ContactPage = lazy(() => import("./pages/Contact"));
const StudentsPage = lazy(() => import("./pages/StudentsPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));

function StudentRoute() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let delayTimer;
    const minimumDisplayTime = new Promise((resolve) => {
      delayTimer = window.setTimeout(resolve, 1100);
    });

    Promise.all([import("./pages/StudentsPage"), minimumDisplayTime]).then(() => {
      if (isMounted) setIsReady(true);
    });

    return () => {
      isMounted = false;
      window.clearTimeout(delayTimer);
    };
  }, []);

  if (!isReady) return <StudentLearningLoader />;

  return (
    <Suspense fallback={<StudentLearningLoader />}>
      <StudentsPage />
    </Suspense>
  );
}

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");

      window.requestAnimationFrame(() => {
        const target = document.getElementById(targetId);

        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });

      return;
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.hash, location.pathname]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollManager />
        <Suspense fallback={<RouteSkeleton />}>
          <Routes>
            <Route path="/" element={<StudentRoute />} />
            <Route path="/clients" element={<Home />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/students" element={<Navigate to="/" replace />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <ScrollToTopButton />
      </Router>
    </ThemeProvider>
  );
}

export default App;
