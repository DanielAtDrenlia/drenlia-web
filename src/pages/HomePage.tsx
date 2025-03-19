import React from 'react';
import { useTranslation } from 'react-i18next';
import Hero from '../components/Hero';
import Features from '../components/Features';
import CallToAction from '../components/CallToAction';
import { usePreserveScroll } from '../hooks/usePreserveScroll';

const HomePage: React.FC = () => {
  const { i18n } = useTranslation();
  usePreserveScroll(i18n);

  return (
    <>
      <Hero />
      <Features />
      <CallToAction />
    </>
  );
};

export default HomePage; 