import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UiState {
  homeScrollY: number;
  setHomeScrollY: (y: number) => void;
}

const UiContext = createContext<UiState | undefined>(undefined);

export function UiProvider({ children }: { children: ReactNode }) {
  const [homeScrollY, setHomeScrollY] = useState(0);

  const value = React.useMemo(
    () => ({ homeScrollY, setHomeScrollY }),
    [homeScrollY, setHomeScrollY],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used within UiProvider');
  return ctx;
}
