import { BrowserRouter, Route, Routes, useSearchParams } from 'react-router-dom';

import ComingSoonPage from './pages/ComingSoonPage';
import ClaimPage from './pages/ClaimPage';
import ClaimTypePage from './pages/ClaimTypePage';
import DraftsPage from './pages/DraftsPage';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import SubmittedPage from './pages/SubmittedPage';

function ClaimEntryRoute() {
  const [searchParams] = useSearchParams();
  return searchParams.has('draftId') || searchParams.has('draft') ? (
    <ClaimPage />
  ) : (
    <ClaimTypePage />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/claim" element={<ClaimEntryRoute />} />
        <Route path="/claim/auto" element={<ClaimPage />} />
        <Route path="/drafts" element={<DraftsPage />} />
        <Route path="/submitted" element={<SubmittedPage />} />
        <Route path="/for-insurers" element={<ComingSoonPage heading="For insurers" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
