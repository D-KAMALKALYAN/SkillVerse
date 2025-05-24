import React, { useState } from 'react';
import { 
  Card, Button, Badge, OverlayTrigger, Tooltip, 
  Row, Col, Spinner
} from 'react-bootstrap';
import { 
  People, 
  PersonFill, 
  ClockFill, 
  CheckCircleFill,
  ChevronRight,
  CalendarCheck
} from 'react-bootstrap-icons';
import styled from 'styled-components';
import { breakpoints } from '../../styles/breakpoints';
import MatchDetailsModal from './Modal/MatchDetailsModal';

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

const MatchCard = styled(Card)`
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

const MatchesTab = ({ matches, navigate, loading = false }) => {
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  
  // Function to open modal with selected match
  const openMatchDetails = (match) => {
    setSelectedMatch(match);
    setShowModal(true);
  };
  
  // Function to close modal
  const closeMatchDetails = () => {
    setShowModal(false);
  };
  
  // Function to format date and time in a readable format
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get match status with styling info
  const getMatchStatus = (status) => {
    switch(status) {
      case 'completed':
        return { 
          status: 'Completed', 
          variant: 'success',
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.2)',
          icon: <CheckCircleFill />
        };
      case 'pending':
        return { 
          status: 'Pending', 
          variant: 'warning',
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.2)',
          icon: <ClockFill />
        };
      default:
        return { 
          status: 'Active', 
          variant: 'primary',
          color: '#3b82f6',
          bgColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.2)',
          icon: <PersonFill />
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
            <span className="visually-hidden">Loading matches...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
                  <People size={20} className="text-white" />
                </IconCircle>
                <h3 className="mb-0" style={{ fontWeight: '700', letterSpacing: '-0.5px' }}>
                  Recent Matches
                </h3>
              </div>
            </Col>
          </Row>
        </div>

        <Card.Body className="p-3 p-md-4">
          {matches && matches.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {matches.map((match, i) => {
                const statusInfo = getMatchStatus(match.status);
                
                return (
                  <MatchCard key={i} $isEven={i % 2 === 0}>
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
                        
                        {/* Match Details */}
                        <Col>
                          <div className="p-3">
                            <Row className="align-items-center">
                              {/* Left section: Status and Skill */}
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
                                  {match.skillName}
                                </h5>
                              </Col>
                              
                              {/* Middle section: Teacher and Time Slots */}
                              <Col xs={12} md={5} className="mb-3 mb-md-0">
                                <div className="d-flex flex-column">
                                  <div className="mb-2">
                                    <div className="text-muted small mb-1">Skill Sharer</div>
                                    <div className="d-flex align-items-center">
                                      <PersonFill className="me-2" style={{ color: '#3b82f6' }} />
                                      <div>{match.teacherName}</div>
                                    </div>
                                  </div>
                                  
                                  {match.proposedTimeSlots && match.proposedTimeSlots.length > 0 && (
                                    <div>
                                      <div className="text-muted small mb-1">Proposed Time Slots</div>
                                      <div className="d-flex align-items-center">
                                        <CalendarCheck className="me-2" style={{ color: '#3b82f6' }} />
                                        <div>{formatDateTime(match.proposedTimeSlots[0].startTime)}</div>
                                      </div>
                                      {match.proposedTimeSlots.length > 1 && (
                                        <div className="ms-4 mt-1 text-muted small">
                                          +{match.proposedTimeSlots.length - 1} more time slots
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </Col>
                              
                              {/* Right section: Action */}
                              <Col xs={12} md={3} className="d-flex align-items-center justify-content-between justify-content-md-end">
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id={`tooltip-match-action`}>
                                      View complete match details
                                    </Tooltip>
                                  }
                                >
                                  <div>
                                    <ActionButton 
                                      onClick={() => openMatchDetails(match)}
                                      className="d-flex align-items-center"
                                      $gradient="linear-gradient(to right, #3b82f6, #1e40af)"
                                      $shadow="0 4px 6px -1px rgba(59, 130, 246, 0.3)"
                                      $hoverShadow="0 6px 8px -1px rgba(59, 130, 246, 0.4)"
                                    >
                                      View Details
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
                  </MatchCard>
                );
              })}
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
                <People size={28} />
              </div>
              <h4 className="fw-bold mb-2">No Matches Found</h4>
              <p className="text-muted mb-4">You don't have any recent matches yet.</p>
              <ActionButton 
                onClick={() => navigate('/match/finding')}
                className="rounded-pill px-4 py-2 d-inline-flex align-items-center"
                $gradient="linear-gradient(to right, #3b82f6, #1e40af)"
                $shadow="0 4px 6px -1px rgba(59, 130, 246, 0.3)"
                $hoverShadow="0 6px 8px -1px rgba(59, 130, 246, 0.4)"
              >
                Find New Matches
              </ActionButton>
            </div>
          )}
        </Card.Body>
      </StyledCard>
      
      {/* Modal Component */}
      <MatchDetailsModal 
        show={showModal} 
        handleClose={closeMatchDetails} 
        match={selectedMatch} 
      />
    </>
  );
};

export default MatchesTab;