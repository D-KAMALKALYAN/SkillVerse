import React from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { 
  MortarboardFill, 
  BookFill, 
  PlusCircleFill, 
  ChevronRight,
  StarFill,
  LightningChargeFill
} from 'react-bootstrap-icons';
import styled from 'styled-components';
import { breakpoints } from '../../styles/breakpoints';

// Styled components for better mobile responsiveness
const StyledCard = styled(Card)`
  border-radius: 1rem;
  transition: all 0.3s ease;
  background: ${props => props.$gradient || 'linear-gradient(to right bottom, #ffffff, #f8f9ff)'};
  box-shadow: ${props => props.$isHovered ? '0 15px 30px rgba(0, 123, 255, 0.1)' : '0 5px 15px rgba(0, 0, 0, 0.05)'};
  transform: ${props => props.$isHovered ? 'translateY(-5px)' : 'none'};
  
  @media (max-width: ${breakpoints.sm}px) {
    margin-bottom: 1rem;
  }
`;

const SkillCard = styled(Card)`
  border: none;
  border-radius: 1rem;
  transition: all 0.3s ease;
  background: ${props => props.$isEven ? '#f8f9ff' : '#ffffff'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: ${breakpoints.sm}px) {
    margin-bottom: 1rem;
  }
`;

const StatusBadge = styled(Badge)`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.85rem;
  background: ${props => props.$bgColor || 'rgba(16, 185, 129, 0.1)'};
  color: ${props => props.$color || '#10b981'};
  border: 1px solid ${props => props.$borderColor || 'rgba(16, 185, 129, 0.2)'};
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
`;

const ActionButton = styled(Button)`
  border-radius: 2rem;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: ${props => props.$gradient || 'linear-gradient(90deg, #3b82f6, #1e40af)'};
  border: none;
  box-shadow: ${props => props.$shadow || '0 4px 6px -1px rgba(59, 130, 246, 0.3)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$hoverShadow || '0 6px 8px -1px rgba(59, 130, 246, 0.4)'};
  }
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
  }
`;

const IconCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$gradient || 'linear-gradient(135deg, #e6f0ff, #d1e2ff)'};
  
  @media (max-width: ${breakpoints.sm}px) {
    width: 32px;
    height: 32px;
  }
