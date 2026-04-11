import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import TrainerSetup from './pages/TrainerSetup';
import Dashboard from './pages/Dashboard';
import Survey from './pages/Survey';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<TrainerSetup />} />
        <Route path="/dashboard/:workshopId" element={<Dashboard />} />
        <Route path="/survey/:joinCode" element={<Survey />} />
      </Routes>
    </Layout>
  );
}
