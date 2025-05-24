import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Card, Button, Row, Col, Alert, Spinner, Modal, Badge, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import SessionScheduler from './SessionScheduler';
import NotificationCenter from './NotificationCenter';
import { fetchTeacherRatings } from '../services/reviewService';
import { 
  PeopleFill, Calendar2PlusFill, ChevronDown, StarFill, 
  BookHalf, BarChartFill, CheckCircleFill, ArrowRepeat, Search, 
  BoxArrowRight, PersonCircle, Speedometer, ThreeDotsVertical 
} from 'react-bootstrap-icons';
import styled from 'styled-components';
import { breakpoints } from '../styles/breakpoints';
import apiConfig from '../config/apiConfig';

const BACKEND_URL = apiConfig.BACKEND_URL;

// Styled components for better organization and reusability
const StyledContainer = styled(Container)`
  padding: 1.5rem;
  
  @media (min-width: ${breakpoints.md}px) {
    padding: 2rem;
  }
`;

const HeaderCard = styled(Card)`
  border: none;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  
  .card-body {
    background: linear-gradient(135deg, #0b1437 0%, #1a237e 100%);
    padding: 1.5rem;
    position: relative;
    
    @media (min-width: ${breakpoints.md}px) {
      padding: 2rem;
    }
  }
`;

const DecorativeCircle = styled.div`
  position: absolute;
  background: radial-gradient(circle, ${props => props.$gradient || 'rgba(255,255,255,0.1)'} 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
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

const TeacherCard = styled(Card)`
  border: none;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  background: white;
  margin-bottom: 1rem;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;

const AvatarCircle = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: white;
  background: ${props => props.$color};
  border: 3px solid white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
  margin: 0 auto;
  
  @media (max-width: ${breakpoints.sm}px) {
    width: 70px;
    height: 70px;
    font-size: 28px;
  }
