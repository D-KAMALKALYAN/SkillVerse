// src/components/profile/SkillsManagement.jsx
import React, { memo, useMemo } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import styled from 'styled-components';
import SkillSection from './SkillSection';
import { breakpoints } from '../../styles/breakpoints';
import useResponsive from '../../hooks/useResponsive';

// Styled components for better performance
const StyledCard = styled(Card)`
  background: #f8fafc;
  border: none;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

const CardHeader = styled(Card.Header)`
  background: linear-gradient(135deg, #0b1437 0%, #1a237e 100%);
  color: white;
  border: none;
  padding: 1.5rem;
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 1.25rem;
  }
`;

const HeaderTitle = styled.h4`
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  
  @media (max-width: ${breakpoints.sm}px) {
    font-size: 1.1rem;
  }
`;

const HeaderSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0;
  font-size: 0.9rem;
  
  @media (max-width: ${breakpoints.sm}px) {
    font-size: 0.85rem;
  }
`;

const SectionWrapper = styled.div`
  padding: 1.5rem;
  
  @media (max-width: ${breakpoints.lg}px) {
    padding: 1.25rem;
  }
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 1rem;
  }
`;

const SkillsManagement = memo(({
  teachingSkills,
  learningSkills,
  onAddSkill,
  onRemoveSkill
}) => {
  const { isMobile, isTablet } = useResponsive();

  // Memoize section configurations to prevent unnecessary re-renders
  const sectionConfigs = useMemo(() => ({
    teach: {
      headerGradient: "linear-gradient(135deg, #3b82f6, #1e40af)",
      iconColor: "#3b82f6",
      badgeColor: "rgba(59, 130, 246, 0.1)",
      badgeTextColor: "#3b82f6",
      buttonGradient: "linear-gradient(to right, #3b82f6, #1e40af)"
    },
    learn: {
      headerGradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
      iconColor: "#06b6d4",
      badgeColor: "rgba(6, 182, 212, 0.1)",
      badgeTextColor: "#0891b2",
      buttonGradient: "linear-gradient(to right, #06b6d4, #0891b2)"
    }
  }), []);

  return (
    <StyledCard>
      <CardHeader>
        <HeaderTitle>Manage Your Skills</HeaderTitle>
        <HeaderSubtitle>
          Add or remove skills that you can teach or want to learn
        </HeaderSubtitle>
      </CardHeader>
      
      <Card.Body className="p-0">
        <Row className="g-0">
          {/* Teaching Skills Column */}
          <Col 
            lg={6} 
            className={isTablet ? 'border-bottom' : 'border-end-lg'}
          >
            <SectionWrapper>
              <SkillSection 
                type="teach" 
                skills={teachingSkills} 
                onAddSkill={onAddSkill} 
                onRemoveSkill={onRemoveSkill}
                {...sectionConfigs.teach}
              />
            </SectionWrapper>
          </Col>
          
          {/* Learning Skills Column */}
          <Col lg={6}>
            <SectionWrapper>
              <SkillSection 
                type="learn" 
                skills={learningSkills} 
                onAddSkill={onAddSkill} 
                onRemoveSkill={onRemoveSkill}
                {...sectionConfigs.learn}
              />
            </SectionWrapper>
          </Col>
        </Row>
      </Card.Body>
    </StyledCard>
  );
});

SkillsManagement.displayName = 'SkillsManagement';

export default SkillsManagement;