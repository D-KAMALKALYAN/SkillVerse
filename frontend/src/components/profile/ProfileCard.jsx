import React, { memo, useMemo } from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { GeoAltFill, EnvelopeFill, MortarboardFill, BookFill, 
  PeopleFill, StarFill } from 'react-bootstrap-icons';
import styled from 'styled-components';
import { breakpoints } from '../../styles/breakpoints';
import useResponsive from '../../hooks/useResponsive';

// Styled Components
const StyledCard = styled(Card)`
  border: none;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const UserInfoColumn = styled(Col)`
  background: #f8fafc;
  border-right: 1px solid rgba(203, 213, 225, 0.3);
  
  @media (max-width: ${breakpoints.md}px) {
    border-right: none;
    border-bottom: 1px solid rgba(203, 213, 225, 0.3);
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
`;

const Avatar = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color};
  box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.8), 0 0 0 10px rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  @media (max-width: ${breakpoints.sm}px) {
    width: 90px;
    height: 90px;
  }
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(25%, -25%);
  background: #10b981;
  border-radius: 50%;
  padding: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
  border: 2px solid white;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translate(25%, -25%) scale(1.1);
  }
`;

const UserName = styled.h4`
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  
  @media (max-width: ${breakpoints.sm}px) {
    font-size: 1.1rem;
  }
`;

const LocationBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const LocationIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
`;

const SectionTitle = styled.h6`
  text-transform: uppercase;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  font-size: 0.75rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const ContactIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.gradient};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ContactInfo = styled.div`
  .label {
    font-size: 0.75rem;
    color: #64748b;
  }
  .value {
    font-weight: 600;
    color: #1e293b;
  }
`;

const StatusCard = styled(Card)`
  border: none;
  border-radius: 1rem;
  background: linear-gradient(to right, #f0f9ff, #e0f2fe);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const SkillsSection = styled.div`
  margin-bottom: 2rem;
`;

const SkillsHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SkillsIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.gradient};
  box-shadow: 0 10px 15px -3px ${props => props.shadowColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const SkillsTitle = styled.h5`
  font-weight: 700;
  color: ${props => props.color};
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
`;

const SkillsSubtitle = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0;
`;

const SkillsList = styled.div`
  margin-left: 4rem;
  padding-left: 1rem;
  
  @media (max-width: ${breakpoints.sm}px) {
    margin-left: 3rem;
  }
`;

const SkillBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: ${props => props.bgColor};
  color: ${props => props.textColor};
  border: 1px solid ${props => props.borderColor};
  font-size: 0.9rem;
  margin: 0.25rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const StarContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
  padding-left: 0.5rem;
  border-left: 1px solid ${props => props.borderColor};
  
  .star {
    color: ${props => props.starColor};
    margin-right: 0.25rem;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
  
  @media (max-width: ${breakpoints.sm}px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1.5rem;
  
  .stars {
    display: flex;
    margin-right: 0.5rem;
  }
  
  .label {
    font-size: 0.75rem;
    color: #64748b;
  }
`;

const Divider = styled.hr`
  margin: 2rem 0;
  background: rgba(203, 213, 225, 0.5);
  height: 1px;
  border: none;
`;

const MatchCard = styled(Card)`
  border: none;
  border-radius: 1rem;
  background: linear-gradient(to right, #f1f5f9, #f8fafc);
  border-left: 4px solid #3b82f6;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const ProfileCard = memo(({ profile }) => {
  const { isMobile } = useResponsive();

  // Calculate number of skills
  const teachingSkillCount = useMemo(() => 
    profile?.teachingSkills ? profile.teachingSkills.length : 0,
    [profile?.teachingSkills]
  );
  
  const learningSkillCount = useMemo(() => 
    profile?.learningSkills ? profile.learningSkills.length : 0,
    [profile?.learningSkills]
  );
  
  // Generate teaching status based on skill count
  const teachingStatus = useMemo(() => 
    teachingSkillCount > 5 ? 'Expert' : teachingSkillCount > 2 ? 'Intermediate' : 'Beginner',
    [teachingSkillCount]
  );
  
  // Generate learning status based on skill count
  const learningStatus = useMemo(() => 
    learningSkillCount > 5 ? 'Enthusiast' : learningSkillCount > 2 ? 'Active' : 'Exploring',
    [learningSkillCount]
  );

  // Function to get user's initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate avatar color based on name
  const avatarColor = useMemo(() => {
    if (!profile?.name) return 'hsl(210, 70%, 65%)';
    const charCode = profile.name.charCodeAt(0);
    return `hsl(${(charCode * 70) % 360}, 70%, 65%)`;
  }, [profile?.name]);

  // Function to render stars based on proficiency level
  const renderStars = (level) => {
    const count = level === 'Expert' ? 3 : level === 'Intermediate' ? 2 : 1;
    return Array(count).fill(null).map((_, i) => (
      <StarFill key={i} size={10} className="star" />
    ));
  };

  return (
    <StyledCard>
      <Card.Body className="p-0">
        <Row className="g-0">
          {/* Column 1: User Info */}
          <UserInfoColumn md={4}>
            <div className="p-4 h-100 d-flex flex-column">
              {/* User Avatar and Name */}
              <div className="text-center">
                <AvatarContainer>
                  <Avatar color={avatarColor}>
                    <h2 className="mb-0 fw-bold text-white" style={{ fontSize: '2.5rem' }}>
                      {getInitials(profile?.name)}
                    </h2>
                  </Avatar>
                  <StatusBadge>
                    <StarFill className="text-white" size={22} />
                  </StatusBadge>
                </AvatarContainer>
                
                <UserName>{profile?.name || 'User Name'}</UserName>
                
                {/* Location Badge */}
                {profile?.country && (
                  <LocationBadge>
                    <LocationIcon>
                      <GeoAltFill size={12} />
                    </LocationIcon>
                    <span className="text-muted">{profile.country}</span>
                  </LocationBadge>
                )}
              </div>
              
              {/* Contact Information */}
              <div className="mb-4">
                <SectionTitle>Contact Information</SectionTitle>
                
                {/* Email */}
                <ContactItem>
                  <ContactIcon gradient="linear-gradient(135deg, #3b82f6, #1e40af)">
                    <EnvelopeFill size={18} />
                  </ContactIcon>
                  <ContactInfo>
                    <div className="label">Email</div>
                    <div className="value">{profile?.email || 'email@example.com'}</div>
                  </ContactInfo>
                </ContactItem>
                
                {/* Community Status */}
                <ContactItem>
                  <ContactIcon gradient="linear-gradient(135deg, #10b981, #047857)">
                    <PeopleFill size={18} />
                  </ContactIcon>
                  <ContactInfo>
                    <div className="label">Community Status</div>
                    <div className="value">Active Member</div>
                  </ContactInfo>
                </ContactItem>
              </div>
              
              {/* Activity Status Card */}
              <div className="mt-auto">
                <StatusCard>
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center mb-2">
                      <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                        style={{ 
                          width: '28px', 
                          height: '28px', 
                          background: '#0ea5e9',
                          color: 'white'
                        }}>
                        <StarFill size={14} />
                      </div>
                      <h6 className="text-uppercase fw-semibold small mb-0" style={{ color: '#0c4a6e' }}>Profile Status</h6>
                    </div>
                    <p className="small mb-0 text-muted">Your profile is visible to the community. You're ready to connect with study partners!</p>
                  </Card.Body>
                </StatusCard>
              </div>
            </div>
          </UserInfoColumn>
          
          {/* Column 2: Skill Information */}
          <Col md={8}>
            <div className="p-4 h-100 d-flex flex-column">
              {/* Teaching Skills Section */}
              <SkillsSection>
                <SkillsHeader>
                  <SkillsIcon 
                    gradient="linear-gradient(135deg, #3b82f6, #1e40af)"
                    shadowColor="rgba(59, 130, 246, 0.3)"
                  >
                    <MortarboardFill size={22} className="text-white" />
                  </SkillsIcon>
                  <div>
                    <SkillsTitle color="#1e40af">Teaching Skills</SkillsTitle>
                    <SkillsSubtitle>{teachingSkillCount} skills · {teachingStatus}</SkillsSubtitle>
                  </div>
                </SkillsHeader>
                
                {/* Skills List */}
                <SkillsList>
                  <div className="mb-3">
                    <div className="d-flex flex-wrap">
                      {profile?.teachingSkills && profile.teachingSkills.length > 0 ? (
                        profile.teachingSkills.map((skill, index) => (
                          <SkillBadge 
                            key={`teach-${index}`}
                            bgColor="rgba(59, 130, 246, 0.1)"
                            textColor="#3b82f6"
                            borderColor="rgba(59, 130, 246, 0.2)"
                          >
                            {skill.skillName}
                            <StarContainer borderColor="rgba(59, 130, 246, 0.2)" starColor="#3b82f6">
                              {renderStars(skill.proficiencyLevel)}
                            </StarContainer>
                          </SkillBadge>
                        ))
                      ) : (
                        <p className="text-muted fst-italic small">No teaching skills added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Proficiency Legend */}
                  <LegendContainer>
                    <span className="me-3 small text-muted">Proficiency:</span>
                    <div className="d-flex gap-3">
                      <LegendItem>
                        <div className="stars">
                          <StarFill size={10} className="text-primary" />
                        </div>
                        <span className="label">Beginner</span>
                      </LegendItem>
                      <LegendItem>
                        <div className="stars">
                          <StarFill size={10} className="text-primary" />
                          <StarFill size={10} className="text-primary" />
                        </div>
                        <span className="label">Intermediate</span>
                      </LegendItem>
                      <LegendItem>
                        <div className="stars">
                          <StarFill size={10} className="text-primary" />
                          <StarFill size={10} className="text-primary" />
                          <StarFill size={10} className="text-primary" />
                        </div>
                        <span className="label">Expert</span>
                      </LegendItem>
                    </div>
                  </LegendContainer>
                </SkillsList>
              </SkillsSection>
              
              <Divider />
              
              {/* Learning Skills Section */}
              <SkillsSection>
                <SkillsHeader>
                  <SkillsIcon 
                    gradient="linear-gradient(135deg, #06b6d4, #0891b2)"
                    shadowColor="rgba(6, 182, 212, 0.3)"
                  >
                    <BookFill size={22} className="text-white" />
                  </SkillsIcon>
                  <div>
                    <SkillsTitle color="#0891b2">Learning Skills</SkillsTitle>
                    <SkillsSubtitle>{learningSkillCount} skills · {learningStatus}</SkillsSubtitle>
                  </div>
                </SkillsHeader>
                
                {/* Skills List */}
                <SkillsList>
                  <div className="mb-3">
                    <div className="d-flex flex-wrap">
                      {profile?.learningSkills && profile.learningSkills.length > 0 ? (
                        profile.learningSkills.map((skill, index) => (
                          <SkillBadge 
                            key={`learn-${index}`}
                            bgColor="rgba(6, 182, 212, 0.1)"
                            textColor="#0891b2"
                            borderColor="rgba(6, 182, 212, 0.2)"
                          >
                            {skill.skillName}
                            <StarContainer borderColor="rgba(6, 182, 212, 0.2)" starColor="#0891b2">
                              {renderStars(skill.proficiencyLevel)}
                            </StarContainer>
                          </SkillBadge>
                        ))
                      ) : (
                        <p className="text-muted fst-italic small">No learning skills added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Interest Legend */}
                  <LegendContainer>
                    <span className="me-3 small text-muted">Interest Level:</span>
                    <div className="d-flex gap-3">
                      <LegendItem>
                        <div className="stars">
                          <StarFill size={10} className="text-info" />
                        </div>
                        <span className="label">Curious</span>
                      </LegendItem>
                      <LegendItem>
                        <div className="stars">
                          <StarFill size={10} className="text-info" />
                          <StarFill size={10} className="text-info" />
                        </div>
                        <span className="label">Interested</span>
                      </LegendItem>
                      <LegendItem>
                        <div className="stars">
                          <StarFill size={10} className="text-info" />
                          <StarFill size={10} className="text-info" />
                          <StarFill size={10} className="text-info" />
                        </div>
                        <span className="label">Passionate</span>
                      </LegendItem>
                    </div>
                  </LegendContainer>
                </SkillsList>
              </SkillsSection>
              
              {/* Additional Information Card */}
              <div className="mt-auto">
                <MatchCard>
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center mb-1">
                      <h6 className="fw-semibold mb-0">Match Compatibility</h6>
                      <Badge bg="primary" className="ms-2 rounded-pill" style={{ 
                        background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                      }}>High</Badge>
                    </div>
                    <p className="small mb-0 text-muted">
                      Your profile has a balanced mix of teaching and learning skills, increasing your 
                      potential for successful study partnerships.
                    </p>
                  </Card.Body>
                </MatchCard>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </StyledCard>
  );
});

ProfileCard.displayName = 'ProfileCard';

export default ProfileCard;