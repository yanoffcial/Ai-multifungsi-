
import React from 'react';

export interface Feature {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  Icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
  category: 'Gratis' | 'Premium';
}
