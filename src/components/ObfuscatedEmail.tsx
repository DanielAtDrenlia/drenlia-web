import React, { useState } from 'react';
import styled from 'styled-components';

const EmailContainer = styled.span`
  display: inline-flex;
  align-items: center;
  user-select: none;
  position: relative;
  cursor: pointer;
  
  &:hover {
    color: var(--accent-color);
  }
`;

const EmailPart = styled.span`
  display: inline-block;
`;

const EmailSymbol = styled.span`
  margin: 0 2px;
  font-family: monospace;
`;

const Tooltip = styled.span<{ visible: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 10;
  margin-bottom: 5px;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: none;
  
  &::before {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
  }
`;

const ObfuscatedEmail: React.FC = () => {
  const [tooltipText, setTooltipText] = useState("Click to copy email");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  // Email parts stored separately to avoid easy scraping
  const emailUser = "info";
  const emailDomain = "drenlia.com";
  
  const handleCopyEmail = () => {
    // Assemble the email only when clicked
    const email = `${emailUser}@${emailDomain}`;
    
    // Use the clipboard API to copy the email
    navigator.clipboard.writeText(email)
      .then(() => {
        setTooltipText("Email copied!");
        setTooltipVisible(true);
        
        // Hide the tooltip after 2 seconds
        setTimeout(() => {
          setTooltipVisible(false);
        }, 2000);
      })
      .catch(() => {
        setTooltipText("Failed to copy");
        setTooltipVisible(true);
        
        // Hide the tooltip after 2 seconds
        setTimeout(() => {
          setTooltipVisible(false);
        }, 2000);
      });
  };
  
  const handleMouseEnter = () => {
    setTooltipText("Click to copy email");
    setTooltipVisible(true);
  };
  
  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };
  
  return (
    <EmailContainer 
      onClick={handleCopyEmail}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Click to copy email address"
    >
      <Tooltip visible={tooltipVisible}>{tooltipText}</Tooltip>
      <span style={{ display: 'none' }}>email-protected</span>
      <EmailPart>i</EmailPart>
      <EmailPart>n</EmailPart>
      <EmailPart>f</EmailPart>
      <EmailPart>o</EmailPart>
      <EmailSymbol>@</EmailSymbol>
      <EmailPart>d</EmailPart>
      <EmailPart>r</EmailPart>
      <EmailPart>e</EmailPart>
      <EmailPart>n</EmailPart>
      <EmailPart>l</EmailPart>
      <EmailPart>i</EmailPart>
      <EmailPart>a</EmailPart>
      <EmailPart>.</EmailPart>
      <EmailPart>c</EmailPart>
      <EmailPart>o</EmailPart>
      <EmailPart>m</EmailPart>
    </EmailContainer>
  );
};

export default ObfuscatedEmail; 