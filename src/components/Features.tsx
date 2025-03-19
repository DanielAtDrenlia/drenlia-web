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

const FeatureIcon = styled.div<{ isVisible: boolean; index: number }>`
  margin-bottom: 1.5rem;
  opacity: 0;
  
  svg {
    width: 50px;
    height: 50px;
    color: var(--accent-color);
  }
  
  ${({ isVisible, index }) => isVisible && css`
    animation: ${pulse} 0.5s ease-out forwards;
    animation-delay: ${1.2 + 0.2 * index}s;
    opacity: 1;
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

// SVG Icons for each service
const DevServicesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
    <line x1="12" y1="2" x2="12" y2="22"></line>
  </svg>
);

const ConsultingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const MigrationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5"></path>
    <path d="M5 12l7-7 7 7"></path>
    <path d="M5 19h14"></path>
  </svg>
);

const MonitoringIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
    <polyline points="7 8 12 13 17 8"></polyline>
  </svg>
);

const DevOpsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const LinuxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Penguin body */}
    <ellipse cx="12" cy="14" rx="6" ry="8" fill="currentColor" opacity="0.9" />
    
    {/* Penguin head */}
    <ellipse cx="12" cy="8" rx="5" ry="5" fill="currentColor" opacity="0.9" />
    
    {/* White belly */}
    <ellipse cx="12" cy="14" rx="3.5" ry="6" fill="white" stroke="none" />
    <ellipse cx="12" cy="9" rx="3" ry="3" fill="white" stroke="none" />
    
    {/* Eyes */}
    <circle cx="10.5" cy="7" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="13.5" cy="7" r="0.8" fill="currentColor" stroke="none" />
    
    {/* Beak */}
    <path d="M11.5 9L12 10L12.5 9" stroke="currentColor" strokeWidth="1" />
    
    {/* Feet */}
    <path d="M9 21L8 22M15 21L16 22" stroke="currentColor" strokeWidth="1.5" />
    
    {/* Wings */}
    <path d="M6 12C5 13 5 16 6 18M18 12C19 13 19 16 18 18" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

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
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          // Add a small delay to ensure smooth scrolling has completed
          setTimeout(() => {
            setIsVisible(true);
          }, 100);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: [0.3], // Require 30% of the section to be visible
        rootMargin: '-10% 0px' // Trigger slightly after entering viewport
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
      icon: <DevServicesIcon />,
      title: translateString(t, 'categories.dev.title', 'Dev Services'),
      description: translateString(t, 'categories.dev.description', 'We create responsive websites and mobile applications using the latest technologies to ensure your digital products stand out and perform across all devices.')
    },
    {
      icon: <ConsultingIcon />,
      title: translateString(t, 'categories.consulting.title', 'IT Consulting'),
      description: translateString(t, 'categories.consulting.description', 'Our expert consultants provide strategic guidance to optimize your IT infrastructure, improve efficiency, and align technology with your business goals.')
    },
    {
      icon: <MigrationIcon />,
      title: translateString(t, 'categories.migration.title', 'Infrastructure Migration'),
      description: translateString(t, 'categories.migration.description', 'We help you seamlessly transition to new infrastructure solutions, minimizing downtime and ensuring a smooth migration process.')
    },
    {
      icon: <MonitoringIcon />,
      title: translateString(t, 'categories.monitoring.title', 'Monitoring'),
      description: translateString(t, 'categories.monitoring.description', 'Our comprehensive monitoring solutions provide real-time insights into your systems, helping you prevent issues before they impact your business.')
    },
    {
      icon: <DevOpsIcon />,
      title: translateString(t, 'categories.devops.title', 'DevOps/SysOps'),
      description: translateString(t, 'categories.devops.description', 'We implement efficient DevOps practices and system operations to streamline your development pipeline and improve deployment reliability.')
    },
    {
      icon: <LinuxIcon />,
      title: translateString(t, 'categories.linux.title', 'Linux Admin'),
      description: translateString(t, 'categories.linux.description', 'With extensive Linux administration knowledge, we can help you manage your Linux environment and ensure they are running smoothly and securely.')
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
              <FeatureIcon isVisible={isVisible} index={index}>
                {service.icon}
              </FeatureIcon>
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