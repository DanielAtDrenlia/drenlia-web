import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import CallToAction from '../components/CallToAction';
import InitialsAvatar from '../components/InitialsAvatar';

const AboutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 1rem;
  overflow: hidden; /* Ensure animations don't cause horizontal scrolling */
`;

const AboutHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const fadeInDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AboutTitle = styled.h1<{ isVisible: boolean }>`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  opacity: 0;
  
  ${({ isVisible }) => isVisible && css`
    animation: ${fadeInDown} 1s ease forwards;
  `}
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const AboutSubtitle = styled.p<{ isVisible: boolean }>`
  font-size: 1.2rem;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0;
  
  ${({ isVisible }) => isVisible && css`
    animation: ${fadeIn} 1s ease forwards;
    animation-delay: 0.5s;
  `}
`;

// Generate random starting positions for sections
const getRandomPosition = (index: number) => {
  // Create different starting positions based on index to ensure variety
  const positions = [
    { x: -100, y: 0, rotate: -5 },    // left
    { x: 100, y: 0, rotate: 5 },      // right
    { x: 0, y: 100, rotate: 0 },      // bottom
    { x: -80, y: 80, rotate: -3 },    // bottom-left
    { x: 80, y: 80, rotate: 3 },      // bottom-right
  ];
  
  return positions[index % positions.length];
};

// Custom animation for each section based on its random starting position
const floatIn = (x: number, y: number, rotate: number) => keyframes`
  0% {
    transform: translate(${x}px, ${y}px) rotate(${rotate}deg);
    opacity: 0;
  }
  60% {
    opacity: 1;
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 1;
  }
`;

const AboutSection = styled.section<{ isVisible: boolean; index: number; x: number; y: number; rotate: number }>`
  margin-bottom: 5rem;
  opacity: 0;
  transform: translate(${props => props.x}px, ${props => props.y}px) rotate(${props => props.rotate}deg);
  
  ${({ isVisible, x, y, rotate, index }) => isVisible && css`
    animation: ${floatIn(x, y, rotate)} 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
    animation-delay: ${0.2 * index}s;
  `}
`;

const slideIn = keyframes`
  from {
    transform: translateX(-50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const SectionTitle = styled.h2<{ isVisible: boolean }>`
  font-size: 2rem;
  margin-bottom: 2rem;
  position: relative;
  opacity: 0;
  
  ${({ isVisible }) => isVisible && css`
    animation: ${slideIn} 0.8s ease forwards;
  `}
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 0;
    height: 3px;
    background-color: var(--accent-color);
    transition: width 1s ease;
    
    ${({ isVisible }) => isVisible && css`
      width: 60px;
      transition-delay: 0.8s;
    `}
  }
`;

const SectionContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const fadeInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const SectionText = styled.div<{ isVisible: boolean; delay?: number }>`
  opacity: 0;
  
  ${({ isVisible, delay = 0 }) => isVisible && css`
    animation: ${fadeInLeft} 1s ease forwards;
    animation-delay: ${0.4 + delay}s;
  `}
  
  p {
    margin-bottom: 1.5rem;
    line-height: 1.8;
  }
`;

const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const SectionImage = styled.div<{ isVisible: boolean; delay?: number }>`
  opacity: 0;
  
  ${({ isVisible, delay = 0 }) => isVisible && css`
    animation: ${fadeInRight} 1s ease forwards;
    animation-delay: ${0.4 + delay}s;
  `}
  
  img {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    
    &:hover {
      transform: scale(1.03);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    }
  }
  
  @media (max-width: 768px) {
    grid-row: 1;
  }
`;

const TeamSection = styled.section<{ isVisible: boolean }>`
  margin-bottom: 5rem;
  opacity: 0;
  
  ${({ isVisible }) => isVisible && css`
    animation: ${fadeIn} 1s ease forwards;
  `}
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

