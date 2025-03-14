import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeroContainer = styled.section`
  height: 80vh;
  display: flex;
  align-items: center;
  position: relative;
  color: var(--light-text-color);
  overflow: hidden;
`;

const VideoBackground = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: -1;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  max-width: 600px;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    width: fit-content;
  }
`;

const ButtonBase = styled.button`
  background-color: var(--accent-color);
  color: var(--light-text-color);
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  display: inline-block;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
  text-decoration: none;
  
  &:hover {
    background-color: #c0392b;
    color: var(--light-text-color);
  }
`;

const ServicesButton = styled(ButtonBase)``;

const PrimaryButton = styled(Link)`
  background-color: var(--accent-color);
  color: var(--light-text-color);
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  display: inline-block;
  text-decoration: none;
  
  &:hover {
    background-color: #c0392b;
    color: var(--light-text-color);
  }
`;

const SecondaryButton = styled(Link)`
  background-color: transparent;
  color: var(--light-text-color);
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-weight: 500;
  border: 2px solid var(--light-text-color);
  transition: all 0.3s ease;
  display: inline-block;
  
  &:hover {
    background-color: var(--light-text-color);
    color: var(--primary-color);
  }
`;

const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5; // Set playback speed to 75%
    }
  }, []);
  
  const scrollToServices = () => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      // Set a flag in sessionStorage to indicate we're scrolling to services
      sessionStorage.setItem('scrollToServices', 'true');
      servicesSection.scrollIntoView({ behavior: 'smooth' });
      
      // Force the animation to be visible
      const event = new CustomEvent('servicesVisible');
      window.dispatchEvent(event);
    }
  };
  
  return (
    <HeroContainer>
      <VideoBackground autoPlay loop muted playsInline ref={videoRef}>
        <source src="/videos/abstract.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </VideoBackground>
      <Overlay />
      <HeroContent>
        <HeroTitle>Welcome to Drenlia</HeroTitle>
        <HeroSubtitle>
          We create innovative solutions for modern problems. Explore our services and projects.
        </HeroSubtitle>
        <HeroButtons>
          <ServicesButton onClick={scrollToServices}>Services</ServicesButton>
          <PrimaryButton to="/projects">Projects</PrimaryButton>
          <SecondaryButton to="/contact">Contact Us</SecondaryButton>
        </HeroButtons>
      </HeroContent>
    </HeroContainer>
  );
};

export default Hero; 