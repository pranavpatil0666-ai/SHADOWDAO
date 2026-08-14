import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import './index.css';

import LandingPage from './pages/LandingPage';
import ConnectWallet from './pages/ConnectWallet';
import DAODashboard from './pages/DAODashboard';
import Proposals from './pages/Proposals';
import ProposalDetails from './pages/ProposalDetails';
import PrivateVoting from './pages/PrivateVoting';
import Treasury from './pages/Treasury';
import MyMembership from './pages/MyMembership';

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/connect" element={<ConnectWallet />} />
          <Route path="/dashboard" element={<DAODashboard />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/proposals/:id" element={<ProposalDetails />} />
          <Route path="/vote/:id" element={<PrivateVoting />} />
          <Route path="/treasury" element={<Treasury />} />
          <Route path="/membership" element={<MyMembership />} />
          <Route path="/governance" element={<Navigate to="/proposals" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;