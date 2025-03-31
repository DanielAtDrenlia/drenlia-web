import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { i18n } from 'i18next';
import { usePreserveScroll } from '../hooks/usePreserveScroll';
import CallToAction from '../components/CallToAction';
import Modal from '../components/Modal';
import { getProjects, getProjectTypes, type Project, type ProjectType } from '../services/apiService';

interface StyledProps {
  isVisible: boolean;
}

interface FilterButtonProps {
  active: boolean;
}

const ProjectsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 1rem;
  overflow: hidden; /* Ensure animations don't cause horizontal scrolling */
`;

const ProjectsHeader = styled.div`
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

const ProjectsTitle = styled.h1<StyledProps>`
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

const ProjectsSubtitle = styled.p<StyledProps>`
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

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const FilterContainer = styled.div<StyledProps>`
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1rem;
  opacity: 0;
  
  ${({ isVisible }) => isVisible && css`
    animation: ${slideIn} 0.8s ease forwards;
    animation-delay: 0.8s;
  `}
`;

const FilterButton = styled.button<FilterButtonProps>`
  padding: 0.5rem 1.5rem;
  border-radius: 30px;
  background-color: ${({ active }) => (active ? 'var(--accent-color)' : 'transparent')};
  color: ${({ active }) => (active ? 'white' : 'var(--text-color)')};
  border: 2px solid ${({ active }) => (active ? 'var(--accent-color)' : '#ddd')};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${({ active }) => (active ? 'var(--accent-color)' : '#f5f5f5')};
    border-color: ${({ active }) => (active ? 'var(--accent-color)' : '#ccc')};
  }
`;

const ProjectsGrid = styled.div<StyledProps>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  opacity: 0;
  
  ${({ isVisible }) => isVisible && css`
    animation: ${fadeIn} 1s ease forwards;
    animation-delay: 0.8s;
  `}
`;

// Generate random starting positions for cards
const getRandomPosition = (index: number) => {
  // Create different starting positions based on index to ensure variety
  const positions = [
    { x: -100, y: -100, rotate: -10 },  // top-left
    { x: 0, y: -150, rotate: 5 },       // top
    { x: 100, y: -100, rotate: 10 },    // top-right
    { x: -150, y: 0, rotate: -5 },      // left
    { x: 150, y: 0, rotate: 5 },        // right
    { x: -100, y: 100, rotate: -5 },    // bottom-left
    { x: 0, y: 150, rotate: 0 },        // bottom
    { x: 100, y: 100, rotate: 5 },      // bottom-right
  ];
  
  return positions[index % positions.length];
};

// Custom animation for each card based on its random starting position
const floatIn = (x: number, y: number, rotate: number) => keyframes`
  0% {
    transform: translate(${x}px, ${y}px) rotate(${rotate}deg) scale(0.8);
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

const ProjectCard = styled.div<{ isVisible: boolean; index: number; x: number; y: number; rotate: number }>`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  opacity: 0;
  transform: translate(${props => props.x}px, ${props => props.y}px) rotate(${props => props.rotate}deg) scale(0.8);
  display: flex;
  flex-direction: column;
  
  ${({ isVisible, x, y, rotate, index }) => isVisible && css`
    animation: ${floatIn(x, y, rotate)} 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards, 
               ${glow} 3s ease-in-out infinite;
    animation-delay: ${0.2 * index}s, ${1.5 + 0.2 * index}s;
  `}
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

const ProjectImage = styled.div`
  height: 250px;
  overflow: hidden;
  cursor: pointer;
  background-color: #f5f5f5; // Light gray background for empty states
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  ${ProjectCard}:hover & img {
    transform: scale(1.05);
  }
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
`;

const ProjectContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ProjectCategory = styled.span`
  display: inline-block;
  background-color: #f0f0f0;
  color: #666;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-bottom: 1rem;
  margin-right: 0.5rem;
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`;

const StatusDot = styled.span<{ status: 'completed' | 'in-progress' }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ status }) => status === 'completed' ? '#4CAF50' : '#FF9800'};
  margin-right: 6px;
`;

const StatusText = styled.span`
  font-size: 0.75rem;
  color: #777;
  font-weight: 500;
`;

const ProjectTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const ProjectDescription = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  flex-grow: 1; /* Allow description to take available space */
`;

const ProjectLinks = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: auto; /* Push links to bottom of container */
  padding-top: 1rem;
`;

const GitHubLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #333;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--accent-color);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const DemoButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #e1f5fe;
  color: #0288d1;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #b3e5fc;
    transform: translateY(-2px);
  }
`;

const ProjectLink = styled.a`
  color: var(--accent-color);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  
  &:after {
    content: '→';
    margin-left: 0.5rem;
    transition: transform 0.3s ease;
  }
  
  &:hover:after {
    transform: translateX(5px);
  }
