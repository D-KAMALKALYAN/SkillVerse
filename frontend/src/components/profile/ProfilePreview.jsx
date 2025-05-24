import React, { memo, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import ProfileCard from './ProfileCard';
import { StarFill } from 'react-bootstrap-icons';
import { breakpoints } from '../../styles/breakpoints';
import useResponsive from '../../hooks/useResponsive';

// Styled Components
const StyledCard = styled(Card)`
  background: #f8fafc;
  border: none;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 2rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  @media (max-width: ${breakpoints.sm}px) {
    margin-bottom: 1.5rem;
    border-radius: 1rem;
  }
`;

const HeaderSection = styled.div`
  position: relative;
  background: linear-gradient(135deg, #0b1437 0%, #1a237e 100%);
  padding: 2rem;
  color: white;
  overflow: hidden;
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 1.5rem;
  }
`;

const DecorativeCircle = styled.div`
  position: absolute;
  border-radius: 50%;
  background: ${props => props.gradient};
  opacity: ${props => props.opacity};
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    opacity: ${props => props.opacity + 0.1};
  }
`;

const TopCircle = styled(DecorativeCircle)`
  top: -20px;
  right: -20px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  
  @media (max-width: ${breakpoints.sm}px) {
    width: 150px;
    height: 150px;
    top: -15px;
    right: -15px;
  }
`;

const BottomCircle = styled(DecorativeCircle)`
  bottom: -40px;
  left: 10%;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(64,115,255,0.2) 0%, rgba(64,115,255,0) 70%);
  
  @media (max-width: ${breakpoints.sm}px) {
    width: 120px;
    height: 120px;
    bottom: -30px;
    left: 5%;
  }
`;

const Title = styled.h3`
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
  font-size: 1.5rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: ${breakpoints.sm}px) {
    font-size: 1.25rem;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0;
  font-size: 0.95rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: ${breakpoints.sm}px) {
    font-size: 0.85rem;
  }
`;

const CardBody = styled(Card.Body)`
  padding: 2rem;
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 1.5rem;
  }
`;

const StarRating = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
  
  .star {
    color: #fbbf24;
    font-size: 0.875rem;
  }
`;

const ProfilePreview = memo(({ profile }) => {
  const { isMobile } = useResponsive();

  // Transform profile data with memoization
  const transformedProfile = useMemo(() => ({
    name: profile.name,
    email: profile.email,
    country: profile.country,
    teachingSkills: profile.teachingSkills ? 
      Array.isArray(profile.teachingSkills) ? 
        profile.teachingSkills.map(skill => ({
          ...skill,
          stars: skill.proficiencyLevel === 'Expert' ? 3 : 
                 skill.proficiencyLevel === 'Intermediate' ? 2 : 1
        })) : 
        Object.keys(profile.teachingSkills).map(skillName => ({
          skillName,
          proficiencyLevel: profile.teachingSkills[skillName],
          stars: profile.teachingSkills[skillName] === 'Expert' ? 3 : 
                 profile.teachingSkills[skillName] === 'Intermediate' ? 2 : 1
        })) : 
      [],
    learningSkills: profile.learningSkills ? 
      Array.isArray(profile.learningSkills) ? 
        profile.learningSkills.map(skill => ({
          ...skill,
          stars: skill.proficiencyLevel === 'Expert' ? 3 : 
                 skill.proficiencyLevel === 'Intermediate' ? 2 : 1
        })) : 
        Object.keys(profile.learningSkills).map(skillName => ({
          skillName,
          proficiencyLevel: profile.learningSkills[skillName],
          stars: profile.learningSkills[skillName] === 'Expert' ? 3 : 
                 profile.learningSkills[skillName] === 'Intermediate' ? 2 : 1
        })) : 
      []
  }), [profile]);

  return (
    <StyledCard>
      <HeaderSection>
        <TopCircle />
        <BottomCircle />
        <Title>Profile Preview</Title>
        <Subtitle>Review how your profile will appear to others</Subtitle>
      </HeaderSection>
      
      <CardBody>
        <ProfileCard profile={transformedProfile} />
      </CardBody>
    </StyledCard>
  );
});

ProfilePreview.displayName = 'ProfilePreview';

export default ProfilePreview;