import { HashRouter, Routes, Route } from 'react-router-dom';
import { ActionsProvider } from '@/context/ActionsContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import { WorkflowPlaceholders } from '@/components/WorkflowPlaceholders';
import AdminPage from '@/pages/AdminPage';
import LeistungskatalogPage from '@/pages/LeistungskatalogPage';
import Leistungskatalog2Page from '@/pages/Leistungskatalog2Page';
import ImpressumPage from '@/pages/ImpressumPage';
import KundendatenPage from '@/pages/KundendatenPage';

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <ActionsProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<><div className="mb-8"><WorkflowPlaceholders /></div><DashboardOverview /></>} />
              <Route path="leistungskatalog" element={<LeistungskatalogPage />} />
              <Route path="leistungskatalog-2" element={<Leistungskatalog2Page />} />
              <Route path="impressum" element={<ImpressumPage />} />
              <Route path="kundendaten" element={<KundendatenPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Routes>
        </ActionsProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}
