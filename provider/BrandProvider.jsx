'use client';
import React, { createContext, useContext, useState } from 'react';

const BrandContext = createContext(undefined);

export const BrandProvider = ({ children }) => {
  const [selectedBrandLogo, setSelectedBrandLogo] = useState('/images/logo/mingle-01.png');
  const [selectedBrandName, setSelectedBrandName] = useState('All');
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <BrandContext.Provider
      value={{
        selectedBrandLogo,
        setSelectedBrandLogo,
        selectedBrandName,
        setSelectedBrandName,
        isCollapsed,
        setIsCollapsed,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrandContext = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrandContext must be used within a BrandProvider');
  }
  return context;
};
