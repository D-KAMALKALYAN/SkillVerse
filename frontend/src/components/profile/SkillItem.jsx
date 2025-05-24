// src/components/profile/SkillItem.jsx
import React, { memo, useCallback } from 'react';
import { XCircleFill } from 'react-bootstrap-icons';
import styled from 'styled-components';
import { breakpoints } from '../../styles/breakpoints';
import useResponsive from '../../hooks/useResponsive';

const ItemContainer = styled.div`
  position: relative;
  display: inline-block;
  max-width: 100%;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  border-radius: 1rem;
  background: ${props => props.bgColor};
  color: ${props => props.textColor};
  border: 1px solid ${props => `${props.textColor}20`};
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: default;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  }
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
`;

const SkillName = styled.span`
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  @media (max-width: ${breakpoints.sm}px) {
    max-width: 120px;
  }
`;

const ProficiencyBadge = styled.span`
  margin-left: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: ${props => props.bgColor};
  color: ${props => props.textColor};
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  
  @media (max-width: ${breakpoints.sm}px) {
    margin-left: 0.5rem;
    padding: 0.2rem 0.6rem;
    font-size: 0.7rem;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 50%;
  right: 0.375rem;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: ${props => props.textColor};
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  cursor: pointer;
  opacity: 0.7;
  flex-shrink: 0;
  
  &:hover {
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
    background: ${props => `${props.textColor}15`};
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  @media (max-width: ${breakpoints.sm}px) {
    right: 0.25rem;
    padding: 0.2rem;
  }
`;

const SkillItem = memo(({ skill, type, onRemove, badgeColor, badgeTextColor }) => {
  const { isMobile } = useResponsive();

  // Memoize proficiency colors
  const getProficiencyColor = useCallback((level) => {
    switch(level) {
      case 'Expert':
        return { bg: 'rgba(34, 197, 94, 0.15)', text: '#16a34a' };
      case 'Intermediate':
        return { bg: 'rgba(249, 115, 22, 0.15)', text: '#ea580c' };
      case 'Beginner':
        return { bg: 'rgba(99, 102, 241, 0.15)', text: '#4f46e5' };
      default:
        return { bg: badgeColor, text: badgeTextColor };
    }
  }, [badgeColor, badgeTextColor]);

  const profColors = getProficiencyColor(skill.proficiencyLevel);
  
  const handleRemove = useCallback(() => {
    onRemove(type, skill._id);
  }, [onRemove, type, skill._id]);

  return (
    <ItemContainer>
      <Badge bgColor={badgeColor} textColor={badgeTextColor}>
        <SkillName>{skill.skillName}</SkillName>
        <ProficiencyBadge bgColor={profColors.bg} textColor={profColors.text}>
          {skill.proficiencyLevel}
        </ProficiencyBadge>
        
        <RemoveButton 
          onClick={handleRemove}
          textColor={badgeTextColor}
          aria-label={`Remove ${skill.skillName}`}
        >
          <XCircleFill size={isMobile ? 14 : 16} />
        </RemoveButton>
      </Badge>
    </ItemContainer>
  );
});

SkillItem.displayName = 'SkillItem';

export default SkillItem;

// Add this to your CSS or styleSheet for responsiveness
const customStyles = `
  /* Custom CSS for responsiveness */
  @media (max-width: 992px) {
    .border-end-lg {
      border-right: none !important;
      border-bottom: 1px solid #e5e7eb;
    }
  }

  .skill-section .add-skill-form {
    transition: all 0.3s ease;
  }

  .skill-section .add-skill-form:hover {
    background: rgba(241, 245, 249, 0.9) !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
`;