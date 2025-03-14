import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const NotFoundContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 5rem 1rem;
  text-align: center;
`;

const NotFoundTitle = styled.h1`
  font-size: 8rem;
  margin-bottom: 1rem;
  color: var(--accent-color);
  
  @media (max-width: 768px) {
    font-size: 5rem;
  }
`;

const NotFoundSubtitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const NotFoundText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
`;

const HomeButton = styled(Link)`
  display: inline-block;
  background-color: var(--accent-color);
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #c0392b;
    color: white;
  }
`;

const NotFoundPage: React.FC = () => {
  return (
    <NotFoundContainer>
      <NotFoundTitle>404</NotFoundTitle>
      <NotFoundSubtitle>Page Not Found</NotFoundSubtitle>
      <NotFoundText>
        The page you are looking for might have been removed, had its name changed, 
        or is temporarily unavailable.
      </NotFoundText>
      <HomeButton to="/">Return to Homepage</HomeButton>
    </NotFoundContainer>
  );
};

export default NotFoundPage; 