// Animation for team members
const popIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(50px);
  }
  70% {
    transform: scale(1.1) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const TeamMember = styled.div<{ isVisible: boolean; index: number }>`
  text-align: center;
  opacity: 0;
  
  ${({ isVisible, index }) => isVisible && css`
    animation: ${popIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: ${0.2 * index}s;
  `}
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: 0 15px 30px rgba(231, 76, 60, 0.3);
  }
  100% {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const TeamMemberImage = styled.div<{ isVisible: boolean }>`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 1.5rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  
  ${({ isVisible }) => isVisible && css`
    animation: ${pulse} 3s ease-in-out infinite;
    animation-delay: 1s;
  `}
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  &:hover img {
    transform: scale(1.1);
  }
`;

const TeamMemberName = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const TeamMemberRole = styled.p`
  color: #666;
  font-style: italic;
  margin-bottom: 1rem;
`;

const TeamMemberBio = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
`;

const AboutPage: React.FC = () => {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [sectionsVisible, setSectionsVisible] = useState<boolean[]>([false, false, false]);
  const [teamVisible, setTeamVisible] = useState(false);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = [useRef<HTMLElement>(null), useRef<HTMLElement>(null), useRef<HTMLElement>(null)];
  const teamRef = useRef<HTMLElement>(null);
  
  // Generate random positions for each section
  const sectionPositions = [
    getRandomPosition(0),
    getRandomPosition(1),
    getRandomPosition(2)
  ];
  
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };
    
    // Create observers for each section
    const headerObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHeaderVisible(true);
        headerObserver.disconnect();
      }
    }, observerOptions);
    
    const sectionObservers = sectionRefs.map((_, index) => {
      return new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setSectionsVisible(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
          sectionObservers[index].disconnect();
        }
      }, observerOptions);
    });
    
    const teamObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTeamVisible(true);
        teamObserver.disconnect();
      }
    }, observerOptions);
    
    // Observe elements
    if (headerRef.current) {
      headerObserver.observe(headerRef.current);
    }
    
    sectionRefs.forEach((ref, index) => {
      if (ref.current) {
        sectionObservers[index].observe(ref.current);
      }
    });
    
    if (teamRef.current) {
      teamObserver.observe(teamRef.current);
    }
    
    // Cleanup
    return () => {
      headerObserver.disconnect();
      sectionObservers.forEach(observer => observer.disconnect());
      teamObserver.disconnect();
    };
  }, []);
  
  const teamMembers = [
    {
      name: 'Daniel Desrosiers',
      role: 'CEO & Founder',
      bio: 'With over 25 years of experience, Daniel has cumulated extensive knowledge in cloud services, datacenter management and operations. Since a very young age and until today, he is a technology enthusiast.',
      image: '/images/team/daniel.jpg'
    },
    {
      name: 'Tristan Desrosiers',
      role: 'Lead Developer',
      bio: 'Tristan is a full-stack developer with a passion for creating elegant, efficient code and solving complex problems.',
      image: '/images/team/tristan.png'
    },
    {
      name: 'Andrew Gullotti',
      role: 'Product Owner',
      bio: 'Andrew is always thinking of new ideas and looking for ways to enhance the user experience. He currently plays the role of product owner at Drenlia.',
      image: ''
    },
    {
      name: 'Amanda Beauregard',
      role: 'Digital Art Consultant',
      bio: 'Amanda has a passion for creating beautiful and functional digital art. Currently, she is a student at Dawson College in the Illustration program.',
      image: '/images/team/amanda.png'
    }
  ];
  
  return (
    <>
      <AboutContainer>
        <AboutHeader ref={headerRef}>
          <AboutTitle isVisible={headerVisible}>About Drenlia</AboutTitle>
          <AboutSubtitle isVisible={headerVisible}>
            We are a team of passionate technologists dedicated to creating innovative digital solutions 
            that help businesses thrive in the modern world.
          </AboutSubtitle>
        </AboutHeader>
        
        <AboutSection 
          ref={sectionRefs[0]}
          isVisible={sectionsVisible[0]} 
          index={0}
          x={sectionPositions[0].x}
          y={sectionPositions[0].y}
          rotate={sectionPositions[0].rotate}
        >
          <SectionTitle isVisible={sectionsVisible[0]}>Our Story</SectionTitle>
          <SectionContent>
            <SectionText isVisible={sectionsVisible[0]}>
              <p>
                Founded in 2015, Drenlia began with a simple mission: to improve technology and services for businesses of all sizes.
              </p>
              <p>
                Over the years, we've grown, evolved and transformed into a team of passionate technologists dedicated to creating innovative digital solutions.
              </p>
              <p>
                Today, we continue to push the boundaries of what's possible, staying at the forefront of 
                technological innovation while remaining committed to our core values of excellence, 
                integrity, and client satisfaction.
              </p>
            </SectionText>
            <SectionImage isVisible={sectionsVisible[0]}>
              <img src="/images/about/office.jpg" alt="Drenlia office" />
            </SectionImage>
          </SectionContent>
        </AboutSection>
        
        <AboutSection 
          ref={sectionRefs[1]}
          isVisible={sectionsVisible[1]} 
          index={1}
          x={sectionPositions[1].x}
          y={sectionPositions[1].y}
          rotate={sectionPositions[1].rotate}
        >
          <SectionTitle isVisible={sectionsVisible[1]}>Our Mission</SectionTitle>
          <SectionContent>
            <SectionImage isVisible={sectionsVisible[1]}>
              <img src="/images/about/collab.jpg" alt="Team collaboration" />
            </SectionImage>
            <SectionText isVisible={sectionsVisible[1]}>
              <p>
                At Drenlia, our mission is to empower businesses through technology. We believe that the right 
                digital solutions can transform organizations, enabling them to achieve their goals and make a 
                positive impact in the world.
              </p>
              <p>
                We are committed to delivering exceptional value to our clients by combining technical excellence 
                with strategic thinking. Our solutions are not just technically sound but also aligned with business objectives.
              </p>
              <p>
                We strive to build long-term partnerships with, serving as trusted advisors who help 
                people and businesses navigate the ever-changing technological landscape and seize new opportunities for growth.
              </p>
            </SectionText>
          </SectionContent>
        </AboutSection>
        
        <TeamSection ref={teamRef} isVisible={teamVisible}>
          <SectionTitle isVisible={teamVisible}>Our Team</SectionTitle>
          <SectionText isVisible={teamVisible} delay={0.2}>
            <p>
              Our success is driven by our talented team of professionals who bring diverse skills, 
              perspectives, and experiences to every project.
            </p>
          </SectionText>
          <TeamGrid>
            {teamMembers.map((member, index) => (
              <TeamMember key={index} isVisible={teamVisible} index={index}>
                <TeamMemberImage isVisible={teamVisible}>
                  {member.image ? (
                    <img src={member.image} alt={member.name} />
                  ) : (
                    <InitialsAvatar name={member.name} />
                  )}
                </TeamMemberImage>
                <TeamMemberName>{member.name}</TeamMemberName>
                <TeamMemberRole>{member.role}</TeamMemberRole>
                <TeamMemberBio>{member.bio}</TeamMemberBio>
              </TeamMember>
            ))}
          </TeamGrid>
        </TeamSection>
      </AboutContainer>
      
      <CallToAction />
    </>
  );
};

export default AboutPage; 