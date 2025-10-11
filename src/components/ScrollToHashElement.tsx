// src/components/ScrollToHashElement.tsx

import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToHashElement = () => {
  const location = useLocation();

  useLayoutEffect(() => {
    const { hash } = location;

    // A small delay to ensure the page has rendered before scrolling
    const timeoutId = setTimeout(() => {
      if (hash) {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location]); // Re-run this effect every time the location changes

  return null; // This component does not render any visible UI
};

export default ScrollToHashElement;