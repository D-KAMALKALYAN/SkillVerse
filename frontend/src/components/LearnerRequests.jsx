// LearnerRequests.js - Main component
import React, { useState, useEffect, useCallback, Suspense, memo } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  ArrowRepeat, 
  ExclamationTriangleFill, 
  CheckCircleFill, 
  BoxArrowLeft, 
  Clock,
  PencilSquare,
  Speedometer,
  Globe
} from 'react-bootstrap-icons';
import styled, { keyframes } from 'styled-components';
import useResponsive from '../hooks/useResponsive';
import { breakpoints } from '../styles/breakpoints';
import RequestsList from './learner.requests/RequestsList';
import EmptyState from './learner.requests/EmptyState';
import { fetchLearnerRequests, updateRequestStatus } from '../services/requestService';

// Performance optimized animations
const rotateGlobe = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled components
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

const StatBadge = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Memoized loading state for performance
const LoadingState = memo(() => (
  <div className="text-center py-5 w-100">
    <div className="d-inline-block mb-3 position-relative" style={{ width: 64, height: 64 }}>
      <Spinner animation="border" variant="primary" role="status" style={{ width: 64, height: 64, borderWidth: 6 }} />
      <span className="visually-hidden">Loading...</span>
    </div>
    <h5 className="mt-3 fw-bold text-primary">Loading your learning requests...</h5>
    <p className="text-muted mb-0">Please wait while we fetch your data</p>
  </div>
));

// Add these styled components at the top with other styled components
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

const LearnerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingIds, setProcessingIds] = useState([]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const learnerRequests = await fetchLearnerRequests(user._id);
      setRequests(learnerRequests);
    } catch (err) {
      setError('Failed to fetch learning requests. Please try again.');
      toast.error('Failed to fetch learning requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Logout handler
  const handleLogout = useCallback(() => {
    if (typeof logout === 'function') {
      logout();
      navigate('/', { replace: true });
    } else {
      toast.error('Logout functionality is not available');
    }
  }, [logout, navigate]);

  // Status update handler
  const handleStatusUpdate = useCallback(async (requestId, newStatus, reason = null) => {
    setProcessingIds(prev => [...prev, requestId]);
    try {
      const response = await updateRequestStatus(requestId, newStatus, reason);
      if (response.success) {
        toast.success(`Request ${newStatus} successfully!`);
        setRequests(prev => prev.map(req =>
          req._id === requestId || req.id === requestId
            ? { ...req, status: newStatus, ...(reason && { rejectionReason: reason }) }
            : req
        ));
      } else {
        toast.error(response.message || 'Failed to update request status');
      }
    } catch (err) {
      toast.error('Error updating request status. Please try again.');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  }, []);

  // Load data on mount and poll
  useEffect(() => {
    if (user && user._id) fetchRequests();
    const intervalId = setInterval(fetchRequests, 60000);
    return () => clearInterval(intervalId);
  }, [fetchRequests, user]);

  // Dismiss error
  const dismissError = useCallback(() => setError(''), []);

  // Responsive stats
  const inProgressCount = requests.filter(r => r.status === 'pending' || r.status === 'approved').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

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
                <h2>Learning Requests</h2>
                <p>Manage your learning journey and track your progress</p>
              </EnhancedTitle>
            </TitleSection>
            
            <ActionButtons>
              <ActionButton
                onClick={() => navigate('/dashboard')}
                style={{ background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)' }}
              >
                <Speedometer />
                <span>Dashboard</span>
              </ActionButton>
              <ActionButton
                onClick={() => navigate('/profile')}
                style={{ background: 'linear-gradient(90deg, #3b82f6, #1e40af)' }}
              >
                <PencilSquare />
                <span>Profile</span>
              </ActionButton>
              <ActionButton
                onClick={handleLogout}
                style={{ background: 'linear-gradient(90deg, #ef4444, #b91c1c)' }}
              >
                <BoxArrowLeft />
                <span>Logout</span>
              </ActionButton>
            </ActionButtons>
          </HeaderContent>
          
          <StatsSection>
            <StatBadge>
              <Clock className="text-warning" />
              <span>In Progress: {inProgressCount}</span>
            </StatBadge>
            <StatBadge>
              <CheckCircleFill className="text-success" />
              <span>Completed: {completedCount}</span>
            </StatBadge>
          </StatsSection>
        </HeaderSection>

        {/* Error Alert */}
        {error && (
          <Alert 
            variant="danger" 
            onClose={dismissError} 
            dismissible
            className="shadow-sm rounded-4 border-0 d-flex align-items-center w-100 mb-3"
            style={{ background: 'linear-gradient(to right, #fee2e2, #fecaca)', borderLeft: '4px solid #ef4444' }}
          >
            <ExclamationTriangleFill size={20} className="me-3 text-danger" />
            <div>
              <p className="mb-0 fw-semibold text-danger">{error}</p>
            </div>
          </Alert>
        )}

        {/* Main Card */}
        <Card className="border-0 rounded-4 shadow-lg overflow-hidden mb-4 w-100">
          <Card.Body className="p-0">
            <div className="p-3 p-md-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h3 className="mb-0 fw-bold" style={{ color: '#0f172a', fontSize: '1.5rem' }}>Your Learning Requests</h3>
                <p className="text-muted mb-0">View and manage all your learning requests</p>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <Button 
                  variant="primary" 
                  onClick={fetchRequests} 
                  disabled={loading} 
                  className="rounded-pill py-2 px-3 d-flex align-items-center gap-2 fw-semibold"
                  style={{ background: 'linear-gradient(90deg, #3b82f6, #1e40af)', border: 'none' }}
                  aria-label="Refresh requests"
                >
                  <ArrowRepeat size={18} />
                  <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
                <Button 
                  variant="success" 
                  onClick={() => navigate('/match/learning')} 
                  className="rounded-pill py-2 px-3 d-flex align-items-center gap-2 fw-semibold"
                  style={{ background: 'linear-gradient(90deg, #10b981, #047857)', border: 'none' }}
                  aria-label="New learning request"
                >
                  <i className="bi bi-plus-lg"></i>
                  <span>New Request</span>
                </Button>
              </div>
            </div>
            <div className="px-3 px-md-4 pb-4">
              {loading ? (
                <LoadingState />
              ) : requests.length > 0 ? (
                <Suspense fallback={<LoadingState />}>
                  <RequestsList 
                    requests={requests} 
                    navigate={navigate} 
                    handleStatusUpdate={handleStatusUpdate}
                    processingIds={processingIds}
                  />
                </Suspense>
              ) : (
                <EmptyState 
                  navigate={navigate} 
                  actionPath="/match/learning" 
                  actionText="Find Learning Matches"
                />
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Responsive/Modern CSS */}
        <style>{`
          @media (max-width: 576px) {
            .rounded-4 { border-radius: 1rem !important; }
            .p-md-4 { padding: 1.25rem !important; }
            .px-md-4 { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
            .pb-md-4 { padding-bottom: 1.25rem !important; }
            h2, h3 { font-size: 1.25rem !important; }
          }
          @media (max-width: 400px) {
            .rounded-4 { border-radius: 0.75rem !important; }
            .p-md-4, .px-md-4, .pb-md-4 { padding: 0.75rem !important; }
          }
          .bg-gradient {
            background: linear-gradient(135deg, #0b1437 0%, #1e3a8a 100%) !important;
          }
          .rounded-pill { border-radius: 999px !important; }
          .fw-semibold { font-weight: 600 !important; }
        `}</style>
      </ContentWrapper>
    </PageContainer>
  );
};

export default LearnerRequests;