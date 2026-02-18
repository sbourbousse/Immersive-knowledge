'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Fact } from '@/types';
import { FocusMode } from './FocusMode';

interface FocusModeContextType {
  selectedFact: Fact | null;
  openFocus: (fact: Fact) => void;
  closeFocus: () => void;
}

const FocusModeContext = createContext<FocusModeContextType | null>(null);

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used within FocusModeProvider');
  }
  return context;
}

interface FocusModeProviderProps {
  children: ReactNode;
}

export function FocusModeProvider({ children }: FocusModeProviderProps) {
  const [selectedFact, setSelectedFact] = useState<Fact | null>(null);

  const openFocus = (fact: Fact) => {
    setSelectedFact(fact);
  };

  const closeFocus = () => {
    setSelectedFact(null);
  };

  return (
    <FocusModeContext.Provider value={{ selectedFact, openFocus, closeFocus }}>
      {children}
      {selectedFact && (
        <FocusMode fact={selectedFact} onClose={closeFocus} />
      )}
    </FocusModeContext.Provider>
  );
}
