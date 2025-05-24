import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Container, Card, Button, Spinner, Nav, Alert } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import apiConfig from '../config/apiConfig';
import apiClient from '../config/apiClient';

// Import subcomponents
import DashboardHeader from './dashboard/DashboardHeader';
import UserWelcomeCard from './dashboard/UserWelcomeCard';
import OverviewTab from './dashboard/OverviewTab';
import SessionsTab from './dashboard/SessionsTab';
import MatchesTab from './dashboard/MatchesTab';
import SkillsTab from './dashboard/SkillsTab';
import { fetchUserProfile, fetchCompletedSessionsCount } from './dashboard/dashboardUtils';

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
const BACKEND_URL = apiConfig.BACKEND_URL;

console.log('Backend URL:', BACKEND_URL);
console.log('API URL:', apiConfig.API_URL);

// Enhanced styled components with better responsive design
const FullScreenContainer = styled(Container)`
  min-height: 100vh;
  padding: 0;
  margin: 0;
  max-width: 100%;
  background-color: #f8f9fa;
`;

const DashboardContent = styled.div`
  padding: 1rem;
  width: 100%;
  margin: 0 auto;
  transition: all 0.3s ease;
  
  @media (min-width: 576px) {
    padding: 1.5rem;
  }
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
  
  @media (min-width: 992px) {
    padding: 2.5rem;
    max-width: 1400px;
  }
  
  @media (min-width: 1200px) {
    padding: 3rem;
    max-width: 1600px;
  }
  
  @media (min-width: 1400px) {
    max-width: 1800px;
  }
`;

const TabNavigation = styled(Nav)`
  border-bottom: 1px solid #dee2e6;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  margin-bottom: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  .nav-link {
    white-space: nowrap;
    font-weight: 600;
    padding: 1rem 1.25rem;
    color: #6c757d;
    border: none;
    transition: all 0.2s ease;
    
    @media (max-width: 576px) {
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
    }
    
    &.active {
      color: #0d6efd;
      border-bottom: 3px solid #0d6efd;
      background-color: transparent;
    }
    
    &:hover:not(.active) {
      color: #0d6efd;
      border-bottom: 3px solid #e9ecef;
    }
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, transparent, #0d6efd, transparent);
  animation: progress 1.5s infinite;
  z-index: 1100;
  
  @keyframes progress {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ErrorAlert = styled(Alert)`
  margin: 1rem 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: none;
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f8f9fa;
  
  .spinner {
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
  }
  
  h4 {
    color: #0d6efd;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6c757d;
  }
