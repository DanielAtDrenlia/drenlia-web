import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import CallToAction from '../components/CallToAction';

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <Features />
      <CallToAction />
    </>
  );
};

export default HomePage; 