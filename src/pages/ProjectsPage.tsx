import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import CallToAction from '../components/CallToAction';
import Modal from '../components/Modal';

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

const ProjectsTitle = styled.h1<{ isVisible: boolean }>`
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

const ProjectsSubtitle = styled.p<{ isVisible: boolean }>`
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

const FilterContainer = styled.div<{ isVisible: boolean }>`
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

const FilterButton = styled.button<{ active: boolean }>`
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

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
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

// GitHub logo SVG component
const GitHubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const ProjectsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [headerVisible, setHeaderVisible] = useState(false);
  const [projectsVisible, setProjectsVisible] = useState(false);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const projectsGridRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };
    
    // Create observers for header and projects grid
    const headerObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHeaderVisible(true);
        headerObserver.disconnect();
      }
    }, observerOptions);
    
    const projectsObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setProjectsVisible(true);
        projectsObserver.disconnect();
      }
    }, observerOptions);
    
    // Observe elements
    if (headerRef.current) {
      headerObserver.observe(headerRef.current);
    }
    
    if (projectsGridRef.current) {
      projectsObserver.observe(projectsGridRef.current);
    }
    
    // Cleanup
    return () => {
      headerObserver.disconnect();
      projectsObserver.disconnect();
    };
  }, []);
  
  const projects = [
    {
      id: 1,
      title: 'Kanban App',
      category: 'web',
      status: 'completed' as const,
      description: 'A free and open source simple kanban board application for quick task management with drag-and-drop functionality, task assignments, and progress tracking.',
      image: '/images/projects/kanban-app.png',
      link: 'https://github.com/DanielAtDrenlia/easy-kanban',
      demoLink: 'https://kanban.demo.drenlia.com/'
    },
    {
      id: 2,
      title: 'Team Scheduler App',
      category: 'web',
      status: 'completed' as const,
      description: 'A free and open source collaborative calendar application that allows teams to schedule work shifts, drag and drop schedules, and more. Effortlessly schedule shifts for your team!',
      image: '/images/projects/calendar-app.png',
      link: 'https://github.com/DanielAtDrenlia/teamcal',
      demoLink: 'https://teamcal.demo.drenlia.com/'
    },
    {
      id: 3,
      title: 'Secure Mail',
      category: 'web',
      status: 'in-progress' as const,
      description: 'An encrypted email platform with advanced security features, ensuring your communications remain private and protected.',
      image: '/images/projects/secure-mail.png',
      link: '#'
    },
    {
      id: 4,
      title: 'ClueCam',
      category: 'mobile',
      status: 'in-progress' as const,
      description: 'A mobile application that uses the camera to locate objects in real-time, perfect for learning and exploring.',
      image: '/images/projects/cluecam.png',
      link: '#'
    }
  ];
  
  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'web', label: 'Web Development' },
    { id: 'mobile', label: 'Mobile Apps' }
  ];
  
  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);
    
  // Generate random positions for each project card
  const cardPositions = Array(projects.length).fill(0).map((_, index) => getRandomPosition(index));
  
  const handleImageClick = (imageSrc: string, title: string) => {
    setSelectedImage(imageSrc);
    setSelectedTitle(title);
  };
  
  const closeModal = () => {
    setSelectedImage(null);
  };
  
  return (
    <>
      <ProjectsContainer>
        <ProjectsHeader ref={headerRef}>
          <ProjectsTitle isVisible={headerVisible}>Our Projects</ProjectsTitle>
          <ProjectsSubtitle isVisible={headerVisible}>
            Explore our portfolio of innovative digital solutions that have helped some 
            of our clients achieve their needs.
          </ProjectsSubtitle>
        </ProjectsHeader>
        
        <FilterContainer isVisible={headerVisible}>
          {filters.map(filter => (
            <FilterButton 
              key={filter.id} 
              active={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </FilterButton>
          ))}
        </FilterContainer>
        
        <ProjectsGrid ref={projectsGridRef}>
          {filteredProjects.map((project, index) => {
            const position = cardPositions[projects.findIndex(p => p.id === project.id)];
            return (
              <ProjectCard 
                key={project.id} 
                isVisible={projectsVisible}
                index={index}
                x={position.x}
                y={position.y}
                rotate={position.rotate}
              >
                <ProjectImage onClick={() => handleImageClick(project.image, project.title)}>
                  <img src={project.image} alt={project.title} />
                </ProjectImage>
                <ProjectContent>
                  <ProjectCategory>{filters.find(f => f.id === project.category)?.label}</ProjectCategory>
                  <ProjectTitle>{project.title}</ProjectTitle>
                  <StatusContainer>
                    <StatusDot status={project.status} />
                    <StatusText>
                      {project.status === 'completed' ? 'Completed' : 'In Progress'}
                    </StatusText>
                  </StatusContainer>
                  <ProjectDescription>{project.description}</ProjectDescription>
                  <ProjectLinks>
                    {project.link && project.link.includes('github') && (
                      <GitHubLink href={project.link} target="_blank" rel="noopener noreferrer" title="View on GitHub">
                        <GitHubIcon />
                      </GitHubLink>
                    )}
                    {project.link && !project.link.includes('github') && project.link !== '#' && (
                      <ProjectLink href={project.link} target="_blank" rel="noopener noreferrer">
                        View Project
                      </ProjectLink>
                    )}
                    {project.demoLink && (
                      <DemoButton href={project.demoLink} target="_blank" rel="noopener noreferrer">
                        Demo
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
        <ModalImage src={selectedImage || ''} alt={selectedTitle} />
      </Modal>
      
      <CallToAction />
    </>
  );
};

export default ProjectsPage; 