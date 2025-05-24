import React from 'react';
import { Modal, Button, Badge, Row, Col, ListGroup } from 'react-bootstrap';
import { 
  PersonFill, 
  ClockFill, 
  CheckCircleFill,
  XCircleFill,
  CalendarCheck,
  CalendarXFill,
  GeoAltFill,
  ChatDotsFill,
  StarFill,
  ArrowClockwise,
  ExclamationTriangleFill,
  PeopleFill,
  ClockHistory
} from 'react-bootstrap-icons';
import styled from 'styled-components';
import { breakpoints } from '../../../styles/breakpoints';

// Styled components for better mobile responsiveness
const StyledModal = styled(Modal)`
  .modal-content {
    border-radius: 1rem;
    border: none;
    overflow: hidden;
  }
  
  .modal-header {
    background: linear-gradient(135deg, #0b1437 0%, #1a237e 100%);
    color: white;
    border: none;
    padding: 1.25rem;
    
    @media (max-width: ${breakpoints.sm}px) {
      padding: 1rem;
    }
  }
  
  .modal-body {
    padding: 1.5rem;
    
    @media (max-width: ${breakpoints.sm}px) {
      padding: 1rem;
    }
  }
  
  .modal-footer {
    border: none;
    padding: 1.25rem;
    
    @media (max-width: ${breakpoints.sm}px) {
      padding: 1rem;
    }
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

const InfoCard = styled.div`
  padding: 1rem;
  border-radius: 0.75rem;
  background: ${props => props.$bgColor || 'rgba(59, 130, 246, 0.1)'};
  border: 1px solid ${props => props.$borderColor || 'rgba(59, 130, 246, 0.2)'};
  margin-bottom: 1rem;
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 0.75rem;
  }