`;

const InfoBadge = styled(Badge)`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.25rem;
  
  @media (max-width: ${breakpoints.sm}px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
`;

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
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-footer {
    border: none;
    padding: 1.25rem;
  }
`;

const LoadingCard = styled(Card)`
  border: none;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
  padding: 3rem 1.5rem;
  margin: 2rem 0;
  
  .spinner-container {
    position: relative;
    display: inline-block;
    margin-bottom: 1.5rem;
  }
  
  .spinner-glow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%);
    border-radius: 50%;
    transform: scale(1.5);
  }
`;

const EmptyStateCard = styled(Card)`
  border: none;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
  padding: 3rem 1.5rem;
  margin: 2rem 0;
  background: #f8fafc;
  
  .icon-container {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }
`;

const MatchingInterface = () => {
  // State management
  const [learningMatches, setLearningMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [teacherStats, setTeacherStats] = useState({});
  const [allSessions, setAllSessions] = useState([]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Memoized color generator for avatars
  const getProfileColor = useCallback((name) => {
    if (!name) return '#6610f2';
    
    const colors = [
      '#0d6efd', '#6f42c1', '#d63384', '#dc3545',
      '#fd7e14', '#198754', '#20c997', '#0dcaf0'
    ];
    
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  }, []);

  // Memoized fetch functions
  const fetchAllSessions = useCallback(async () => {
    if (!user?._id) {
      setAllSessions([]);
      return [];
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/sessions?userId=${user._id}&status=completed`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const { sessions = [] } = await response.json();
      setAllSessions(sessions);
      return sessions;
    } catch (error) {
      console.error('Error fetching all sessions:', error);
      setAllSessions([]);
      return [];
    }
  }, [user]);

  const fetchLearningMatches = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/matches`, {
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });

      if (!response.ok) throw new Error(`Failed to fetch matches: ${response.statusText}`);

      const data = await response.json();
      
      const onlyUnrequestedMatches = data.filter(match => 
        (match.requesterId === user?._id || match.requestorId === user?._id) && 
        (!match.status || ['initial', 'not_requested', 'completed', '', 'canceled'].includes(match.status))
      );
      
      setLearningMatches(onlyUnrequestedMatches);
      await fetchAllSessions();
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError('Failed to fetch learning matches. Please try again.');
      toast.error('Failed to fetch learning matches');
    } finally {
      setLoading(false);
    }
  }, [user, fetchAllSessions]);

  // Memoized teacher stats calculation
  const calculateTeacherStats = useCallback(async () => {
    if (!Array.isArray(learningMatches) || learningMatches.length === 0 || !Array.isArray(allSessions)) {
      return;
    }
    
    const statsPromises = learningMatches.map(async (match) => {
      const teacherId = match.teacherId;
      if (!teacherId) return null;
      
      try {
        const ratings = await fetchTeacherRatings(teacherId);
        const teacherSessions = allSessions.filter(session => 
          session?.teacherId === teacherId && session.status === 'completed'
        );
        
        return {
          teacherId,
          ratings: ratings?.overall || { averageRating: 0, totalReviews: 0 },
          completedSessions: teacherSessions.length
        };
      } catch (error) {
        console.error(`Error calculating stats for teacher ${teacherId}:`, error);
        return {
          teacherId,
          ratings: { averageRating: 0, totalReviews: 0 },
          completedSessions: 0,
          error: true
        };
      }
    });
    
    try {
      const results = await Promise.all(statsPromises);
      const validResults = results.filter(result => result !== null);
      
      const statsObj = validResults.reduce((acc, stat) => {
        if (stat?.teacherId) {
          acc[stat.teacherId] = stat;
        }
        return acc;
      }, {});
      
      setTeacherStats(statsObj);
    } catch (error) {
      console.error("Error calculating teacher stats:", error);
    }
  }, [learningMatches, allSessions]);

  // Effects
  useEffect(() => {
    if (user?._id) {
      fetchLearningMatches();
    }
  }, [fetchLearningMatches, user]);

  useEffect(() => {
    if (Array.isArray(learningMatches) && learningMatches.length > 0 && Array.isArray(allSessions)) {
      calculateTeacherStats();
    }
  }, [calculateTeacherStats, learningMatches, allSessions]);

  // Handlers
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openScheduleModal = (match) => {
    setSelectedTeacher({
      ...match,
      matchId: match.id || match._id,
      teacherId: match.teacherId,
      skillId: match.skillId
    });
    setShowScheduleModal(true);
  };

  const requestMatch = async (matchId, proposedTimeSlots) => {
    try {
      setSubmitting(true);
      
      const response = await fetch(`${BACKEND_URL}/api/matches/${matchId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ 
          status: 'pending',
          proposedTimeSlots
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create session');
      }
  
      await response.json();
      toast.success('Session requested successfully!');
      fetchLearningMatches();
      setShowScheduleModal(false);
    } catch (error) {
      console.error('Session request error:', error);
      toast.error(error.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleSubmit = (timeSlots) => {
    if (selectedTeacher?.matchId) {
      requestMatch(selectedTeacher.matchId, timeSlots);
    } else {
      toast.error('No match selected to create a session');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <StyledContainer fluid>
        <LoadingCard>
          <div className="spinner-container">
            <Spinner 
              animation="border" 
              variant="primary" 
              role="status" 
              style={{ 
                width: '4rem', 
                height: '4rem',
                borderWidth: '0.25rem'
              }} 
            />
            <div className="spinner-glow" />
          </div>
          <h4 className="fw-bold text-primary mb-2">Loading available teachers...</h4>
          <p className="text-muted">Please wait while we find your perfect teachers</p>
        </LoadingCard>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer fluid>
      {/* Header */}
      <HeaderCard>
        <Card.Body>
          <DecorativeCircle 
            style={{ 
              top: '-20px', 
              right: '-20px', 
              width: '200px', 
              height: '200px' 
            }} 
          />
          <DecorativeCircle 
            style={{ 
              bottom: '-40px', 
              left: '10%', 
              width: '180px', 
              height: '180px' 
            }}
            $gradient="rgba(64,115,255,0.2)"
          />

          <Row className="align-items-center position-relative" style={{ zIndex: 2 }}>
            <Col xs={12} md={7} className="mb-3 mb-md-0">
              <h1 className="mb-1 fw-bold fs-3 fs-md-2" style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>
                <PeopleFill className="me-2" />
                Available Skill Sharers
              </h1>
              <p className="text-white-50 mb-0">Find and connect with teachers for your learning journey</p>
            </Col>
            <Col xs={12} md={5} className="d-flex justify-content-md-end">
              <div className="d-flex align-items-center gap-3">
                <NotificationCenter />
                
                {/* Desktop Navigation */}
                <div className="d-none d-md-flex gap-2">
                  <ActionButton 
                    onClick={() => navigate('/dashboard')} 
                    className="d-flex align-items-center gap-2"
                  >
                    <Speedometer /> <span>Dashboard</span>
                  </ActionButton>
                  <ActionButton 
                    onClick={() => navigate('/profile')} 
                    className="d-flex align-items-center gap-2"
                  >
                    <PersonCircle /> <span>Profile</span>
                  </ActionButton>
                  <ActionButton 
                    onClick={handleLogout} 
                    className="d-flex align-items-center gap-2"
                    $gradient="linear-gradient(to right, #ef4444, #b91c1c)"
                    $shadow="0 4px 6px -1px rgba(239, 68, 68, 0.3)"
                    $hoverShadow="0 6px 8px -1px rgba(239, 68, 68, 0.4)"
                  >
                    <BoxArrowRight /> <span>Logout</span>
                  </ActionButton>
                </div>
                
                {/* Mobile Navigation */}
                <div className="d-md-none">
                  <Dropdown>
                    <Dropdown.Toggle 
                      variant="light" 
                      id="nav-dropdown"
                      className="border-0 rounded-pill"
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <ThreeDotsVertical />
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end" className="shadow-lg border-0 rounded-3">
                      <Dropdown.Item onClick={() => navigate('/dashboard')} className="d-flex align-items-center py-2">
                        <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                          style={{ 
                            width: '28px', 
                            height: '28px',
                            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                            color: 'white'
                          }}>
                          <Speedometer size={14} />
                        </div>
                        <span>Dashboard</span>
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => navigate('/profile')} className="d-flex align-items-center py-2">
                        <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                          style={{ 
                            width: '28px', 
                            height: '28px',
                            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                            color: 'white'
                          }}>
                          <PersonCircle size={14} />
                        </div>
                        <span>Profile</span>
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center py-2 text-danger">
                        <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                          style={{ 
                            width: '28px', 
                            height: '28px',
                            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                            color: 'white'
                          }}>
                          <BoxArrowRight size={14} />
                        </div>
                        <span>Logout</span>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </HeaderCard>
      
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible className="d-flex align-items-center rounded-4 shadow-sm">
          <div className="me-3 rounded-circle bg-danger bg-opacity-10 p-2">
            <i className="bi bi-exclamation-triangle-fill text-danger fs-4"></i>
          </div>
          <div className="flex-grow-1">{error}</div>
        </Alert>
      )}

      {/* Title and Refresh */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: '#0f172a' }}>New Matches</h2>
        <ActionButton 
          onClick={fetchLearningMatches} 
          disabled={loading}
          className="d-flex align-items-center gap-2"
        >
          <ArrowRepeat />
          <span className="d-none d-sm-inline">Refresh Matches</span>
        </ActionButton>
      </div>

      {/* Teacher Cards */}
      {learningMatches.length > 0 ? (
        <Row className="g-3">
          {learningMatches.map(match => (
            <Col key={match.id || match._id} xs={12}>
              <TeacherCard>
                <Card.Body className="p-4">
                  <Row className="align-items-center">
                    <Col xs={12} md={2} className="text-center mb-3 mb-md-0">
                      <AvatarCircle $color={getProfileColor(match.name || match.teacherName)}>
                        {(match.name || match.teacherName || "?").charAt(0).toUpperCase()}
                      </AvatarCircle>
                    </Col>
                    <Col xs={12} md={7}>
                      <h3 className="mb-2 fw-bold" style={{ color: '#1e40af' }}>
                        {match.name || match.teacherName || "Unknown"}
                      </h3>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <InfoBadge bg="light" text="dark" className="border">
                          <BookHalf className="text-primary" />
                          <span><strong>Skill:</strong> {match.expertise || match.skillName || "Not specified"}</span>
                        </InfoBadge>
                        <InfoBadge bg="light" text="dark" className="border">
                          <BarChartFill className="text-success" />
                          <span><strong>Level:</strong> {match.proficiency || match.proficiencyLevel || "Fetching..."}</span>
                        </InfoBadge>
                        <InfoBadge bg="light" text="dark" className="border">
                          <StarFill className="text-warning" />
                          <span>
                            <strong>Rating:</strong> {
                              !teacherStats[match.teacherId] ? 
                                <Spinner animation="border" size="sm" className="ms-1" /> :
                              teacherStats[match.teacherId]?.ratings?.totalReviews > 0 ?
                                `${teacherStats[match.teacherId].ratings.averageRating.toFixed(1)}/5 (${teacherStats[match.teacherId].ratings.totalReviews} review${teacherStats[match.teacherId].ratings.totalReviews !== 1 ? 's' : ''})` :
                                "No ratings yet"
                            }
                          </span>
                        </InfoBadge>
                        {teacherStats[match.teacherId]?.completedSessions > 0 && (
                          <InfoBadge bg="success">
                            <CheckCircleFill />
                            <span><strong>Completed Sessions:</strong> {teacherStats[match.teacherId]?.completedSessions}</span>
                          </InfoBadge>
                        )}
                      </div>
                      {match.status === 'completed' && (
                        <Alert variant="success" className="mb-0 mt-2 py-2 d-flex align-items-center">
                          <CheckCircleFill className="me-2" />
                          <span>You've completed sessions with this teacher. Consider booking another one!</span>
                        </Alert>
                      )}
                    </Col>
                    <Col xs={12} md={3} className="d-flex justify-content-md-end mt-4 mt-md-0">
                      <ActionButton 
                        className="w-100 py-2 d-flex align-items-center justify-content-center gap-2" 
                        onClick={() => openScheduleModal(match)}
                      >
                        <Calendar2PlusFill />
                        <span>Request Session</span>
                      </ActionButton>
                    </Col>
                  </Row>
                </Card.Body>
              </TeacherCard>
            </Col>
          ))}
        </Row>
      ) : (
        <EmptyStateCard>
          <div className="icon-container">
            <Search size={40} className="text-primary opacity-75" />
          </div>
          <h3 className="fw-bold mb-3">No new matches found</h3>
          <p className="text-muted mb-4 lead">Try adding more skills you want to learn to find potential teachers!</p>
          <ActionButton 
            size="lg" 
            onClick={() => navigate('/profile')}
          >
            <i className="bi bi-plus-circle-fill me-2"></i> Add Learning Skills
          </ActionButton>
        </EmptyStateCard>
      )}

      {/* Scheduling Modal */}
      <StyledModal 
        show={showScheduleModal} 
        onHide={() => setShowScheduleModal(false)} 
        size="lg" 
        centered 
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <Calendar2PlusFill className="me-2" size={22} />
            <span>
              Schedule with {selectedTeacher?.name || selectedTeacher?.teacherName || "Teacher"} 
              {selectedTeacher?.expertise || selectedTeacher?.skillName ? 
                ` - ${selectedTeacher.expertise || selectedTeacher.skillName}` : ""}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SessionScheduler onSchedule={handleScheduleSubmit} submitting={submitting}/>
        </Modal.Body>
        <Modal.Footer>
          <ActionButton 
            variant="secondary" 
            onClick={() => setShowScheduleModal(false)}
            $gradient="linear-gradient(to right, #64748b, #475569)"
            $shadow="0 4px 6px -1px rgba(100, 116, 139, 0.3)"
            $hoverShadow="0 6px 8px -1px rgba(100, 116, 139, 0.4)"
          >
            <i className="bi bi-x-circle me-2"></i> Cancel
          </ActionButton>
        </Modal.Footer>
      </StyledModal>
    </StyledContainer>
  );
};

export default MatchingInterface;