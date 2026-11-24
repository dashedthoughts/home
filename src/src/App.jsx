import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Project from './pages/Project.jsx';
import Play from './pages/Play.jsx';
import System from './pages/System.jsx';
const Chill = lazy(() => import('./pages/Chill.jsx'));
const Arcade = lazy(() => import('./pages/Arcade.jsx'));
const GameHost = lazy(() => import('./pages/GameHost.jsx'));
import { InkDefs } from './components/Comic.jsx';

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
    <InkDefs />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/p/:slug" element={<Project />} />
      <Route path="/play" element={<Play />} />
      <Route path="/system" element={<System />} />
      <Route path="/chill" element={<Suspense fallback={<main className="chill" />}><Chill /></Suspense>} />
      <Route path="/arcade" element={<Suspense fallback={<main className="arcade" />}><Arcade /></Suspense>} />
      <Route path="/arcade/:id" element={<Suspense fallback={<main className="gamehost" />}><GameHost /></Suspense>} />
      <Route path="*" element={<Project />} />
    </Routes>
    </>
  );
}
