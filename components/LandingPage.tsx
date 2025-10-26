import React from 'react';
import { FEATURES } from '../constants';
import type { Feature } from '../types';
import { LockClosedIcon, SparklesIcon } from './icons/FeatureIcons';

interface LandingPageProps {
  onSelectFeature: (feature: Feature) => void;
}

const FeatureCard: React.FC<{ feature: Feature; onSelect: () => void; }> = ({ feature, onSelect }) => (
  <button
    onClick={onSelect}
    className="relative flex flex-col items-start w-full h-full p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-left card-hover-effect overflow-hidden"
  >
    {feature.isPremium && (
      <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-semibold bg-yellow-900/50 text-yellow-300 border border-yellow-700/50 rounded-full px-2 py-1">
        <LockClosedIcon className="w-3 h-3" />
        <span>Premium</span>
      </div>
    )}
    <div className="relative bg-zinc-800 p-3 rounded-xl border border-zinc-700 mb-4">
      <feature.Icon className="w-7 h-7 text-violet-400" />
    </div>
    <h3 className="font-semibold text-white text-lg mb-1">{feature.name}</h3>
    <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
  </button>
);


const LandingPage: React.FC<LandingPageProps> = ({ onSelectFeature }) => {
  const freeFeatures = FEATURES.filter(f => !f.isPremium);
  const premiumFeatures = FEATURES.filter(f => f.isPremium);

  const renderFeatureSection = (title: string, features: Feature[]) => (
    <section className="mb-12">
      <h2 className="text-3xl font-bold tracking-tight text-white mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(feature => (
          <FeatureCard key={feature.id} feature={feature} onSelect={() => onSelectFeature(feature)} />
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen w-full premium-background text-zinc-200 animate-fade-in">
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative bg-zinc-800 p-5 rounded-full border border-zinc-700">
              <SparklesIcon className="w-16 h-16 text-violet-400" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white mb-4">
            Website AI Multifungsi
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto">
            Jelajahi berbagai alat AI canggih yang didukung oleh Gemini. Dari pembuatan konten hingga asisten developer, semua ada di sini. Pilih salah satu fitur untuk memulai.
          </p>
        </header>

        {renderFeatureSection('Fitur Gratis', freeFeatures)}
        {renderFeatureSection('Fitur Premium', premiumFeatures)}
        
        <footer className="text-center mt-16 border-t border-zinc-800/50 pt-8">
            <p className="text-zinc-500">Developed by YAN OFFICIAL</p>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
