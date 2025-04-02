import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

const FeaturesContainer = styled.section`
  padding: 5rem 0;
  background-color: var(--background-color);
  overflow: hidden; /* Ensure animations don't cause horizontal scrolling */
  position: relative;
  scroll-margin-top: 80px; /* Add scroll margin to account for fixed header */
`;

const FeaturesTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background-color: var(--accent-color);
  }
`;

const FeaturesGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  position: relative;
`;

// Generate random starting positions for each card
const getRandomPosition = (index: number) => {
  // Create different starting positions based on index to ensure variety
  const positions = [
    { x: -100, y: -100, rotate: -15 },  // top-left
    { x: 0, y: -150, rotate: 5 },       // top
    { x: 100, y: -100, rotate: 15 },    // top-right
    { x: -150, y: 0, rotate: -10 },     // left
    { x: 150, y: 0, rotate: 10 },       // right
    { x: 0, y: 150, rotate: 0 },        // bottom
  ];
  
  // Use the index to get a position, or pick a random one if index is out of bounds
  return positions[index % positions.length];
};

// Custom animation for each card based on its random starting position
const floatIn = (x: number, y: number, rotate: number) => keyframes`
  0% {
    transform: translate(${x}vw, ${y}vh) rotate(${rotate}deg) scale(0.8);
    opacity: 0;
  }
  60% {
    opacity: 1;
  }
  100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 1;
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
  50% {
    box-shadow: 0 5px 25px rgba(231, 76, 60, 0.3);
  }
`;

const FeatureCard = styled.div<{ isVisible: boolean; index: number; x: number; y: number; rotate: number }>`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  opacity: 0;
  position: relative;
  transform: translate(${props => props.x}vw, ${props => props.y}vh) rotate(${props => props.rotate}deg) scale(0.8);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  ${({ isVisible, x, y, rotate, index }) => isVisible && css`
    animation: ${floatIn(x, y, rotate)} 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards, 
               ${glow} 3s ease-in-out infinite;
    animation-delay: ${0.2 * index}s, ${1.5 + 0.2 * index}s;
  `}
  
  &:hover {
    transform: translateY(-10px) scale(1.03);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  ${FeatureIcon} {
    filter: brightness(0) saturate(100%) invert(31%) sepia(98%) saturate(1234%) hue-rotate(199deg) brightness(98%) contrast(101%);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

const FeatureIcon = styled.img`
  width: 50px;
  height: 50px;
  color: ${props => props.theme.colors.primary};
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;

  ${props => props.isVisible && `
    opacity: 1;
    transform: translateY(0);
  `}
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const FeatureTitle = styled.h3<{ isVisible: boolean; index: number }>`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  opacity: 0;
  
  ${({ isVisible, index }) => isVisible && css`
    animation: ${fadeIn} 0.5s ease-out forwards;
    animation-delay: ${1.3 + 0.2 * index}s;
  `}
`;

const FeatureDescription = styled.p<{ isVisible: boolean; index: number }>`
  color: #666;
  line-height: 1.6;
  opacity: 0;
  
  ${({ isVisible, index }) => isVisible && css`
    animation: ${fadeIn} 0.5s ease-out forwards;
    animation-delay: ${1.4 + 0.2 * index}s;
  `}
`;

// Helper function to ensure type safety for translations
const translateString = (t: TFunction<'services', undefined>, key: string, defaultValue: string): string => {
  return t(key, defaultValue);
};

// Helper function for React components that need translated content
const translateReact = (t: TFunction<'services', undefined>, key: string, defaultValue: string): React.ReactNode => {
  return t(key, defaultValue);
};

const Features: React.FC = () => {
  const { t } = useTranslation('services');
  const [isVisible, setIsVisible] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  // Generate random positions for each card
  const cardPositions = Array(6).fill(0).map((_, index) => getRandomPosition(index));
  
  useEffect(() => {
    // Set up intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only set visible if the section is significantly in view
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: [0.2], // Require 20% of the section to be visible
        rootMargin: '0px' // Trigger as soon as the section starts entering viewport
      }
    );
    
    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  // Handle direct navigation to #services-section
  useEffect(() => {
    if (window.location.hash === '#services-section') {
      const servicesSection = document.getElementById('services-section');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);
  
  // Handle scroll to services from sessionStorage
  useEffect(() => {
    const shouldScrollToServices = sessionStorage.getItem('scrollToServices');
    if (shouldScrollToServices) {
      sessionStorage.removeItem('scrollToServices');
      const servicesSection = document.getElementById('services-section');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);
  
  const services = [
    {
      icon: '/images/icons/dev-services.svg',
      title: t('services.development.title'),
      description: t('services.development.description')
    },
    {
      icon: '/images/icons/consulting.svg',
      title: t('services.consulting.title'),
      description: t('services.consulting.description')
    },
    {
      icon: '/images/icons/migration.svg',
      title: t('services.migration.title'),
      description: t('services.migration.description')
    },
    {
      icon: '/images/icons/monitoring.svg',
      title: t('services.monitoring.title'),
      description: t('services.monitoring.description')
    },
    {
      icon: '/images/icons/devops.svg',
      title: t('services.devops.title'),
      description: t('services.devops.description')
    },
    {
      icon: '/images/icons/linux.svg',
      title: t('services.linux.title'),
      description: t('services.linux.description')
    }
  ];
  
  return (
    <FeaturesContainer ref={featuresRef} id="services-section">
      <FeaturesTitle>
        {translateReact(t, 'title', 'Our Services')}
      </FeaturesTitle>
      <FeaturesGrid>
        {services.map((service, index) => {
          const position = cardPositions[index];
          return (
            <FeatureCard
              key={index}
              isVisible={isVisible}
              index={index}
              x={position.x}
              y={position.y}
              rotate={position.rotate}
            >
              <FeatureIcon isVisible={isVisible} src={service.icon} />
              <FeatureTitle isVisible={isVisible} index={index}>
                {service.title}
              </FeatureTitle>
              <FeatureDescription isVisible={isVisible} index={index}>
                {service.description}
              </FeatureDescription>
            </FeatureCard>
          );
        })}
      </FeaturesGrid>
    </FeaturesContainer>
  );
};

export default Features; 