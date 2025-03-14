import React from 'react';
import styled from 'styled-components';

interface InitialsAvatarProps {
  name: string;
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
const getColorFromName = (name: string): string => {
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

// Extract initials from a name
const getInitials = (name: string): string => {
  if (!name) return '';
  
  // Split the name by spaces
  const nameParts = name.split(' ').filter(part => part.length > 0);
  
  if (nameParts.length === 0) return '';
  
  if (nameParts.length === 1) {
    // If only one name, return first two letters or just first letter if name is one character
    return nameParts[0].substring(0, Math.min(2, nameParts[0].length));
  }
  
  // Return first letter of first name and first letter of last name
  return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
};

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ name, size = 200 }) => {
  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);
  
  return (
    <AvatarContainer size={size} backgroundColor={backgroundColor}>
      {initials}
    </AvatarContainer>
  );
};

export default InitialsAvatar; 