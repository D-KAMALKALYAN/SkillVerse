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
  Speedometer
} from 'react-bootstrap-icons';
import RequestsList from './learner.requests/RequestsList';
import EmptyState from './learner.requests/EmptyState';
import { fetchLearnerRequests, updateRequestStatus } from '../services/requestService';

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

const LearnerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingIds, setProcessingIds] = useState([]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    <Container fluid className="p-0 min-vh-100 bg-light">
      <div className="mx-auto px-2 px-sm-3 px-md-4 py-4" style={{ maxWidth: 1200 }}>
        {/* Hero/Header Section */}
        <section className="mb-4 rounded-4 shadow-lg bg-gradient position-relative overflow-hidden w-100" style={{ background: 'linear-gradient(135deg, #0b1437 0%, #1e3a8a 100%)', color: '#fff' }}>
          <div className="p-3 p-md-4 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
            <div>
              <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px', fontSize: '2rem' }}>Learning Requests</h2>
              <p className="text-white-50 mb-0 d-none d-sm-block">Manage your learning journey and track your progress</p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Button
                className="rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                style={{ background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)', border: 'none' }}
                onClick={() => navigate('/dashboard')}
                aria-label="Go to dashboard"
              >
                <Speedometer size={16} />
                <span className="d-none d-md-inline">Dashboard</span>
              </Button>
              <Button
                className="rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                style={{ background: 'linear-gradient(90deg, #3b82f6, #1e40af)', border: 'none' }}
                onClick={() => navigate('/profile')}
                aria-label="Go to profile"
              >
                <PencilSquare size={16} />
                <span className="d-none d-md-inline">Profile</span>
              </Button>
              <Button
                className="rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                style={{ background: 'linear-gradient(90deg, #ef4444, #b91c1c)', border: 'none' }}
                onClick={handleLogout}
                aria-label="Logout"
              >
                <BoxArrowLeft size={16} />
                <span className="d-none d-md-inline">Logout</span>
              </Button>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 gap-md-3 px-3 px-md-4 pb-3 pb-md-4">
            <div className="bg-white bg-opacity-10 rounded-pill px-3 py-2 d-flex align-items-center gap-2 shadow-sm">
              <Clock className="text-warning" />
              <span className="fw-semibold">In Progress: {inProgressCount}</span>
            </div>
            <div className="bg-white bg-opacity-10 rounded-pill px-3 py-2 d-flex align-items-center gap-2 shadow-sm">
              <CheckCircleFill className="text-success" />
              <span className="fw-semibold">Completed: {completedCount}</span>
            </div>
          </div>
        </section>

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
      </div>
    </Container>
  );
};

export default LearnerRequests;