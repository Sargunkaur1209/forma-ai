import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ComingSoonPage from './pages/ComingSoonPage';
import ClaimPage from './pages/ClaimPage';
import ClaimTypePage from './pages/ClaimTypePage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/claim" element={<ClaimTypePage />} />
        <Route path="/claim/auto" element={<ClaimPage />} />
        <Route path="/drafts" element={<ComingSoonPage heading="My drafts" />} />
        <Route path="/submitted" element={<ComingSoonPage heading="Submitted claims" />} />
        <Route path="/for-insurers" element={<ComingSoonPage heading="For insurers" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
