import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
  }
`;

const ScrollButton = styled.button<{ visible: boolean }>`
  position: fixed;
  bottom: 30px;
  left: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--accent-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: ${({ visible }) => (visible ? '0.9' : '0')};
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  transition: all 0.3s ease;
  z-index: 99;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  ${({ visible }) => visible && css`
    animation: ${pulse} 2s infinite;
  `}
  
  &:hover {
    opacity: 1;
    background-color: #c0392b;
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
  }
`;

const ArrowIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
);

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', toggleVisibility);
    
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <ScrollButton 
      visible={isVisible} 
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ArrowIcon />
    </ScrollButton>
  );
};

export default ScrollToTopButton; 