import React from 'react';
import type { Feature } from '../types';

interface FeaturePlaceholderProps {
  feature: Feature;
}

const FeaturePlaceholder: React.FC<FeaturePlaceholderProps> = ({ feature }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
      <div className="relative mb-6">
        <div className="absolute -inset-2 bg-violet-500/10 rounded-full blur-xl"></div>
        <div className="relative bg-zinc-800 p-4 rounded-full border border-zinc-700">
          <feature.Icon className="w-16 h-16 text-violet-400" />
        </div>
      </div>
      <h2 className="text-3xl font-bold mb-2 text-white">{feature.name}</h2>
      <p className="text-lg text-zinc-400 mb-4 max-w-md">{feature.description}</p>
      <div className="mt-6 px-6 py-3 bg-violet-900/50 text-violet-300 border border-violet-700/50 rounded-full">
        <p className="font-semibold tracking-wide">Feature Coming Soon!</p>
      </div>
    </div>
  );
};

export default FeaturePlaceholder;