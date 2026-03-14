import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CrashDNAPage from './pages/CrashDNAPage';
import VelocityPage from './pages/VelocityPage';
import PatternPage from './pages/PatternPage';
import ConflictsPage from './pages/ConflictsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/crash-dna" element={<CrashDNAPage />} />
        <Route path="/velocity" element={<VelocityPage />} />
        <Route path="/pattern" element={<PatternPage />} />
        <Route path="/conflicts" element={<ConflictsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
