import React, { createContext, useContext, useState, useEffect } from 'react';

interface CompareContextType {
  compareList: string[];
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  toggleCompare: (id: string) => void;
  isCompared: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<string[]>(() => {
    const saved = localStorage.getItem('compareList');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (id: string) => {
    setCompareList(prev => {
      if (prev.includes(id)) return prev;
      if (prev.length >= 4) {
        alert('You can compare up to 4 properties at a time.'); // In a real app we'd use a toast
        return prev;
      }
      return [...prev, id];
    });
  };

  const removeFromCompare = (id: string) => {
    setCompareList(prev => prev.filter(item => item !== id));
  };

  const clearCompare = () => {
    setCompareList([]);
  };
  
  const toggleCompare = (id: string) => {
    if (compareList.includes(id)) {
      removeFromCompare(id);
    } else {
      addToCompare(id);
    }
  };

  const isCompared = (id: string) => compareList.includes(id);

  return (
    <CompareContext.Provider value={{
      compareList,
      addToCompare,
      removeFromCompare,
      clearCompare,
      toggleCompare,
      isCompared
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
