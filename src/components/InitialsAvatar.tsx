import React from 'react';
import styled from 'styled-components';

interface InitialsAvatarProps {
  name?: string;
  size?: number;
}

const AvatarContainer = styled.div<{ size: number; backgroundColor: string }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background-color: ${props => props.backgroundColor};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: ${props => props.size * 0.4}px;
  text-transform: uppercase;
`;

// Generate a consistent color based on the name
const getColorFromName = (name: string = 'User'): string => {
  // List of pleasant, accessible colors
  const colors = [
    '#3498db', // Blue
    '#e74c3c', // Red
    '#2ecc71', // Green
    '#9b59b6', // Purple
    '#f1c40f', // Yellow
    '#1abc9c', // Teal
    '#d35400', // Orange
    '#34495e', // Dark Blue
    '#16a085', // Green Blue
    '#c0392b', // Dark Red
    '#8e44ad', // Dark Purple
    '#27ae60', // Dark Green
  ];
  
  // Create a simple hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use the hash to pick a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getInitials = (name: string = 'User'): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ name = 'User', size = 200 }) => {
  const backgroundColor = getColorFromName(name);
  const initials = getInitials(name);

  return (
    <AvatarContainer size={size} backgroundColor={backgroundColor}>
      {initials}
    </AvatarContainer>
  );
};

export default InitialsAvatar; 