import React, { useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  PeopleFill, MortarboardFill, BookFill, 
  HouseFill, BoxArrowRight, Clock, CheckCircleFill,
  Lightning, Bell, CalendarCheck, GearFill, Globe
} from 'react-bootstrap-icons';
import styled, { keyframes } from 'styled-components';
import useResponsive from '../../hooks/useResponsive';
import { breakpoints } from '../../styles/breakpoints';

// Custom hooks
import useTeachingRequests from './hooks/useTeachingRequests';
import useModalState from './hooks/useModalState';

// Component imports
import RequestCard from './RequestCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

// Modal imports
import RescheduleModal from './modals/RescheduleModal';
import RejectModal from './modals/RejectModal';
import SessionCreationModal from './modals/SessionCreationModal';
import CompleteSessionModal from './modals/CompleteSessionModal';

// Performance optimized animations
const rotateGlobe = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled components
const PageContainer = styled(Container)`
  min-height: 100vh;
  padding: 0;
  margin: 0;
  max-width: 100%;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  
  @media (min-width: ${breakpoints.sm}px) {
    padding: 1.5rem;
  }
  
  @media (min-width: ${breakpoints.md}px) {
    padding: 2rem;
  }
`;

const HeaderSection = styled.section`
  background: linear-gradient(135deg, #0b1437 0%, #1e3a8a 100%);
  color: #fff;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  position: relative;
  margin-bottom: 1.5rem;
  
  @media (max-width: ${breakpoints.sm}px) {
    border-radius: 0.75rem;
    margin-bottom: 1rem;
  }
`;

const HeaderContent = styled.div`
  padding: ${props => props.$isMobile ? '1rem' : '1.5rem'};
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: ${breakpoints.md}px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
`;

const RevolvingGlobe = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  border-radius: 50%;
  padding: ${props => props.$isMobile ? '8px' : '10px'};
  width: ${props => props.$isMobile ? '32px' : '42px'};
  height: ${props => props.$isMobile ? '32px' : '42px'};
  animation: ${rotateGlobe} 10s linear infinite;
  will-change: transform;
  
  svg {
    color: white;
    height: ${props => props.$isMobile ? '16px' : '22px'};
    width: ${props => props.$isMobile ? '16px' : '22px' }
  }