`;

const ProjectsPage: React.FC = () => {
  const { t, i18n } = useTranslation('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isCardsVisible, setIsCardsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  usePreserveScroll(i18n);

  useEffect(() => {
    // Set visibility to true immediately on mount
    setIsVisible(true);
    // Start with cards invisible
    setIsCardsVisible(false);
    // Trigger card animations after a short delay
    const timer = setTimeout(() => {
      setIsCardsVisible(true);
    }, 800); // Match the delay with the header animations
    return () => clearTimeout(timer);
  }, []);

  // Fetch projects and project types data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsData, typesData] = await Promise.all([
          getProjects(),
          getProjectTypes()
        ]);
        
        // Sort projects by display_order
        const sortedProjects = [...projectsData].sort((a, b) => a.display_order - b.display_order);
        setProjects(sortedProjects);
        setProjectTypes(typesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle category changes without refreshing the page
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsCardsVisible(false);
    const timer = setTimeout(() => {
      setIsCardsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  };

  // Helper function to get content based on current language
  const getLocalizedContent = (project: Project, field: 'title' | 'description') => {
    const isFrench = i18n.language === 'fr';
    return isFrench ? project[`fr_${field}`] || project[field] : project[field];
  };

  // Helper function to get localized type name
  const getLocalizedType = (typeId: number) => {
    const projectType = projectTypes.find(t => t.type_id === typeId);
    if (!projectType) return '';
    return i18n.language === 'fr' ? projectType.fr_type || projectType.type : projectType.type;
  };

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.type_id === parseInt(selectedCategory));
    
  const handleImageClick = (imageSrc: string, projectId: number) => {
    setSelectedImage(imageSrc);
  };
  
  const closeModal = () => {
    setSelectedImage(null);
  };

  // Helper function to render project image
  const renderProjectImage = (project: Project) => {
    if (!project.image_url) {
      return (
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
      );
    }

    return (
      <img 
        src={project.image_url || ''} 
        alt={getLocalizedContent(project, 'title') || ''}
        onError={(e) => {
          // Remove the error handler to prevent infinite loops
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.style.display = 'none';
          target.parentElement?.querySelector('div')?.style.removeProperty('display');
        }}
      />
    );
  };

  if (loading) {
    return (
      <ProjectsContainer>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </ProjectsContainer>
    );
  }

  if (error) {
    return (
      <ProjectsContainer>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </ProjectsContainer>
    );
  }
  
  return (
    <>
      <ProjectsContainer ref={containerRef}>
        <ProjectsHeader id="projects-header">
          <ProjectsTitle isVisible={isVisible}>
            {t('title', 'Our Projects')}
          </ProjectsTitle>
          <ProjectsSubtitle isVisible={isVisible}>
            {t('subtitle', 'Discover our portfolio of successful digital solutions')}
          </ProjectsSubtitle>
        </ProjectsHeader>
        
        <FilterContainer isVisible={isVisible}>
          <FilterButton 
            active={selectedCategory === 'all'}
            onClick={() => handleCategoryChange('all')}
          >
            {t('filters.all', 'All')}
          </FilterButton>
          {projectTypes.map(type => (
            <FilterButton 
              key={type.type_id} 
              active={selectedCategory === type.type_id.toString()}
              onClick={() => handleCategoryChange(type.type_id.toString())}
            >
              {getLocalizedType(type.type_id)}
            </FilterButton>
          ))}
        </FilterContainer>
        
        <ProjectsGrid id="projects-grid" isVisible={isVisible}>
          {filteredProjects.map((project, index) => {
            const position = getRandomPosition(index);
            return (
              <ProjectCard 
                key={project.project_id} 
                isVisible={isCardsVisible}
                index={index}
                x={position.x}
                y={position.y}
                rotate={position.rotate}
              >
                <ProjectImage onClick={() => project.image_url && handleImageClick(project.image_url, project.project_id)}>
                  {renderProjectImage(project)}
                  <div style={{ display: 'none' }}>
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
                </ProjectImage>
                <ProjectContent>
                  <ProjectCategory>{getLocalizedType(project.type_id)}</ProjectCategory>
                  <ProjectTitle>{getLocalizedContent(project, 'title')}</ProjectTitle>
                  <StatusContainer>
                    <StatusDot status="completed" />
                    <StatusText>
                      {t('status.completed', 'Completed')}
                    </StatusText>
                  </StatusContainer>
                  <ProjectDescription>{getLocalizedContent(project, 'description')}</ProjectDescription>
                  <ProjectLinks>
                    {project.git_url && (
                      <GitHubLink href={project.git_url} target="_blank" rel="noopener noreferrer" title="View on GitHub">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                        </svg>
                        <span>{t('actions.viewOnGitHub', 'View on GitHub')}</span>
                      </GitHubLink>
                    )}
                    {project.demo_url && (
                      <DemoButton href={project.demo_url} target="_blank" rel="noopener noreferrer">
                        {t('actions.demo', 'Live Demo')}
                      </DemoButton>
                    )}
                  </ProjectLinks>
                </ProjectContent>
              </ProjectCard>
            );
          })}
        </ProjectsGrid>
      </ProjectsContainer>
      
      <Modal isOpen={!!selectedImage} onClose={closeModal}>
        <ModalImage 
          src={selectedImage || ''} 
          alt={selectedImage ? `Project ${selectedImage}` : ''} 
        />
      </Modal>
      
      <CallToAction />
    </>
  );
};

export default ProjectsPage; 