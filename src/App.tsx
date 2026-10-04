import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ClanRequirements } from './components/ClanRequirements';
import { ClanRoster } from './components/ClanRoster';
import { RecruitmentForm } from './components/RecruitmentForm';
import { ApplicantPortalModal } from './components/ApplicantPortalModal';
import { StaffLoginModal } from './components/StaffLoginModal';
import { StaffDashboard } from './components/StaffDashboard';
import { Footer } from './components/Footer';
import { UserSession, Applicant, ClanMember } from './types';
import {
  getUserSession,
  clearUserSession,
  isStaffAuthenticated,
  setStaffAuthenticated,
  getApplicants,
  getClanMembers,
} from './services/storageService';

export default function App() {
  const [userSession, setUserSession] = useState<UserSession | null>(getUserSession());
  const [isStaff, setIsStaff] = useState<boolean>(isStaffAuthenticated());
  const [applicantsList, setApplicantsList] = useState<Applicant[]>(getApplicants());
  const [clanMembers, setClanMembers] = useState<ClanMember[]>(getClanMembers());

  // Modal controls
  const [isApplicantPortalOpen, setIsApplicantPortalOpen] = useState(false);
  const [isStaffLoginModalOpen, setIsStaffLoginModalOpen] = useState(false);
  const [isStaffDashboardOpen, setIsStaffDashboardOpen] = useState(false);

  useEffect(() => {
    setUserSession(getUserSession());
    setIsStaff(isStaffAuthenticated());
    setApplicantsList(getApplicants());
    setClanMembers(getClanMembers());
  }, []);

  const currentApplicant: Applicant | null = userSession
    ? applicantsList.find(
        (a) => a.id === userSession.applicantId || a.gameId === userSession.gameId
      ) || null
    : null;

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleApplicationSuccess = (applicant: Applicant) => {
    const newSession: UserSession = {
      phone: applicant.phone,
      gameId: applicant.gameId,
      applicantId: applicant.id,
      nickname: applicant.nickname,
    };
    setUserSession(newSession);
    setApplicantsList(getApplicants());
  };

  const handleLogoutApplicant = () => {
    clearUserSession();
    setUserSession(null);
  };

  const handleStaffLoginSuccess = () => {
    setIsStaff(true);
    setIsStaffLoginModalOpen(false);
    setIsStaffDashboardOpen(true);
  };

  const handleCloseStaffDashboard = () => {
    setIsStaffDashboardOpen(false);
    setClanMembers(getClanMembers());
    setApplicantsList(getApplicants());
  };

  const handleLogoutStaff = () => {
    setStaffAuthenticated(false);
    setIsStaff(false);
    setIsStaffDashboardOpen(false);
    setClanMembers(getClanMembers());
    setApplicantsList(getApplicants());
  };

  // If Staff Dashboard is currently open, show full dashboard screen
  if (isStaffDashboardOpen && isStaff) {
    return (
      <StaffDashboard
        onClose={handleCloseStaffDashboard}
        onLogoutStaff={handleLogoutStaff}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans overflow-x-hidden w-full max-w-full">
      {/* Top Bar Contract (1 row, 3 zones) */}
      <Navbar
        userSession={userSession}
        isStaff={isStaff}
        onOpenApplicantPortal={() => setIsApplicantPortalOpen(true)}
        onOpenStaffModal={() => setIsStaffLoginModalOpen(true)}
        onOpenStaffDashboard={() => setIsStaffDashboardOpen(true)}
        onLogoutApplicant={handleLogoutApplicant}
        onLogoutStaff={handleLogoutStaff}
        onScrollToSection={handleScrollToSection}
      />

      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {/* Hero Section with Quick Button to Form at the very top */}
        <Hero
          userSession={userSession}
          applicant={currentApplicant}
          onGoToForm={() => handleScrollToSection('reclutamiento')}
          onOpenLogin={() => setIsApplicantPortalOpen(true)}
        />

        {/* Requirements & Spartan Tag Generator */}
        <ClanRequirements />

        {/* Minimalist Public Clan Roster (Visual only, no WhatsApp, no moderation) */}
        <ClanRoster members={clanMembers} />

        {/* Full Recruitment Form (Always present for new applicants or re-evaluations) */}
        <RecruitmentForm
          onSuccess={handleApplicationSuccess}
          onOpenLogin={() => setIsApplicantPortalOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenApplicantPortal={() => setIsApplicantPortalOpen(true)}
        onOpenStaffModal={() => setIsStaffLoginModalOpen(true)}
        onScrollToSection={handleScrollToSection}
      />

      {/* Applicant Portal Modal (Login / Status tracker) */}
      <ApplicantPortalModal
        isOpen={isApplicantPortalOpen}
        onClose={() => setIsApplicantPortalOpen(false)}
        userSession={userSession}
        onSessionChange={(s) => {
          setUserSession(s);
          setApplicantsList(getApplicants());
        }}
        onScrollToForm={() => handleScrollToSection('reclutamiento')}
      />

      {/* Staff Master Key Login Modal */}
      <StaffLoginModal
        isOpen={isStaffLoginModalOpen}
        onClose={() => setIsStaffLoginModalOpen(false)}
        onSuccess={handleStaffLoginSuccess}
      />
    </div>
  );
}
