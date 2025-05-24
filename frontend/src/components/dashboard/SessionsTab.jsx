import React from 'react';
import { 
  Card, Button, Badge, OverlayTrigger, Tooltip, 
  Container, Row, Col, Spinner
} from 'react-bootstrap';
import { 
  CalendarCheck, 
  PersonFill, 
  ClockFill, 
  CheckCircleFill,
  ChevronRight,
  MortarboardFill,
  BookFill,
  Lightning
} from 'react-bootstrap-icons';
import { isSessionJoinable, getTimeUntilSession } from './dashboardUtils';
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

const SessionCard = styled(Card)`
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
  background: ${props => props.$isJoinable ? 'linear-gradient(90deg, #10b981, #059669)' : '#e5e7eb'};
  border: none;
  box-shadow: ${props => props.$isJoinable ? '0 4px 6px -1px rgba(16, 185, 129, 0.3)' : 'none'};
  color: ${props => props.$isJoinable ? 'white' : '#9ca3af'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$isJoinable ? '0 6px 8px -1px rgba(16, 185, 129, 0.4)' : 'none'};
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

const SessionsTab = ({ sessions, matches, navigate, loading = false }) => {
  // Helper function to get skill name
  const getSkillName = (session) => {
    if (session.skillName) {
      return session.skillName;
    } else if (matches && matches.length > 0) {
      const relatedMatch = matches.find(match => match._id === session.matchId);
      if (relatedMatch && relatedMatch.skillName) {
        return relatedMatch.skillName;
      }
    }
    return 'Skill Session';
  };

  // Get session status with styling info
  const getSessionStatus = (session) => {
    const isJoinable = isSessionJoinable(session.startTime);
    
    if (isJoinable) {
      return { 
        status: 'Ready to Join', 
        variant: 'success',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.2)',
        icon: <CheckCircleFill />
      };
    } else {
      return { 
        status: getTimeUntilSession(session.startTime) + ' remaining', 
        variant: 'warning',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.2)',
        icon: <ClockFill />
      };
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" style={{
            width: '3rem',
            height: '3rem',
            borderWidth: '0.25rem'
          }}>
            <span className="visually-hidden">Loading sessions...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <StyledCard className="mb-4 shadow-lg border-0 rounded-4 overflow-hidden">
      <div style={{ 
        background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)',
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
          background: 'radial-gradient(circle, rgba(64,115,255,0.2) 0%, rgba(64,115,255,0) 70%)',
          borderRadius: '50%'
        }}></div>
        
        <Row className="align-items-center position-relative">
          <Col>
            <div className="d-flex align-items-center">
              <IconCircle className="me-3" $gradient="linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2))">
                <CalendarCheck size={20} className="text-white" />
              </IconCircle>
              <h3 className="mb-0" style={{ fontWeight: '700', letterSpacing: '-0.5px' }}>
                Upcoming Sessions
              </h3>
            </div>
          </Col>
        </Row>
      </div>

      <Card.Body className="p-3 p-md-4">
        {sessions && sessions.length > 0 ? (
          <div className="d-flex flex-column gap-3">
            {sessions.map((session, i) => {
              const sessionStart = new Date(session.startTime);
              const isJoinable = isSessionJoinable(session.startTime);
              const skillName = getSkillName(session);
              const statusInfo = getSessionStatus(session);
              
              return (
                <SessionCard key={i} $isEven={i % 2 === 0}>
                  <Card.Body className="p-0">
                    <Row className="g-0">
                      {/* Status Indicator */}
                      <Col xs="auto">
                        <div 
                          className="d-flex align-items-center justify-content-center h-100"
                          style={{ 
                            width: '10px', 
                            background: statusInfo.color,
                          }}
                        ></div>
                      </Col>
                      
                      {/* Session Details */}
                      <Col>
                        <div className="p-3">
                          <Row className="align-items-center">
                            {/* Left section: Status and Title */}
                            <Col xs={12} md={4} className="mb-3 mb-md-0">
                              <div className="d-flex align-items-center mb-2">
                                <IconCircle className="me-2" $gradient={`linear-gradient(135deg, ${statusInfo.bgColor}, ${statusInfo.borderColor})`}>
                                  {statusInfo.icon}
                                </IconCircle>
                                <StatusBadge 
                                  $bgColor={statusInfo.bgColor}
                                  $color={statusInfo.color}
                                  $borderColor={statusInfo.borderColor}
                                >
                                  {statusInfo.status}
                                </StatusBadge>
                              </div>
                              <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                                {skillName}
                              </h5>
                            </Col>
                            
                            {/* Middle section: Date/Time and Person */}
                            <Col xs={12} md={5} className="mb-3 mb-md-0">
                              <div className="d-flex flex-column flex-md-row">
                                <div className="me-md-4 mb-2 mb-md-0">
                                  <div className="text-muted small mb-1">Date & Time</div>
                                  <div className="d-flex align-items-center">
                                    <CalendarCheck className="me-2" style={{ color: '#3b82f6' }} />
                                    <div>
                                      {sessionStart.toLocaleDateString()} at {sessionStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted small mb-1">Teacher</div>
                                  <div className="d-flex align-items-center">
                                    <PersonFill className="me-2" style={{ color: '#3b82f6' }} />
                                    <div>{session.teacherName}</div>
                                  </div>
                                </div>
                              </div>
                            </Col>
                            
                            {/* Right section: Action */}
                            <Col xs={12} md={3} className="d-flex align-items-center justify-content-between justify-content-md-end">
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-session-action`}>
                                    {isJoinable ? 'Click to join the session' : 'This button will be enabled 5 minutes before the session starts'}
                                  </Tooltip>
                                }
                              >
                                <div>
                                  <ActionButton 
                                    href={session.meetLink || '#'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    disabled={!isJoinable}
                                    $isJoinable={isJoinable}
                                    className="d-flex align-items-center"
                                  >
                                    {isJoinable ? 'Join Now' : 'Join Soon'}
                                    <ChevronRight className="ms-1" size={16} />
                                  </ActionButton>
                                </div>
                              </OverlayTrigger>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </SessionCard>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center bg-info bg-opacity-10" 
              style={{ width: '64px', height: '64px' }}>
              <CalendarCheck className="text-info" size={28} />
            </div>
            <h4 className="fw-bold mb-2">No Sessions Found</h4>
            <p className="text-muted mb-4">You don't have any upcoming sessions scheduled yet.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/match/learning')}
              className="rounded-pill px-4 py-2 d-inline-flex align-items-center"
              style={{ 
                background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
              }}
            >
              <Lightning className="me-2" />
              Find Learning Opportunities
            </Button>
          </div>
        )}
      </Card.Body>
    </StyledCard>
  );
};

export default SessionsTab;