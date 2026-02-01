'use client';

import { useState, useEffect } from 'react';

/**
 * 窗口尺寸 Hook - 监听窗口大小变化
 * @returns { width, height } 窗口宽高
 */
export const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};

export default useWindowSize;
