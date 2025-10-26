import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AccessCodeModal from './components/AccessCodeModal';
import { FEATURES, ACCESS_CODES } from './constants';
import type { Feature } from './types';
import { SparklesIcon } from './components/icons/FeatureIcons';

const WelcomeScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
      <div className="relative mb-6">
          <div className="absolute -inset-3 bg-violet-500/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative bg-zinc-800 p-6 rounded-full border border-zinc-700">
            <SparklesIcon className="w-20 h-20 text-violet-400" />
          </div>
      </div>
      <h2 className="text-4xl font-bold mb-3 text-white tracking-tight">Welcome to YAN OFFICIAL</h2>
      <p className="text-lg text-zinc-400 max-w-lg">Select a feature from the sidebar to get started.</p>
    </div>
);


const App: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Select 'AI Chat' by default on first load
    setSelectedFeature(FEATURES.find(f => f.id === 'ai-chat') || null);
  }, []);

  const handleSelectFeature = useCallback((feature: Feature) => {
    if (feature.isPremium && !isPremium) {
      setIsModalOpen(true);
      setModalError(null);
    } else {
      setSelectedFeature(feature);
      setIsSidebarOpen(false); // Close sidebar on selection in mobile
    }
  }, [isPremium]);

  const handleUnlock = (code: string) => {
    if (Object.values(ACCESS_CODES).includes(code)) {
      setIsPremium(true);
      setIsModalOpen(false);
      setModalError(null);
    } else {
      setModalError('Invalid access code. Please try again.');
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalError(null);
  };
  
  const CurrentFeatureComponent = selectedFeature?.component;

  return (
    <div className="min-h-screen premium-background text-zinc-200 flex">
      <Sidebar 
        features={FEATURES} 
        selectedFeature={selectedFeature} 
        onSelectFeature={handleSelectFeature} 
        isPremium={isPremium}
        isSidebarOpen={isSidebarOpen}
      />
      
      {/* Overlay for mobile when sidebar is open */}
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
                {CurrentFeatureComponent ? (
                  <CurrentFeatureComponent />
                ) : (
                    <WelcomeScreen />
                )}
            </div>
        </div>
      </main>

      <AccessCodeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUnlock={handleUnlock}
        error={modalError}
      />
    </div>
  );
};

export default App;