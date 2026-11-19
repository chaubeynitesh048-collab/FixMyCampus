import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import ReportPage from './pages/ReportPage';
import TrackPage from './pages/TrackPage';
import PublicBoardPage from './pages/PublicBoardPage';
import StaffPortalPage from './pages/StaffPortalPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AuthPage from './pages/AuthPage';
import AiAssistantModal from './components/AiAssistantModal';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/track/:complaintId" element={<TrackPage />} />
          <Route path="/board" element={<PublicBoardPage />} />
          <Route path="/staff" element={<StaffPortalPage />} />
          <Route path="/dashboard" element={<AdminDashboardPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>

      {/* Floating AI Campus Assistant */}
      <AiAssistantModal />

      <Footer />
      <MobileNav />
    </div>
  );
}
