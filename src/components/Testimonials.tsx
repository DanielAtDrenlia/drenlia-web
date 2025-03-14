import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TestimonialsContainer = styled.section`
  padding: 5rem 0;
  background-color: #f1f5f9;
`;

const TestimonialsTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background-color: var(--accent-color);
  }
`;

const TestimonialsWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
`;

const TestimonialSlider = styled.div`
  display: flex;
  overflow: hidden;
  position: relative;
`;

const TestimonialSlide = styled.div<{ active: boolean }>`
  min-width: 100%;
  opacity: ${({ active }) => (active ? '1' : '0')};
  transition: opacity 0.5s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 2rem;
`;

const TestimonialQuote = styled.blockquote`
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  max-width: 800px;
  position: relative;
  
  &:before, &:after {
    content: '"';
    font-size: 4rem;
    color: var(--accent-color);
    opacity: 0.3;
    position: absolute;
  }
  
  &:before {
    top: -2rem;
    left: -2rem;
  }
  
  &:after {
    bottom: -4rem;
    right: -2rem;
    transform: rotate(180deg);
  }
`;

const TestimonialAuthor = styled.div`
  margin-top: 1rem;
`;

const AuthorName = styled.h4`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const AuthorTitle = styled.p`
  color: #666;
  font-style: italic;
`;

const SliderControls = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  gap: 0.5rem;
`;

const SliderDot = styled.button<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ active }) => (active ? 'var(--accent-color)' : '#ccc')};
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${({ active }) => (active ? 'var(--accent-color)' : '#999')};
  }
`;

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const testimonials = [
    {
      quote: "Working with Drenlia was a game-changer for our business. Their team delivered a website that exceeded our expectations and has significantly improved our online presence.",
      name: "Sarah Johnson",
      title: "CEO, TechStart Inc."
    },
    {
      quote: "The mobile app developed by Drenlia has revolutionized how we interact with our customers. The intuitive design and seamless functionality have received overwhelmingly positive feedback.",
      name: "Michael Chen",
      title: "Marketing Director, InnovateCo"
    },
    {
      quote: "Drenlia's cybersecurity solutions have given us peace of mind. Their proactive approach to security has protected our data and saved us from potential breaches.",
      name: "Emily Rodriguez",
      title: "CTO, SecureData Systems"
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);
  
  return (
    <TestimonialsContainer>
      <TestimonialsTitle>What Our Clients Say</TestimonialsTitle>
      <TestimonialsWrapper>
        <TestimonialSlider>
          {testimonials.map((testimonial, index) => (
            <TestimonialSlide key={index} active={index === activeIndex}>
              <TestimonialQuote>{testimonial.quote}</TestimonialQuote>
              <TestimonialAuthor>
                <AuthorName>{testimonial.name}</AuthorName>
                <AuthorTitle>{testimonial.title}</AuthorTitle>
              </TestimonialAuthor>
            </TestimonialSlide>
          ))}
        </TestimonialSlider>
        <SliderControls>
          {testimonials.map((_, index) => (
            <SliderDot 
              key={index} 
              active={index === activeIndex} 
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </SliderControls>
      </TestimonialsWrapper>
    </TestimonialsContainer>
  );
};

export default Testimonials; 