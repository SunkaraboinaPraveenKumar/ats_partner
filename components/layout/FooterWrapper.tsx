"use client";

import { usePathname } from 'next/navigation';
import Footer from './footer';
import React from 'react';

const FooterWrapper: React.FC = () => {
  const pathname = usePathname();
  const hideFooter = pathname.includes('/messages/');

  return <>{!hideFooter && <Footer />}</>;
};

export default FooterWrapper; 