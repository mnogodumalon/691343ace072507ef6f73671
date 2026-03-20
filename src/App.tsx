import { HashRouter, Routes, Route } from 'react-router-dom';
import { ActionsProvider } from '@/context/ActionsContext';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import AdminPage from '@/pages/AdminPage';
import Leistungskatalog2Page from '@/pages/Leistungskatalog2Page';
import LeistungskatalogPage from '@/pages/LeistungskatalogPage';
import ImpressumPage from '@/pages/ImpressumPage';
import TerminanfragePage from '@/pages/TerminanfragePage';
import KundendatenPage from '@/pages/KundendatenPage';

export default function App() {
  return (
    <HashRouter>
      <ActionsProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="leistungskatalog-2" element={<Leistungskatalog2Page />} />
            <Route path="leistungskatalog" element={<LeistungskatalogPage />} />
            <Route path="impressum" element={<ImpressumPage />} />
            <Route path="terminanfrage" element={<TerminanfragePage />} />
            <Route path="kundendaten" element={<KundendatenPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </ActionsProvider>
    </HashRouter>
  );
}