`;

const TimeSlotCard = styled(InfoCard)`
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
`;

const StatusMessageItem = styled(ListGroup.Item)`
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 0.75rem;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const MatchDetailsModal = ({ show, handleClose, match }) => {
  // Return early if no match data is provided
  if (!match) return null;
  
  // Function to format date and time in a readable format
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculate duration between start and end time in minutes
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return null;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    return Math.round(durationMs / (1000 * 60));
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
          status: 'Pending Approval', 
          variant: 'warning',
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.2)',
          icon: <ClockFill />
        };
      case 'accepted':
        return { 
          status: 'Accepted', 
          variant: 'primary',
          color: '#3b82f6',
          bgColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.2)',
          icon: <CheckCircleFill />
        };
      case 'rejected':
        return { 
          status: 'Rejected', 
          variant: 'danger',
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.2)',
          icon: <XCircleFill />
        };
      case 'rescheduled':
        return { 
          status: 'Rescheduled', 
          variant: 'info',
          color: '#06b6d4',
          bgColor: 'rgba(6, 182, 212, 0.1)',
          borderColor: 'rgba(6, 182, 212, 0.2)',
          icon: <ArrowClockwise />
        };
      case 'canceled':
        return { 
          status: 'Canceled', 
          variant: 'secondary',
          color: '#64748b',
          bgColor: 'rgba(100, 116, 139, 0.1)',
          borderColor: 'rgba(100, 116, 139, 0.2)',
          icon: <CalendarXFill />
        };
      case 'not_requested':
        return { 
          status: 'Not Requested', 
          variant: 'light',
          color: '#64748b',
          bgColor: 'rgba(100, 116, 139, 0.1)',
          borderColor: 'rgba(100, 116, 139, 0.2)',
          icon: <ExclamationTriangleFill />
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

  const statusInfo = getMatchStatus(match.status);

  // Get the latest proposed time slots
  const getLatestTimeSlots = () => {
    if (match.timeSlotHistory && match.timeSlotHistory.length > 0) {
      // Return the most recent time slot history
      const latestHistory = [...match.timeSlotHistory].sort((a, b) => 
        new Date(b.proposedAt) - new Date(a.proposedAt)
      )[0];
      
      return latestHistory.slots;
    }
    
    return match.proposedTimeSlots || [];
  };

  // Get formatted status messages
  const getStatusMessages = () => {
    if (!match.statusMessages || match.statusMessages.length === 0) {
      return [];
    }
    
    return [...match.statusMessages].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  };
  
  // Determine if there's an active session
  const hasActiveSession = match.currentSessionId != null;
  
  // Determine if there are previous sessions
  const hasPreviousSessions = match.previousSessionIds && match.previousSessionIds.length > 0;

  return (
    <StyledModal 
      show={show} 
      onHide={handleClose} 
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title className="fs-5 fw-bold">Match Details</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          {/* Status Badge */}
          <div className="d-flex align-items-center mb-3 mb-md-0">
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
          
          {/* Created/Updated date info */}
          <div className="d-flex align-items-center">
            <ClockHistory size={14} className="text-muted me-1" />
            <small className="text-muted">
              Created: {new Date(match.createdAt).toLocaleDateString()} 
              {match.updatedAt && match.updatedAt !== match.createdAt && 
                ` • Updated: ${new Date(match.updatedAt).toLocaleDateString()}`
              }
            </small>
          </div>
        </div>

        {/* Skill Name */}
        <h3 className="fw-bold mb-4" style={{ color: '#0f172a' }}>
          {match.skillName}
        </h3>

        <Row className="g-4">
          {/* Left Column */}
          <Col lg={6}>
            {/* Requester Info */}
            <div className="mb-4">
              <h5 className="text-muted mb-3 fw-bold">Requester</h5>
              <div className="d-flex align-items-center">
                <IconCircle className="me-3" $gradient="linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(6, 182, 212, 0.2))">
                  <PersonFill size={24} style={{ color: '#06b6d4' }} />
                </IconCircle>
                <div>
                  <h6 className="mb-0 fw-bold">{match.requesterName}</h6>
                  <p className="mb-0 text-muted small">ID: {String(match.requesterId).substring(0, 8)}...</p>
                </div>
              </div>
            </div>

            {/* Teacher Info */}
            <div className="mb-4">
              <h5 className="text-muted mb-3 fw-bold">Skill Sharer</h5>
              <div className="d-flex align-items-center">
                <IconCircle className="me-3" $gradient="linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.2))">
                  <PersonFill size={24} style={{ color: '#3b82f6' }} />
                </IconCircle>
                <div>
                  <h6 className="mb-0 fw-bold">{match.teacherName}</h6>
                  <p className="mb-0 text-muted small">ID: {String(match.teacherId).substring(0, 8)}...</p>
                </div>
              </div>
            </div>
            
            {/* Previous Match Status */}
            {match.previouslyMatched && (
              <InfoCard $bgColor="rgba(59, 130, 246, 0.1)" $borderColor="rgba(59, 130, 246, 0.2)">
                <div className="d-flex align-items-center">
                  <PeopleFill className="text-primary me-2" />
                  <div>
                    <p className="mb-0 fw-bold">Previously Matched</p>
                    {hasPreviousSessions && (
                      <p className="mb-0 small text-muted">
                        {match.previousSessionIds.length} previous session{match.previousSessionIds.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </InfoCard>
            )}

            {/* Rejection Reason (if applicable) */}
            {match.status === 'rejected' && match.rejectionReason && (
              <InfoCard $bgColor="rgba(239, 68, 68, 0.1)" $borderColor="rgba(239, 68, 68, 0.2)">
                <h5 className="text-danger mb-2 d-flex align-items-center">
                  <XCircleFill className="me-2" />
                  Rejection Reason
                </h5>
                <p className="mb-0">{match.rejectionReason}</p>
              </InfoCard>
            )}
          </Col>

          {/* Right Column */}
          <Col lg={6}>
            {/* Selected Time Slot (if any) */}
            {match.selectedTimeSlot && (
              <div className="mb-4">
                <h5 className="text-muted mb-3 fw-bold">
                  Scheduled Time
                </h5>
                <TimeSlotCard $bgColor="rgba(16, 185, 129, 0.1)" $borderColor="rgba(16, 185, 129, 0.2)">
                  <div className="d-flex align-items-center mb-2">
                    <CalendarCheck className="me-2 text-success" />
                    <span className="fw-bold">Selected Time Slot</span>
                  </div>

                  <div className="ps-4 mb-2">
                    <div>
                      <strong>Start:</strong> {formatDateTime(match.selectedTimeSlot.startTime)}
                    </div>
                    <div>
                      <strong>End:</strong> {formatDateTime(match.selectedTimeSlot.endTime)}
                    </div>
                    <div>
                      <strong>Duration:</strong> {calculateDuration(match.selectedTimeSlot.startTime, match.selectedTimeSlot.endTime)} minutes
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center mt-2 ps-4">
                    <small className="text-muted">
                      Selected by: {match.selectedTimeSlot.selectedBy === match.requesterId ? match.requesterName : match.teacherName}
                      {match.selectedTimeSlot.selectedAt && 
                        ` on ${new Date(match.selectedTimeSlot.selectedAt).toLocaleDateString()}`}
                    </small>
                  </div>
                </TimeSlotCard>
              </div>
            )}

            {/* Proposed Time Slots */}
            {!match.selectedTimeSlot && match.proposedTimeSlots && match.proposedTimeSlots.length > 0 && (
              <div className="mb-4">
                <h5 className="text-muted mb-3 fw-bold">
                  Proposed Time Slots
                </h5>
                
                {match.proposedTimeSlots.map((slot, index) => (
                  <TimeSlotCard key={index} $bgColor="rgba(59, 130, 246, 0.1)" $borderColor="rgba(59, 130, 246, 0.2)">
                    <div className="d-flex align-items-start">
                      <CalendarCheck className="me-2 text-primary mt-1" />
                      <div>
                        <div className="fw-bold mb-1">Option {index + 1}</div>
                        <div className="mb-1">
                          <strong>Start:</strong> {formatDateTime(slot.startTime)}
                        </div>
                        <div className="mb-1">
                          <strong>End:</strong> {formatDateTime(slot.endTime)}
                        </div>
                        <div className="mb-1">
                          <strong>Duration:</strong> {calculateDuration(slot.startTime, slot.endTime)} minutes
                        </div>
                        <small className="text-muted">
                          Proposed by: {slot.proposedBy === match.requesterId ? match.requesterName : match.teacherName}
                        </small>
                      </div>
                    </div>
                  </TimeSlotCard>
                ))}
              </div>
            )}
          </Col>
        </Row>

        {/* Status Messages (if available) */}
        {match.statusMessages && match.statusMessages.length > 0 && (
          <div className="mt-4">
            <h5 className="text-muted mb-3 fw-bold">Status Updates</h5>
            <ListGroup variant="flush" className="border rounded-3">
              {getStatusMessages().map((statusMsg, index) => (
                <StatusMessageItem key={index}>
                  <div className="d-flex align-items-center mb-1">
                    <ChatDotsFill className="text-primary me-2" size={14} />
                    <strong className="me-2">
                      {statusMsg.userId === match.requesterId ? match.requesterName : 
                       statusMsg.userId === match.teacherId ? match.teacherName : 'System'}
                    </strong>
                    <small className="text-muted ms-auto">
                      {new Date(statusMsg.timestamp).toLocaleString()}
                    </small>
                  </div>
                  <p className="mb-0 ps-4">{statusMsg.message}</p>
                </StatusMessageItem>
              ))}
            </ListGroup>
          </div>
        )}

        {/* Current Session Info (if any) */}
        {hasActiveSession && (
          <InfoCard $bgColor="rgba(16, 185, 129, 0.1)" $borderColor="rgba(16, 185, 129, 0.2)">
            <div className="d-flex align-items-center mb-2">
              <CheckCircleFill className="text-success me-2" />
              <h5 className="mb-0 fw-bold">Active Session</h5>
            </div>
            <p className="mb-0 ps-4">
              Session ID: {String(match.currentSessionId).substring(0, 8)}...
            </p>
          </InfoCard>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <div className="d-flex flex-column flex-sm-row w-100 gap-2">
          <ActionButton 
            variant="secondary" 
            onClick={handleClose}
            className="order-2 order-sm-1"
            $gradient="linear-gradient(to right, #64748b, #475569)"
            $shadow="0 4px 6px -1px rgba(100, 116, 139, 0.3)"
            $hoverShadow="0 6px 8px -1px rgba(100, 116, 139, 0.4)"
          >
            Close
          </ActionButton>
          
          <div className="d-flex flex-column flex-sm-row gap-2 ms-auto order-1 order-sm-2">
            {match.status === 'pending' && (
              <>
                <ActionButton 
                  variant="danger" 
                  $gradient="linear-gradient(to right, #ef4444, #dc2626)"
                  $shadow="0 4px 6px -1px rgba(239, 68, 68, 0.3)"
                  $hoverShadow="0 6px 8px -1px rgba(239, 68, 68, 0.4)"
                >
                  Reject
                </ActionButton>
                <ActionButton 
                  $gradient="linear-gradient(to right, #3b82f6, #1e40af)"
                  $shadow="0 4px 6px -1px rgba(59, 130, 246, 0.3)"
                  $hoverShadow="0 6px 8px -1px rgba(59, 130, 246, 0.4)"
                >
                  Accept Match
                </ActionButton>
              </>
            )}
            
            {match.status === 'accepted' && !hasActiveSession && (
              <ActionButton 
                $gradient="linear-gradient(to right, #10b981, #059669)"
                $shadow="0 4px 6px -1px rgba(16, 185, 129, 0.3)"
                $hoverShadow="0 6px 8px -1px rgba(16, 185, 129, 0.4)"
              >
                Start Session
              </ActionButton>
            )}
            
            {(match.status === 'accepted' || match.status === 'rescheduled') && (
              <ActionButton 
                $gradient="linear-gradient(to right, #f59e0b, #d97706)"
                $shadow="0 4px 6px -1px rgba(245, 158, 11, 0.3)"
                $hoverShadow="0 6px 8px -1px rgba(245, 158, 11, 0.4)"
              >
                Reschedule
              </ActionButton>
            )}
            
            {match.status !== 'completed' && match.status !== 'canceled' && match.status !== 'rejected' && (
              <ActionButton 
                variant="outline-danger" 
                $gradient="linear-gradient(to right, #ef4444, #dc2626)"
                $shadow="0 4px 6px -1px rgba(239, 68, 68, 0.3)"
                $hoverShadow="0 6px 8px -1px rgba(239, 68, 68, 0.4)"
              >
                Cancel Match
              </ActionButton>
            )}
          </div>
        </div>
      </Modal.Footer>
    </StyledModal>
  );
};

export default MatchDetailsModal;