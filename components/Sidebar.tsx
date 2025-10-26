import React from 'react';
import type { Feature } from '../types';
import { LockClosedIcon, SparklesIcon } from './icons/FeatureIcons';

interface SidebarProps {
  features: Feature[];
  selectedFeature: Feature | null;
  onSelectFeature: (feature: Feature) => void;
  isPremium: boolean;
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ features, selectedFeature, onSelectFeature, isPremium, isSidebarOpen }) => {
  const freeFeatures = features.filter(f => !f.isPremium);
  const premiumFeatures = features.filter(f => f.isPremium);

  const renderFeatureList = (list: Feature[], title: string) => (
    <div>
      <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</h3>
      <ul className="space-y-1">
        {list.map(feature => (
          <li key={feature.id} className="px-2">
            <button
              onClick={() => onSelectFeature(feature)}
              className={`w-full flex items-center p-2 rounded-md text-sm font-medium transition-all duration-200 group relative ${
                selectedFeature?.id === feature.id
                  ? 'bg-violet-500/10 text-violet-300'
                  : 'text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
              }`}
            >
              {selectedFeature?.id === feature.id && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-violet-500 rounded-r-full"></span>
              )}
              <feature.Icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="flex-1 text-left truncate">{feature.name}</span>
              {feature.isPremium && !isPremium && <LockClosedIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <aside className={`fixed top-0 left-0 h-full bg-zinc-900/70 backdrop-blur-lg border-r border-zinc-800/50 transition-transform duration-300 ease-in-out z-40 w-64 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="p-4 border-b border-zinc-800 flex items-center justify-center space-x-2">
        <SparklesIcon className="w-7 h-7 text-violet-400"/>
        <h1 className="text-xl font-bold text-center text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
          YAN OFFICIAL
        </h1>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {renderFeatureList(freeFeatures, 'Free Features')}
        <div className="my-4 border-t border-zinc-800/50"></div>
        {renderFeatureList(premiumFeatures, 'Premium Features')}
      </nav>
       <div className="p-4 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500">Developed by YAN OFFICIAL</p>
      </div>
    </aside>
  );
};

export default Sidebar;