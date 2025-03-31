import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import CallToAction from '../components/CallToAction';
import InitialsAvatar from '../components/InitialsAvatar';
import type { TeamMember as ApiTeamMember } from '../services/apiService';
import { getAboutSections, getTeamMembers } from '../services/apiService';
import { usePreserveScroll } from '../hooks/usePreserveScroll';
import ReactDOM from 'react-dom/client';

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
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    
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

interface AboutSectionType {
  about_id: number;
  title: string;
  fr_title: string | null;
  description: string;
  fr_description: string | null;
  image_url: string | null;
  display_order: number;
}

interface TeamMember extends ApiTeamMember {
  member_id: number;
}

interface VisibleSections {
  header: boolean;
  team: boolean;
  [key: string]: boolean;
}

// Helper function to ensure type safety for translations
const translateString = (t: TFunction<'about', undefined>, key: string, defaultValue: string): string => {
  return t(key, defaultValue);
};

// Helper function for React components that need translated content
const translateReact = (t: TFunction<'about', undefined>, key: string, defaultValue: string): React.ReactNode => {
  return t(key, defaultValue);
};

// Helper function to get team member content based on current language
const getLocalizedTeamContent = (member: TeamMember, field: 'title' | 'bio', language: string): string => {
  const isFrench = language === 'fr';
  const frField = member[`fr_${field}`];
  const enField = member[field];
  
  if (isFrench && frField) {
    return frField;
  }
  return enField || '';
};

const TeamMemberComponent: React.FC<{
  member: TeamMember;
  isVisible: boolean;
  index: number;
}> = ({ member, isVisible, index }) => {
  const [imageError, setImageError] = useState(false);
  const { i18n } = useTranslation();

  return (
    <TeamMember
      isVisible={isVisible}
      index={index}
    >
      <div className="team-member-image">
        {member.image_url && !imageError ? (
          <img
            src={member.image_url}
            alt={member.name}
            onError={() => setImageError(true)}
          />
        ) : (
          <InitialsAvatar name={member.name} size={120} />
        )}
      </div>
      <h3>{member.name}</h3>
      <h4>{getLocalizedTeamContent(member, 'title', i18n.language)}</h4>
      {(member.bio || member.fr_bio) && (
        <p>{getLocalizedTeamContent(member, 'bio', i18n.language)}</p>
      )}
    </TeamMember>
  );
};

const AboutPage: React.FC = () => {
  const { t, i18n } = useTranslation('about');
  const [sections, setSections] = useState<AboutSectionType[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState<VisibleSections>({
    header: false,
    team: false,
  });
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  usePreserveScroll(i18n);

  // Helper function to get content based on current language
  const getLocalizedContent = (section: AboutSectionType, field: 'title' | 'description') => {
    const isFrench = i18n.language === 'fr';
    if (isFrench && section[`fr_${field}`]) {
      return section[`fr_${field}`];
    }
    return section[field];
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
        
        // Sort team members by display_order and add member_id
        const sortedTeamMembers = [...teamData]
          .sort((a, b) => a.display_order - b.display_order)
          .map(member => ({ ...member, member_id: member.team_id }));
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
        <AboutTitle isVisible={visibleSections.header}>
          {translateReact(t, 'title', 'About Us')}
        </AboutTitle>
        <AboutSubtitle isVisible={visibleSections.header}>
          {translateReact(t, 'subtitle', 'Discover our story and meet the team behind our success')}
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
            index={index}
          >
            <SectionTitle isVisible={visibleSections[`section-${section.about_id}`]}>
              {getLocalizedContent(section, 'title')}
            </SectionTitle>
            <SectionContent isEven={isEven}>
              <SectionText isVisible={visibleSections[`section-${section.about_id}`]} isEven={isEven}>
                {getLocalizedContent(section, 'description')}
              </SectionText>
              <SectionImage isVisible={visibleSections[`section-${section.about_id}`]} isEven={isEven}>
                {section.image_url ? (
                  <img
                    src={section.image_url}
                    alt={section.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement?.querySelector('div')?.style.removeProperty('display');
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#666'
                  }}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="48" 
                      height="48" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
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
        <SectionTitle isVisible={visibleSections.team}>
          {translateReact(t, 'team.title', 'Our Team')}
        </SectionTitle>
        <TeamGrid>
          {teamMembers.map((member, index) => (
            <TeamMemberComponent
              key={member.member_id}
              member={member}
              isVisible={visibleSections.team}
              index={index}
            />
          ))}
        </TeamGrid>
      </TeamSection>
    </AboutContainer>
  );
};

export default AboutPage;