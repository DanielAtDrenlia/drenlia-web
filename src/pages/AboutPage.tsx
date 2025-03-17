import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import CallToAction from '../components/CallToAction';
import InitialsAvatar from '../components/InitialsAvatar';
import type { TeamMember } from '../services/apiService';
import { getAboutSections, getTeamMembers, AboutSection as AboutSectionType } from '../services/apiService';
import { usePreserveScroll } from '../hooks/usePreserveScroll';

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

const SectionContent = styled.div<{ isEven: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  
  ${({ isEven }) => isEven && css`
    direction: rtl;
    
    > * {
      direction: ltr;
    }
  `}
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    direction: ltr;
    
    > * {
      direction: ltr;
    }
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

const SectionText = styled.div<{ isVisible: boolean; delay?: number; isEven: boolean }>`
  opacity: 0;
  
  ${({ isVisible, delay = 0, isEven }) => isVisible && css`
    animation: ${isEven ? fadeInRight : fadeInLeft} 1s ease forwards;
    animation-delay: ${0.4 + delay}s;
  `}
  
  p {
    margin-bottom: 1.5rem;
    line-height: 1.8;
  }
`;

const SectionImage = styled.div<{ isVisible: boolean; delay?: number; isEven: boolean }>`
  opacity: 0;
  
  ${({ isVisible, delay = 0, isEven }) => isVisible && css`
    animation: ${isEven ? fadeInLeft : fadeInRight} 1s ease forwards;
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
    animation: ${popIn} 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    animation-delay: ${0.1 * index}s;
  `}
  
  .team-member-image {
    width: 120px;
    height: 120px;
    margin: 0 auto 1rem;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: scale(1.1);
      }
    }
  }
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  
  h4 {
    font-size: 1rem;
    color: var(--accent-color);
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.6;
    max-width: 300px;
    margin: 0 auto;
  }
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
  const { t, i18n } = useTranslation('about');
  const [sections, setSections] = useState<AboutSectionType[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState<{ [key: string]: boolean }>({});
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Use the scroll preservation hook
  usePreserveScroll(i18n);

  // Helper function to get content based on current language
  const getLocalizedContent = (section: AboutSectionType, field: 'title' | 'description') => {
    const isFrench = i18n.language === 'fr';
    if (isFrench && section[`fr_${field}`]) {
      return section[`fr_${field}`];
    }
    return section[field];
  };

  // Helper function to get team member content based on current language
  const getLocalizedTeamContent = (member: TeamMember, field: 'title' | 'bio'): string => {
    const isFrench = i18n.language === 'fr';
    const frField = member[`fr_${field}`];
    const enField = member[field];
    
    if (isFrench && frField) {
      return frField;
    }
    return enField || '';
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sectionsData, teamData] = await Promise.all([
          getAboutSections(),
          getTeamMembers()
        ]);
        
        // Sort sections by display_order
        const sortedSections = [...sectionsData].sort((a, b) => a.display_order - b.display_order);
        setSections(sortedSections);
        
        // Sort team members by display_order
        const sortedTeamMembers = [...teamData].sort((a, b) => a.display_order - b.display_order);
        setTeamMembers(sortedTeamMembers);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Setup intersection observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          setVisibleSections(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe header
    if (sectionRefs.current['header']) {
      observer.observe(sectionRefs.current['header']);
    }

    // Observe about sections
    sections.forEach(section => {
      const ref = sectionRefs.current[`section-${section.about_id}`];
      if (ref) {
        ref.id = `section-${section.about_id}`;
        observer.observe(ref);
      }
    });

    // Observe team section
    if (sectionRefs.current['team']) {
      sectionRefs.current['team'].id = 'team';
      observer.observe(sectionRefs.current['team']);
    }

    return () => observer.disconnect();
  }, [sections]);

  if (loading) {
    return (
      <AboutContainer>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AboutContainer>
    );
  }

  if (error) {
    return (
      <AboutContainer>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </AboutContainer>
    );
  }

  return (
    <AboutContainer>
      <AboutHeader 
        ref={(el: HTMLDivElement | null) => {
          sectionRefs.current['header'] = el;
          if (el) el.id = 'header';
        }}
      >
        <AboutTitle isVisible={visibleSections.header}>{t('title')}</AboutTitle>
        <AboutSubtitle isVisible={visibleSections.header}>
          {t('subtitle')}
        </AboutSubtitle>
      </AboutHeader>

      {/* About Sections */}
      {sections.map((section, index) => {
        const position = getRandomPosition(index);
        const isEven = index % 2 === 1;
        
        return (
          <AboutSection
            key={section.about_id}
            ref={(el: HTMLDivElement | null) => {
              sectionRefs.current[`section-${section.about_id}`] = el;
              if (el) el.id = `section-${section.about_id}`;
            }}
            isVisible={visibleSections[`section-${section.about_id}`]}
            x={position.x}
            y={position.y}
            rotate={position.rotate}
          >
            <SectionTitle isVisible={visibleSections[`section-${section.about_id}`]}>
              {getLocalizedContent(section, 'title')}
            </SectionTitle>
            <SectionContent isEven={isEven}>
              <SectionText isVisible={visibleSections[`section-${section.about_id}`]} isEven={isEven}>
                {getLocalizedContent(section, 'description')}
              </SectionText>
              <SectionImage isVisible={visibleSections[`section-${section.about_id}`]} isEven={isEven}>
                <img
                  src={section.image_url}
                  alt={section.title}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M24%2020.993V24H0v-2.996A14.977%2014.977%200%200112.004%2015c4.904%200%209.26%202.354%2011.996%205.993zM16.002%208.999a4%204%200%2011-8%200%204%204%200%20018%200z%22%20%2F%3E%3C%2Fsvg%3E';
                  }}
                />
              </SectionImage>
            </SectionContent>
          </AboutSection>
        );
      })}

      {/* Team Section */}
      <TeamSection
        ref={(el: HTMLDivElement | null) => {
          sectionRefs.current['team'] = el;
          if (el) el.id = 'team';
        }}
        isVisible={visibleSections.team}
      >
        <SectionTitle isVisible={visibleSections.team}>{t('team.title')}</SectionTitle>
        <TeamGrid>
          {teamMembers.map((member, index) => (
            <TeamMember
              key={member.team_id}
              isVisible={visibleSections.team}
              index={index}
            >
              {member.image_url ? (
                <div className="team-member-image">
                  <img
                    src={member.image_url}
                    alt={member.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M24%2020.993V24H0v-2.996A14.977%2014.977%200%200112.004%2015c4.904%200%209.26%202.354%2011.996%205.993zM16.002%208.999a4%204%200%2011-8%200%204%204%200%20018%200z%22%20%2F%3E%3C%2Fsvg%3E';
                    }}
                  />
                </div>
              ) : (
                <InitialsAvatar name={member.name} size={120} />
              )}
              <h3>{member.name}</h3>
              <h4>{i18n.language === 'fr' && member.fr_title ? member.fr_title : member.title}</h4>
              {(member.bio || member.fr_bio) && (
                <p>{i18n.language === 'fr' && member.fr_bio ? member.fr_bio : member.bio || ''}</p>
              )}
            </TeamMember>
          ))}
        </TeamGrid>
      </TeamSection>
    </AboutContainer>
  );
};

export default AboutPage;