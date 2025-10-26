import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AccessCodeModal from './components/AccessCodeModal';
import LandingPage from './components/LandingPage';
import { FEATURES, ACCESS_CODES } from './constants';
import type { Feature } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Safeguard to ensure a feature is always selected in app view
  useEffect(() => {
    if (view === 'app' && !selectedFeature) {
      setSelectedFeature(FEATURES.find(f => f.id === 'ai-chat') || null);
    }
  }, [view, selectedFeature]);

  const handleSelectFeatureFromSidebar = useCallback((feature: Feature) => {
    if (feature.isPremium && !isPremium) {
      setSelectedFeature(feature);
      setIsModalOpen(true);
      setModalError(null);
    } else {
      setSelectedFeature(feature);
      setIsSidebarOpen(false); // Close sidebar on selection in mobile
    }
  }, [isPremium]);

  const handleSelectFeatureFromLanding = useCallback((feature: Feature) => {
    setSelectedFeature(feature); // Pre-select the feature
    if (feature.isPremium && !isPremium) {
      setIsModalOpen(true);
      setModalError(null);
    } else {
      setView('app'); // Switch to app view for free features or if already premium
    }
  }, [isPremium]);

  const handleUnlock = (code: string) => {
    if (Object.values(ACCESS_CODES).includes(code)) {
      setIsPremium(true);
      setIsModalOpen(false);
      setModalError(null);
      // If a premium feature was clicked from landing, switch to app view now
      if (view === 'landing' && selectedFeature?.isPremium) {
        setView('app');
      }
    } else {
      setModalError('Invalid access code. Please try again.');
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalError(null);
    // If modal is closed from landing page, deselect the feature
    if (view === 'landing') {
        setSelectedFeature(null);
    }
  };
  
  const CurrentFeatureComponent = selectedFeature?.component;

  return (
    <>
      {view === 'landing' ? (
        <LandingPage onSelectFeature={handleSelectFeatureFromLanding} />
      ) : (
        <div className="min-h-screen premium-background text-zinc-200 flex">
          <Sidebar 
            features={FEATURES} 
            selectedFeature={selectedFeature} 
            onSelectFeature={handleSelectFeatureFromSidebar} 
            isPremium={isPremium}
            isSidebarOpen={isSidebarOpen}
          />
          
          {isSidebarOpen && (
              <div 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="fixed inset-0 bg-black/50 z-30 md:hidden"
              ></div>
          )}

          <main className="flex-1 md:ml-64 p-4 md:p-6 transition-all duration-300">
            <div className="h-full w-full max-w-7xl mx-auto">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="md:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 rounded-md text-white"
                    aria-label="Toggle sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
                <div className="h-full animate-fade-in">
                    {CurrentFeatureComponent && <CurrentFeatureComponent />}
                </div>
            </div>
          </main>
        </div>
      )}

      <AccessCodeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUnlock={handleUnlock}
        error={modalError}
      />
    </>
  );
};

export default App;