`;

const EnhancedTitle = styled.div`
  min-width: 0;
  
  h2 {
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-weight: 800;
    font-size: ${props => props.$isMobile ? '1.5rem' : '2rem'};
    margin: 0;
    letter-spacing: -0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  p {
    font-size: ${props => props.$isMobile ? '0.875rem' : '1rem'};
    margin: 0.25rem 0 0;
    opacity: 0.8;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  
  @media (max-width: ${breakpoints.md}px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const ActionButton = styled(Button)`
  border-radius: 999px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: ${breakpoints.md}px) {
    padding: 0.5rem;
    
    span {
      display: none;
    }
  }
`;

const StatsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0 1.5rem 1.5rem;
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 0 1rem 1rem;
  }
`;

const StatCard = styled(Card)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const TeachingRequests = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [feedbackText, setFeedbackText] = React.useState('');
  const { isMobile } = useResponsive();
  
  // Initialize custom hooks
  const {
    requests,
    loading,
    error,
    processing,
    setError,
    loadTeachingRequests,
    handleCreateSession,
    handleReject,
    handleReschedule,
    handleCompleteSession,
  } = useTeachingRequests(user);
  
  const {
    modalState,
    selectedRequest,
    proposedDateTime,
    setProposedDateTime,
    proposedEndTime,
    setProposedEndTime,
    rejectionReason,
    setRejectionReason,
    sessionDetails,
    toggleModal,
    handleSessionDetailsChange,
    handleTimeSlotSelect
  } = useModalState();

  // Calculate statistics
  const stats = useMemo(() => {
    if (!requests) return { pending: 0, scheduled: 0, completed: 0 };
    
    return requests.reduce((acc, req) => {
      if (req.status === 'pending') acc.pending++;
      else if (req.status === 'accepted' || req.status === 'scheduled') acc.scheduled++;
      else if (req.status === 'completed') acc.completed++;
      return acc;
    }, { pending: 0, scheduled: 0, completed: 0 });
  }, [requests]);

  // Format the current date
  const formattedDate = useMemo(() => 
    new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    []
  );
  
  // Modal submit handlers
  const handleRescheduleSubmit = async () => {
    if (!selectedRequest) return;
    
    const success = await handleReschedule(
      selectedRequest, 
      proposedDateTime, 
      proposedEndTime
    );
    
    if (success) {
      toggleModal('reschedule', false);
    }
  };
  
  const handleRejectSubmit = async () => {
    if (!selectedRequest) return;
    
    const success = await handleReject(selectedRequest, rejectionReason);
    
    if (success) {
      toggleModal('reject', false);
    }
  };
  
  const handleSessionCreationSubmit = async () => {
    if (!selectedRequest) return;
    
    const success = await handleCreateSession(selectedRequest, sessionDetails);
    
    if (success) {
      toggleModal('sessionCreation', false);
    }
  };
  
  const handleCompleteSessionSubmit = async () => {
    if (!selectedRequest) return;
    
    const success = await handleCompleteSession(selectedRequest.sessionId, feedbackText);
    
    if (success) {
      toggleModal('completeSession', false);
      setFeedbackText('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Render teaching requests list
  const renderRequests = () => {
    if (loading) {
      return <LoadingSpinner text="Loading teaching requests..." />;
    }
    
    if (error) {
      return (
        <ErrorAlert 
          message={error} 
          onDismiss={() => setError('')}
        />
      );
    }
    
    if (!requests || requests.length === 0) {
      return (
        <div className="text-center py-5">
          <div className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center" 
            style={{ 
              width: '100px', 
              height: '100px', 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(30, 64, 175, 0.1))',
              border: '2px dashed #3b82f6',
            }}>
            <MortarboardFill size={40} className="text-primary" />
          </div>
          <h3 className="fw-bold mb-3">No Teaching Requests Yet</h3>
          <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
            Students haven't requested your teaching expertise yet. Enhance your profile to attract more learners!
          </p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/profile')} 
            className="rounded-pill py-2 px-4 me-3 mb-2 mb-sm-0"
            style={{ 
              background: 'linear-gradient(to right, #3b82f6, #1e40af)',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
            }}>
            <GearFill className="me-2" />
            Update Teaching Profile
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/dashboard')} 
            className="rounded-pill py-2 px-4">
            <HouseFill className="me-2" />
            Return to Dashboard
          </Button>
        </div>
      );
    }
    
    return (
      <Row>
        {requests.map(request => (
          <Col md={6} lg={4} key={request._id || request.id} className="mb-4">
            <RequestCard
              request={request}
              processing={processing}
              toggleModal={toggleModal}
              navigate={navigate}
            />
          </Col>
        ))}
      </Row>
    );
  };
  
  return (
    <PageContainer fluid>
      <ContentWrapper>
        {/* Hero/Header Section */}
        <HeaderSection>
          <HeaderContent $isMobile={isMobile}>
            <TitleSection>
              <RevolvingGlobe $isMobile={isMobile}>
                <Globe />
              </RevolvingGlobe>
              <EnhancedTitle $isMobile={isMobile}>
                <h2>Teaching Requests</h2>
                <p>Share your knowledge and help others learn</p>
              </EnhancedTitle>
            </TitleSection>
            
            <ActionButtons>
              <ActionButton
                onClick={() => navigate('/dashboard')}
                style={{ background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)' }}
              >
                <HouseFill />
                <span>Dashboard</span>
              </ActionButton>
              <ActionButton
                onClick={() => navigate('/match/learning-requests')}
                style={{ background: 'linear-gradient(90deg, #3b82f6, #1e40af)' }}
              >
                <BookFill />
                <span>My Learning</span>
              </ActionButton>
              <ActionButton
                onClick={handleLogout}
                style={{ background: 'linear-gradient(90deg, #ef4444, #b91c1c)' }}
              >
                <BoxArrowRight />
                <span>Logout</span>
              </ActionButton>
            </ActionButtons>
          </HeaderContent>
          
          <StatsSection>
            <Row className="g-3 w-100">
              <Col xs={12} sm={4}>
                <StatCard>
                  <Card.Body className="p-3">
                    <div className="d-flex">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                          boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                        }}>
                        <Bell size={24} className="text-white" />
                      </div>
                      <div>
                        <h6 className="text-uppercase text-white-50 mb-1 small">Pending Requests</h6>
                        <div className="d-flex align-items-center">
                          <h2 className="fw-bold mb-0 text-white">{stats.pending}</h2>
                          <Badge className="ms-2" bg="primary" pill>Waiting</Badge>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </StatCard>
              </Col>
              <Col xs={12} sm={4}>
                <StatCard>
                  <Card.Body className="p-3">
                    <div className="d-flex">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          background: 'linear-gradient(135deg, #10b981, #047857)',
                          boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
                        }}>
                        <CalendarCheck size={24} className="text-white" />
                      </div>
                      <div>
                        <h6 className="text-uppercase text-white-50 mb-1 small">Scheduled Sessions</h6>
                        <div className="d-flex align-items-center">
                          <h2 className="fw-bold mb-0 text-white">{stats.scheduled}</h2>
                          <Badge className="ms-2" bg="success" pill>Upcoming</Badge>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </StatCard>
              </Col>
              <Col xs={12} sm={4}>
                <StatCard>
                  <Card.Body className="p-3">
                    <div className="d-flex">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                          boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)'
                        }}>
                        <CheckCircleFill size={24} className="text-white" />
                      </div>
                      <div>
                        <h6 className="text-uppercase text-white-50 mb-1 small">Completed Sessions</h6>
                        <div className="d-flex align-items-center">
                          <h2 className="fw-bold mb-0 text-white">{stats.completed}</h2>
                          <Badge className="ms-2" bg="secondary" pill>Finished</Badge>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </StatCard>
              </Col>
            </Row>
          </StatsSection>
        </HeaderSection>

        {/* Main Content */}
        <Card className="border-0 rounded-4 shadow-lg overflow-hidden mb-4 w-100">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
              <div className="mb-3 mb-md-0">
                <h2 className="fw-bold mb-1">Manage Requests</h2>
                <p className="text-muted">View and respond to your teaching requests</p>
              </div>
              <div className="d-flex gap-2">
                <Card className="border-0 shadow-sm rounded-4 py-2 px-3" style={{ background: '#f0f9ff' }}>
                  <div className="d-flex align-items-center">
                    <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" 
                      style={{ 
                        width: '36px', 
                        height: '36px', 
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        color: 'white'
                      }}>
                      <Lightning size={18} />
                    </div>
                    <div>
                      <p className="small mb-0 fw-semibold" style={{ color: '#0c4a6e' }}>
                        Quick Tip: Responding within 24 hours increases your teacher rating!
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Request Cards */}
            {renderRequests()}
          </Card.Body>
        </Card>
      </ContentWrapper>

      {/* Modals */}
      <RescheduleModal
        show={modalState.reschedule}
        onHide={() => toggleModal('reschedule', false)}
        proposedDateTime={proposedDateTime}
        setProposedDateTime={setProposedDateTime}
        proposedEndTime={proposedEndTime}
        setProposedEndTime={setProposedEndTime}
        onSubmit={handleRescheduleSubmit}
        processing={processing}
      />
      
      <RejectModal
        show={modalState.reject}
        onHide={() => toggleModal('reject', false)}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onSubmit={handleRejectSubmit}
        processing={processing}
      />
      
      <SessionCreationModal
        show={modalState.sessionCreation}
        onHide={() => toggleModal('sessionCreation', false)}
        sessionDetails={sessionDetails}
        selectedRequest={selectedRequest}
        handleSessionDetailsChange={handleSessionDetailsChange}
        handleTimeSlotSelect={handleTimeSlotSelect}
        onSubmit={handleSessionCreationSubmit}
        processing={processing}
      />
      
      <CompleteSessionModal
        show={modalState.completeSession}
        onHide={() => toggleModal('completeSession', false)}
        onSubmit={handleCompleteSessionSubmit}
        processing={processing}
        feedbackText={feedbackText}
        setFeedbackText={setFeedbackText}
      />
      
      {/* Custom Animations */}
      <style>
        {`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .form-control::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .card {
          transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
        }
        
        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        `}
      </style>
    </PageContainer>
  );
};

export default TeachingRequests;