`;

const Dashboard = () => {
  // State management with proper initialization
  const [stats, setStats] = useState({
    points: 0,
    sessionsCompleted: 0,
    streak: 0,
    upcomingSessions: [],
    recentMatches: [],
    teachingSkills: [],
    learningSkills: [],
    userRank: null,
    leaderboard: []
  });
  
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const refreshTimeoutRef = useRef(null);

  // Memoized handlers and callbacks
  const handleChildUpdate = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      triggerRefresh();
    }, 300);
  }, []);

  const triggerRefresh = useCallback(async () => {
    setRefreshTrigger(prev => prev + 1);
    
    if (user?._id) {
      try {
        setIsLoading(true);
        
        const [leaderboardResponse, pointsResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/points/leaderboard`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            cache: 'no-store',
            credentials: 'include'
          }),
          fetch(`${BACKEND_URL}/api/points/user-points`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            cache: 'no-store',
            credentials: 'include'
          })
        ]);
        
        const [leaderboardData, pointsData] = await Promise.all([
          leaderboardResponse.ok ? leaderboardResponse.json() : { userRank: null, leaderboard: [] },
          pointsResponse.ok ? pointsResponse.json() : { points: 0, streak: 0 }
        ]);
        
        setStats(prevStats => ({
          ...prevStats,
          points: pointsData.points ?? prevStats.points,
          streak: pointsData.streak ?? prevStats.streak,
          userRank: leaderboardData.userRank ?? prevStats.userRank,
          leaderboard: leaderboardData.leaderboard || prevStats.leaderboard
        }));
      } catch (error) {
        console.error('Error in forced refresh:', error);
        setError('Failed to refresh data. Please try again.');
        safeToast('Failed to refresh data. Please try again.', { type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  // Memoized toast function
  const safeToast = useCallback((content, options = {}) => {
    if (!content) return null;
    
    const safeOptions = { ...options };
    if (safeOptions.onClose) delete safeOptions.onClose;
    if (safeOptions.onOpen) delete safeOptions.onOpen;
    
    try {
      return toast(content, {
        closeOnClick: true,
        autoClose: 5000,
        pauseOnHover: true,
        draggable: true,
        position: "top-right",
        hideProgressBar: false,
        ...safeOptions,
      });
    } catch (error) {
      console.error('Toast error:', error);
      return null;
    }
  }, []);

  // Memoized check-in toast
  const showFuturisticCheckInToast = useCallback((pointsEarned = 1, streak = 1) => {
    const fireEmojis = '🔥'.repeat(Math.floor(streak / 5) || 1);
    const message = `DAILY CHECK-IN COMPLETE\n💰 +${pointsEarned} | ⚡ ${streak} day${streak !== 1 ? 's' : ''} ${fireEmojis}`;
    
    safeToast(message, {
      type: 'success',
      position: "top-right",
      autoClose: 5000,
      style: {
        background: 'linear-gradient(to right, #4776E6, #8E54E9)',
        color: '#fff',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '16px',
        lineHeight: '1.6',
        fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
      }
    });
  }, [safeToast]);

  // Memoized handlers
  const handleDailyCheckIn = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/points/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        showFuturisticCheckInToast(data.pointsEarned || 1, data.streak || 1);
        await triggerRefresh();
      } else if (data.message === 'Already checked in today') {
        safeToast(`You've already checked in today! Current streak: ${data.streak || 0} days`, {
          type: 'info',
          style: {
            background: 'linear-gradient(to right, #3498db, #2980b9)',
            color: '#fff',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '16px',
            lineHeight: '1.6',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }
        });
      } else {
        safeToast(data.message || 'Unable to process check-in', { type: 'warning' });
      }
    } catch (error) {
      console.error('Check-in error:', error);
      safeToast('Failed to process daily check-in. Please try again later.', { type: 'error' });
    }
  }, [BACKEND_URL, safeToast, showFuturisticCheckInToast, triggerRefresh]);

  // Add back fetchUserPoints with memoization
  const fetchUserPoints = useCallback(async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/points/user-points`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        cache: 'no-store',
        credentials: 'include'
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch user points: ${response.status}`);
      }
  
      const pointsData = await response.json();
      
      if (pointsData.success) {
        setStats(prevStats => ({
          ...prevStats,
          points: pointsData.points || 0,
          streak: pointsData.streak || 0
        }));
        
        return pointsData;
      }
      
      return { points: 0, streak: 0 };
    } catch (error) {
      console.error('Error fetching user points:', error);
      safeToast('Failed to load your points information', { type: 'error' });
      return { points: 0, streak: 0 };
    }
  }, [BACKEND_URL, safeToast]);

  const handleFindLearningMatches = useCallback(async () => {
    try {
      setIsGeneratingMatches(true);
      const response = await fetch(`${BACKEND_URL}/api/matches/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId: user._id }),
        credentials: 'include'
      });
  
      if (!response.ok) throw new Error(`Failed to generate matches: ${response.status}`);
  
      const result = await response.json();
      const learningMatches = result.matchesFound || [];
      const teachingMatches = result.teachingMatchesCreated || [];
      const totalMatches = learningMatches.length + teachingMatches.length;
      
      if (totalMatches > 0) {
        const message = learningMatches.length > 0 && teachingMatches.length > 0
          ? `🎉 Found ${learningMatches.length} learning matches and created ${teachingMatches.length} teaching matches!`
          : learningMatches.length > 0
            ? `🎉 Found ${learningMatches.length} matches for your learning needs!`
            : `🎉 Created ${teachingMatches.length} teaching matches!`;
        
        safeToast(message, { type: 'success' });
      } else {
        safeToast('ℹ️ No new matches found. Try adding more skills you want to learn or teach!', { type: 'info' });
      }
  
      await triggerRefresh();
      
      navigate('/match/learning');
    } catch (error) {
      console.error('Error generating matches:', error);
      safeToast('❌ Failed to generate matches. Please try again.', { type: 'error' });
    } finally {
      setIsGeneratingMatches(false);
    }
  }, [BACKEND_URL, user, safeToast, triggerRefresh, navigate]);

  // Memoized loadUserProfile function
  const loadUserProfile = useCallback(async () => {
    try {
      if (!user?._id) throw new Error('User not authenticated');
      
      const [userDataResult, completedSessionsResult, pointsDataResult, leaderboardDataResult] = 
        await Promise.allSettled([
          fetchUserProfile(user._id, BACKEND_URL),
          fetchCompletedSessionsCount(user._id, BACKEND_URL),
          fetchUserPoints(user._id),
          fetch(`${BACKEND_URL}/api/points/leaderboard`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            cache: 'no-store',
            credentials: 'include'
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch leaderboard: ${res.status}`);
            return res.json();
          })
        ]);
      
      const userData = userDataResult.status === 'fulfilled' ? userDataResult.value : {};
      const completedSessionsCount = completedSessionsResult.status === 'fulfilled' ? completedSessionsResult.value : 0;
      const pointsData = pointsDataResult.status === 'fulfilled' ? pointsDataResult.value : { points: 0, streak: 0 };
      const leaderboardData = leaderboardDataResult.status === 'fulfilled' ? leaderboardDataResult.value : { userRank: null, leaderboard: [] };
      
      setStats(prevStats => ({
        ...prevStats,
        ...userData,
        sessionsCompleted: completedSessionsCount,
        points: pointsData.points || 0,
        streak: pointsData.streak || 0,
        userRank: leaderboardData.userRank,
        leaderboard: leaderboardData.leaderboard || []
      }));
      
      setError(null);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Unable to load complete profile data. Some features may be limited.');
      safeToast('Some profile data couldn\'t be loaded', { type: 'warning' });
    }
  }, [user, BACKEND_URL, safeToast, fetchUserPoints]);

  // Memoized skill distribution calculations
  const skillDistribution = useMemo(() => {
    const teachingSkillsCount = stats.teachingSkills?.length || 0;
    const learningSkillsCount = stats.learningSkills?.length || 0;
    const totalSkills = teachingSkillsCount + learningSkillsCount;
    return {
      teachingPercentage: totalSkills > 0 ? Math.round((teachingSkillsCount / totalSkills) * 100) : 0,
      learningPercentage: totalSkills > 0 ? 100 - Math.round((teachingSkillsCount / totalSkills) * 100) : 0
    };
  }, [stats.teachingSkills, stats.learningSkills]);

  // Effects
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const justLoggedIn = sessionStorage.getItem('justLoggedIn');
      
      if (justLoggedIn === 'true' && user?._id) {
        sessionStorage.removeItem('justLoggedIn');
        setTimeout(() => handleDailyCheckIn(), 1000);
      }
    };
    
    checkLoginStatus();
  }, [user, handleDailyCheckIn]);

  useEffect(() => {
    if (user?._id) {
      setIsLoading(true);
      setError(null);
      loadUserProfile()
        .finally(() => {
          setIsLoading(false);
          if (isFirstLoad) {
            setIsFirstLoad(false);
          }
        });
    } else {
      setIsLoading(false);
    }
  }, [user, refreshTrigger, loadUserProfile, isFirstLoad]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user && !isLoading) {
        navigate('/login', { state: { from: location }, replace: true });
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user, isLoading, navigate, location]);

  // Loading state
  if (isLoading && isFirstLoad) {
    return (
      <LoadingSpinner>
        <Spinner animation="border" variant="primary" className="spinner" />
        <h4>Loading your dashboard...</h4>
        <p>Please wait while we prepare your experience</p>
      </LoadingSpinner>
    );
  }

  // Error state
  if (error && !user) {
    return (
      <FullScreenContainer fluid className="vh-100 d-flex justify-content-center align-items-center">
        <Card className="shadow-lg border-0 p-4 text-center" style={{ maxWidth: "500px" }}>
          <Card.Body>
            <h3 className="text-danger mb-3">Authentication Error</h3>
            <p className="mb-4">{error}</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/login', { replace: true })} 
              className="px-4 py-2"
              size="lg"
            >
              Go to Login
            </Button>
          </Card.Body>
        </Card>
      </FullScreenContainer>
    );
  }

  return (
    <FullScreenContainer fluid>
      {isLoading && <LoadingOverlay />}
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        limit={3}
      />
      
      <DashboardHeader 
        handleLogout={logout}
        navigate={navigate} 
        onUpdate={handleChildUpdate}
      />

      <DashboardContent>
        {error && (
          <ErrorAlert variant="danger" dismissible onClose={() => setError(null)}>
            <Alert.Heading>Error</Alert.Heading>
            <p className="mb-0">{error}</p>
          </ErrorAlert>
        )}

        <UserWelcomeCard 
          user={user}
          stats={stats}
          handleFindLearningMatches={handleFindLearningMatches}
          isGeneratingMatches={isGeneratingMatches}
          teachingPercentage={skillDistribution.teachingPercentage}
          learningPercentage={skillDistribution.learningPercentage}
          handleDailyCheckIn={handleDailyCheckIn}
          navigate={navigate}
          onUpdate={handleChildUpdate}
        />

        <div className="dashboard-tabs">
          <TabNavigation>
            <Nav.Item>
              <Nav.Link 
                onClick={() => setActiveTab('overview')}
                active={activeTab === 'overview'}
              >
                <i className="bi bi-grid me-2"></i>
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                onClick={() => setActiveTab('sessions')}
                active={activeTab === 'sessions'}
              >
                <i className="bi bi-calendar-check me-2"></i>
                Sessions
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                onClick={() => setActiveTab('matches')}
                active={activeTab === 'matches'}
              >
                <i className="bi bi-people me-2"></i>
                Matches
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                onClick={() => setActiveTab('skills')}
                active={activeTab === 'skills'}
              >
                <i className="bi bi-star me-2"></i>
                Skills
              </Nav.Link>
            </Nav.Item>
          </TabNavigation>
        </div>

        <div className="tab-content pb-5">
          {activeTab === 'overview' && (
            <OverviewTab 
              stats={stats} 
              navigate={navigate} 
              handleFindLearningMatches={handleFindLearningMatches}
              handleDailyCheckIn={handleDailyCheckIn}
              user={user}
              onUpdate={handleChildUpdate}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionsTab 
              sessions={stats.upcomingSessions} 
              matches={stats.recentMatches} 
              navigate={navigate} 
              onUpdate={handleChildUpdate}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'matches' && (
            <MatchesTab 
              matches={stats.recentMatches} 
              navigate={navigate} 
              handleFindLearningMatches={handleFindLearningMatches} 
              onUpdate={handleChildUpdate}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsTab 
              teachingSkills={stats.teachingSkills} 
              learningSkills={stats.learningSkills} 
              navigate={navigate} 
              onUpdate={handleChildUpdate}
              isLoading={isLoading}
            />
          )}
        </div>
      </DashboardContent>
    </FullScreenContainer>
  );
};

export default Dashboard;