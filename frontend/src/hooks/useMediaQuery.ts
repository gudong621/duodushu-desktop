'use client';

import { useState, useEffect } from 'react';

/**
 * 媒体查询 Hook - 检测设备类型（移动端/平板/桌面）
 * @returns { isMobile, isTablet, isDesktop } 设备类型状态
 */
export const useMediaQuery = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    handleResize(); // 初始检查
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isTablet, isDesktop };
};

export default useMediaQuery;