`;

const SkillsTab = ({ teachingSkills, learningSkills, navigate }) => {
  return (
    <Row className="g-4">
      <Col xs={12} lg={6}>
        <StyledCard className="h-100 mb-4 shadow-lg border-0 rounded-4 overflow-hidden">
          <div style={{ 
            background: 'linear-gradient(135deg, #0b5e41 0%, #10b981 100%)',
            padding: '1.5rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative Elements */}
            <div className="position-absolute" style={{ 
              top: '-20px', 
              right: '-20px', 
              width: '150px', 
              height: '150px', 
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
              borderRadius: '50%'
            }}></div>
            
            <div className="position-absolute" style={{ 
              bottom: '-40px', 
              left: '10%', 
              width: '150px', 
              height: '150px',  
              background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0) 70%)',
              borderRadius: '50%'
            }}></div>
            
            <div className="d-flex justify-content-between align-items-center position-relative">
              <div className="d-flex align-items-center">
                <IconCircle className="me-3" $gradient="linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2))">
                  <MortarboardFill size={20} className="text-white" />
                </IconCircle>
                <h3 className="mb-0" style={{ fontWeight: '700', letterSpacing: '-0.5px' }}>
                  Skills I Can Teach
                </h3>
              </div>
              <ActionButton 
                variant="light" 
                className="d-flex align-items-center rounded-pill"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.85rem',
                  padding: '0.5rem 1rem'
                }}
                onClick={() => navigate('/profile')}
              >
                <PlusCircleFill size={16} className="me-2" />
                Add New
              </ActionButton>
            </div>
          </div>

          <Card.Body className="p-3 p-md-4">
            {teachingSkills && teachingSkills.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {teachingSkills.map((skill, index) => (
                  <SkillCard key={index} $isEven={index % 2 === 0}>
                    <Card.Body className="p-0">
                      <Row className="g-0">
                        {/* Status Indicator */}
                        <Col xs="auto">
                          <div 
                            className="d-flex align-items-center justify-content-center h-100"
                            style={{ 
                              width: '10px', 
                              background: '#10b981',
                            }}
                          ></div>
                        </Col>
                        
                        {/* Skill Details */}
                        <Col>
                          <div className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                                {skill.skillName}
                              </h5>
                              <StatusBadge 
                                $bgColor="rgba(16, 185, 129, 0.1)"
                                $color="#10b981"
                                $borderColor="rgba(16, 185, 129, 0.2)"
                              >
                                Teacher
                              </StatusBadge>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                              <StarFill className="me-2" style={{ color: '#f59e0b' }} />
                              <span className="text-muted">Proficiency: {skill.proficiencyLevel}</span>
                            </div>
                            {skill.description && (
                              <p className="text-muted mb-0 mt-2">{skill.description}</p>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </SkillCard>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                  style={{ 
                    width: '64px', 
                    height: '64px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981'
                  }}>
                  <MortarboardFill size={28} />
                </div>
                <h4 className="fw-bold mb-2">No Teaching Skills</h4>
                <p className="text-muted mb-4">You haven't added any skills that you can teach yet.</p>
                <ActionButton 
                  onClick={() => navigate('/profile')}
                  className="rounded-pill px-4 py-2 d-inline-flex align-items-center"
                  $gradient="linear-gradient(to right, #10b981, #059669)"
                  $shadow="0 4px 6px -1px rgba(16, 185, 129, 0.3)"
                  $hoverShadow="0 6px 8px -1px rgba(16, 185, 129, 0.4)"
                >
                  Add Skills to Teach
                  <ChevronRight className="ms-2" size={16} />
                </ActionButton>
              </div>
            )}
          </Card.Body>
        </StyledCard>
      </Col>

      <Col xs={12} lg={6}>
        <StyledCard className="h-100 mb-4 shadow-lg border-0 rounded-4 overflow-hidden">
          <div style={{ 
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            padding: '1.5rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative Elements */}
            <div className="position-absolute" style={{ 
              top: '-20px', 
              right: '-20px', 
              width: '150px', 
              height: '150px', 
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
              borderRadius: '50%'
            }}></div>
            
            <div className="position-absolute" style={{ 
              bottom: '-40px', 
              left: '10%', 
              width: '150px', 
              height: '150px',  
              background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0) 70%)',
              borderRadius: '50%'
            }}></div>
            
            <div className="d-flex justify-content-between align-items-center position-relative">
              <div className="d-flex align-items-center">
                <IconCircle className="me-3" $gradient="linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2))">
                  <BookFill size={20} className="text-white" />
                </IconCircle>
                <h3 className="mb-0" style={{ fontWeight: '700', letterSpacing: '-0.5px' }}>
                  Skills I Want to Learn
                </h3>
              </div>
              <ActionButton 
                variant="light" 
                className="d-flex align-items-center rounded-pill"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.85rem',
                  padding: '0.5rem 1rem'
                }}
                onClick={() => navigate('/profile')}
              >
                <PlusCircleFill size={16} className="me-2" />
                Add New
              </ActionButton>
            </div>
          </div>

          <Card.Body className="p-3 p-md-4">
            {learningSkills && learningSkills.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {learningSkills.map((skill, index) => (
                  <SkillCard key={index} $isEven={index % 2 === 0}>
                    <Card.Body className="p-0">
                      <Row className="g-0">
                        {/* Status Indicator */}
                        <Col xs="auto">
                          <div 
                            className="d-flex align-items-center justify-content-center h-100"
                            style={{ 
                              width: '10px', 
                              background: '#3b82f6',
                            }}
                          ></div>
                        </Col>
                        
                        {/* Skill Details */}
                        <Col>
                          <div className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                                {skill.skillName}
                              </h5>
                              <StatusBadge 
                                $bgColor="rgba(59, 130, 246, 0.1)"
                                $color="#3b82f6"
                                $borderColor="rgba(59, 130, 246, 0.2)"
                              >
                                Learner
                              </StatusBadge>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                              <LightningChargeFill className="me-2" style={{ color: '#f59e0b' }} />
                              <span className="text-muted">Target Level: {skill.proficiencyLevel}</span>
                            </div>
                            {skill.description && (
                              <p className="text-muted mb-0 mt-2">{skill.description}</p>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </SkillCard>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                  style={{ 
                    width: '64px', 
                    height: '64px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6'
                  }}>
                  <BookFill size={28} />
                </div>
                <h4 className="fw-bold mb-2">No Learning Skills</h4>
                <p className="text-muted mb-4">You haven't added any skills that you want to learn yet.</p>
                <ActionButton 
                  onClick={() => navigate('/profile')}
                  className="rounded-pill px-4 py-2 d-inline-flex align-items-center"
                  $gradient="linear-gradient(to right, #3b82f6, #1e40af)"
                  $shadow="0 4px 6px -1px rgba(59, 130, 246, 0.3)"
                  $hoverShadow="0 6px 8px -1px rgba(59, 130, 246, 0.4)"
                >
                  Add Skills to Learn
                  <ChevronRight className="ms-2" size={16} />
                </ActionButton>
              </div>
            )}
          </Card.Body>
        </StyledCard>
      </Col>
    </Row>
  );
};

export default SkillsTab;