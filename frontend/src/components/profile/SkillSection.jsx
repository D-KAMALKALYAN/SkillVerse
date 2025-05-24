// src/components/profile/SkillSection.jsx
import React, { useState, memo, useCallback, useRef, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { MortarboardFill, BookFill, PlusCircleFill } from 'react-bootstrap-icons';
import styled from 'styled-components';
import SkillItem from './SkillItem';
import { breakpoints } from '../../styles/breakpoints';
import useResponsive from '../../hooks/useResponsive';

// Styled Components
const SectionContainer = styled.div`
  position: relative;
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
  max-width: 100%;
  width: 100%;

  &:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 2rem;
  background: ${props => props.gradient};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
    z-index: 1;
  }
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 1.5rem;
  }
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.25rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  
  &:hover {
    transform: translateY(-2px) rotate(5deg);
    background: rgba(255, 255, 255, 0.25);
  }
  
  @media (max-width: ${breakpoints.sm}px) {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }
`;

const Title = styled.h5`
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
  font-size: 1.25rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
  
  @media (max-width: ${breakpoints.sm}px) {
    font-size: 1.1rem;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  margin-bottom: 0;
  position: relative;
  z-index: 2;
  
  @media (max-width: ${breakpoints.sm}px) {
    font-size: 0.85rem;
  }
`;

const SkillsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  
  @media (max-width: ${breakpoints.sm}px) {
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  border-radius: 1rem;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  
  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 1.5rem;
  }
`;

const ContentWrapper = styled.div`
  padding: 2rem;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 1.5rem;
  }
`;

const AddSkillForm = styled.div`
  padding: 2rem;
  border-radius: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  max-width: 100%;
  overflow: hidden;
  
  &:hover {
    background: #f1f5f9;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 1.5rem;
  }
`;

const FormLabel = styled(Form.Label)`
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
`;

const FormGroup = styled(Form.Group)`
  width: 100%;
  max-width: 100%;
  margin-bottom: 1.5rem;
`;

const StyledFormControl = styled(Form.Control)`
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: white;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 100%;
  
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const StyledTextarea = styled(StyledFormControl)`
  min-height: 80px;
  max-height: 120px;
  line-height: 1.5;
  resize: none;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
    
    &:hover {
      background: #94a3b8;
    }
  }
`;

const StyledSelect = styled(Form.Select)`
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: white;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
`;

const AddButton = styled(Button)`
  border-radius: 0.75rem;
  padding: 0.875rem;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  background: ${props => props.gradient};
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px -1px rgba(59, 130, 246, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SuggestionsList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  margin-top: 0.25rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
    
    &:hover {
      background: #94a3b8;
    }
  }
`;

const SuggestionItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8fafc;
  }
  
  &.active {
    background: #f1f5f9;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

// Common skill suggestions (you can replace this with an API call or more comprehensive list)
const commonSkills = [
  'React', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#',
  'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Angular',
  'Vue.js', 'Next.js', 'React Native', 'Flutter', 'Swift', 'Kotlin',
  'HTML', 'CSS', 'SASS', 'Tailwind CSS', 'Bootstrap', 'Material-UI',
  'Redux', 'MobX', 'GraphQL', 'REST API', 'MongoDB', 'PostgreSQL',
  'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
  'Git', 'CI/CD', 'DevOps', 'Agile', 'Scrum', 'UI/UX Design',
  'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'After Effects'
];

const SkillSection = memo(({ 
  type, 
  skills, 
  onAddSkill, 
  onRemoveSkill, 
  headerGradient, 
  iconColor, 
  badgeColor, 
  badgeTextColor,
  buttonGradient
}) => {
  const { isMobile } = useResponsive();
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'Beginner', description: '' });
  const [validation, setValidation] = useState({ error: false, message: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  const handleInputChange = useCallback((field, value) => {
    setNewSkill(prev => ({ ...prev, [field]: value }));
    
    if (field === 'name') {
      if (value.trim() === '') {
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        const filteredSuggestions = commonSkills.filter(skill =>
          skill.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
        setShowSuggestions(true);
      }
      setValidation({ error: false, message: '' });
    }
  }, []);
  
  const handleSuggestionClick = useCallback((suggestion) => {
    setNewSkill(prev => ({ ...prev, name: suggestion }));
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  }, []);
  
  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[activeSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, activeSuggestionIndex, handleSuggestionClick]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleAdd = useCallback(() => {
    if (newSkill.name.trim() === '') {
      setValidation({ error: true, message: 'Skill name is required' });
      return;
    }
    
    onAddSkill(type, newSkill);
    setNewSkill({ name: '', proficiency: 'Beginner', description: '' });
    setValidation({ error: false, message: '' });
    setSuggestions([]);
    setShowSuggestions(false);
  }, [newSkill, onAddSkill, type]);

  const isTeaching = type === 'teach';

  return (
    <SectionContainer>
      <HeaderContainer gradient={headerGradient}>
        <IconWrapper>
          {isTeaching ? (
            <MortarboardFill size={isMobile ? 20 : 24} className="text-white" />
          ) : (
            <BookFill size={isMobile ? 20 : 24} className="text-white" />
          )}
        </IconWrapper>
        <div>
          <Title>
            {isTeaching ? 'Skills I Can Teach' : 'Skills I Want to Learn'}
          </Title>
          <Subtitle>
            {isTeaching ? 'Share your expertise with others' : 'Find mentors to help you learn'}
          </Subtitle>
        </div>
      </HeaderContainer>
      
      <ContentWrapper>
        <SkillsList>
        {skills.length === 0 ? (
            <EmptyState>
            <p className="text-muted mb-0">
                {isTeaching 
                ? "You haven't added any teaching skills yet." 
                : "You haven't added any learning skills yet."}
            </p>
            </EmptyState>
        ) : (
            skills.map((skill) => (
              <SkillItem 
                key={skill._id} 
                skill={skill} 
                type={type} 
                onRemove={onRemoveSkill}
                badgeColor={badgeColor}
                badgeTextColor={badgeTextColor}
              />
            ))
        )}
        </SkillsList>
      
        <AddSkillForm>
          <h6 className="fw-semibold mb-4">Add New {isTeaching ? 'Teaching' : 'Learning'} Skill</h6>
        
        {validation.error && (
            <Alert variant="danger" className="py-2 px-3 mb-3 rounded-lg">
            {validation.message}
          </Alert>
        )}
        
          <FormGroup>
            <FormLabel>Skill Name</FormLabel>
            <InputWrapper ref={inputRef}>
              <StyledFormControl 
            type="text" 
            placeholder="Enter skill name"
            value={newSkill.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <SuggestionsList ref={suggestionsRef}>
                  {suggestions.map((suggestion, index) => (
                    <SuggestionItem
                      key={suggestion}
                      className={index === activeSuggestionIndex ? 'active' : ''}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </SuggestionItem>
                  ))}
                </SuggestionsList>
              )}
            </InputWrapper>
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Proficiency Level</FormLabel>
            <StyledSelect 
            value={newSkill.proficiency}
            onChange={(e) => handleInputChange('proficiency', e.target.value)}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
            </StyledSelect>
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Description (Optional)</FormLabel>
            <StyledTextarea 
            as="textarea" 
              rows={3}
            placeholder="Add a brief description of your experience with this skill"
            value={newSkill.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
          </FormGroup>
        
        <div className="d-grid">
            <AddButton 
            onClick={handleAdd}
              gradient={buttonGradient}
          >
            <PlusCircleFill className="me-2" size={18} />
              <span>Add Skill</span>
            </AddButton>
        </div>
        </AddSkillForm>
      </ContentWrapper>
    </SectionContainer>
  );
});

SkillSection.displayName = 'SkillSection';

export default SkillSection;