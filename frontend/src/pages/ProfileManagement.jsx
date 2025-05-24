// src/pages/ProfileManagement.jsx
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { 
  MortarboardFill, 
  BookFill, 
  PersonFill, 
  ShieldLockFill, 
  EyeFill,
  GearFill,
  ChevronLeft
} from 'react-bootstrap-icons';
import styled from 'styled-components';

// Components
import Header from '../components/profile/layout/Header';
import ProfileNavigation from '../components/profile/ProfileNavigation';
import SkillsManagement from '../components/profile/SkillsManagement';
import EditProfileForm from '../components/profile/EditProfileForm';
import SecuritySettings from '../components/profile/SecuritySettings';
import ProfilePreview from '../components/profile/ProfilePreview';

// API - Import refactored API functions
import { 
  fetchUserProfile, 
  addSkill, 
  removeSkill, 
  updateProfile, 
  updateSecurityQuestions,
  checkApiStatus
} from '../utils/api';

// Constants
import { SECURITY_QUESTIONS } from '../components/profile/shared/constants';

// Lazy load modals
const EditProfileModal = lazy(() => import('../components/profile/modals/EditProfileModal'));
const SecurityQuestionsModal = lazy(() => import('../components/profile/modals/SecurityQuestionsModal'));

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const MobileNavToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(135deg, #0b1437 0%, #1a237e 100%);
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: 64px;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileNavDrawer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  animation: fadeIn 0.2s ease-out;
  backdrop-filter: blur(4px);

  @media (min-width: 768px) {
    display: none;
  }
`;

const NavDrawerContent = styled.div`
  background: white;
  height: 100%;
  width: 85%;
  max-width: 320px;
  padding: 1.5rem;
  overflow-y: auto;
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
  animation: slideIn 0.3s ease-out;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #666;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0,0,0,0.05);
  }
`;

const MobileHeader = styled.div`
  padding: 1rem;
  background: linear-gradient(135deg, #0b1437 0%, #1a237e 100%);
  color: white;
  margin: -1.5rem -1.5rem 1.5rem -1.5rem;
`;

const ContentWrapper = styled.div`
  padding-top: 64px; // Height of mobile header

  @media (min-width: 768px) {
    padding-top: 0;
  }
`;

const ContentCard = styled(Card)`
  border: 0;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled(Card.Header)`
  background: white;
  border: 0;
  padding: 1.5rem;
  position: relative;
  z-index: 1;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  background: ${props => props.gradient};
  box-shadow: 0 10px 15px -3px ${props => props.shadowColor};
`;

const LoadingSpinner = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
`;

const ProfileManagement = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);
  const [activeTab, setActiveTab] = useState('skills');
  const [isLoading, setIsLoading] = useState(true);

  const [profile, setProfile] = useState({ 
    teachingSkills: [], 
    learningSkills: [],
    name: '',
    email: '',
    country: '',
    hasSecurityQuestions: false
  });

  // Edit profile states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: '',
    email: '',
    country: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [editProfileError, setEditProfileError] = useState('');

  const [profileEditErrors, setProfileEditErrors] = useState({
    general: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  // Security questions states
  const [securityQuestions, setSecurityQuestions] = useState([
    { question: SECURITY_QUESTIONS[0], answer: '' },
    { question: SECURITY_QUESTIONS[1], answer: '' }
  ]);
  const [showSecurityQuestionsModal, setShowSecurityQuestionsModal] = useState(false);
  const [securityQuestionsError, setSecurityQuestionsError] = useState('');

  // Memoized values
  const tabConfig = useMemo(() => ({
    skills: {
      icon: <MortarboardFill size={22} />,
      title: 'Skills Management',
      subtitle: 'Manage what you teach and learn',
      gradient: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      shadowColor: 'rgba(59, 130, 246, 0.3)'
    },
    profile: {
      icon: <PersonFill size={22} />,
      title: 'Profile Information',
      subtitle: 'Update your personal details',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      shadowColor: 'rgba(6, 182, 212, 0.3)'
    },
    security: {
      icon: <ShieldLockFill size={22} />,
      title: 'Security Settings',
      subtitle: 'Enhance your account protection',
      gradient: 'linear-gradient(135deg, #10b981, #047857)',
      shadowColor: 'rgba(16, 185, 129, 0.3)'
    },
    view: {
      icon: <EyeFill size={22} />,
      title: 'Profile Preview',
      subtitle: 'See how others view your profile',
      gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      shadowColor: 'rgba(139, 92, 246, 0.3)'
    }
  }), []);

  // API connection check
  useEffect(() => {
    const verifyApiConnection = async () => {
      const isConnected = await checkApiStatus();
      setApiConnected(isConnected);
    };
    verifyApiConnection();
  }, []);

  // Load user profile
  useEffect(() => {
    if (user?._id) {
      loadUserProfile();
    }
  }, [user?._id]);

  // Memoized handlers
  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const profileData = await fetchUserProfile(user._id);
      
      setProfile(profileData);
      setEditProfileData({
        name: profileData.name,
        email: profileData.email,
        country: profileData.country,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      if (profileData.securityQuestions?.length > 0) {
        setSecurityQuestions(profileData.securityQuestions);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileEditErrors(prev => ({
        ...prev,
        general: error.message || 'Failed to load profile. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  }, [user._id]);

  const handleAddSkill = useCallback(async (type, skillData) => {
    try {
      const skillType = type === 'teach' ? 'teaching' : 'learning';
      const newSkill = await addSkill({
        userId: user._id,
        skillName: skillData.name,
        proficiencyLevel: skillData.proficiency,
        description: skillData.description,
        type: skillType,
        isTeaching: type === 'teach',
        isLearning: type === 'learn'
      });
      
      setProfile(prev => ({
        ...prev,
        [`${skillType}Skills`]: [...prev[`${skillType}Skills`], newSkill]
      }));
    } catch (error) {
      console.error('Error adding skill:', error);
      alert(`Failed to add skill: ${error.message}`);
    }
  }, [user._id]);

  const handleRemoveSkill = useCallback(async (type, skillId) => {
    try {
      await removeSkill(skillId);
      const skillType = type === 'teach' ? 'teachingSkills' : 'learningSkills';
      
      setProfile(prev => ({
        ...prev,
        [skillType]: prev[skillType].filter(skill => skill._id !== skillId)
      }));
    } catch (error) {
      console.error('Error removing skill:', error);
      alert(`Failed to remove skill: ${error.message}`);
    }
  }, []);

  const handleUpdateProfile = useCallback(async (formData, passwordChangeMode) => {
    try {
      setProfileEditErrors({
        general: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });

      if (passwordChangeMode) {
        if (!formData.newPassword) {
          setProfileEditErrors(prev => ({ ...prev, newPassword: 'New password is required' }));
          return;
        }
        
        if (formData.newPassword.length < 8) {
          setProfileEditErrors(prev => ({ ...prev, newPassword: 'Password must be at least 8 characters' }));
          return;
        }
        
        if (formData.newPassword !== formData.confirmNewPassword) {
          setProfileEditErrors(prev => ({ ...prev, confirmNewPassword: 'Passwords do not match' }));
          return;
        }
      }

      const updatedProfile = await updateProfile({
        userId: user._id,
        name: formData.name,
        email: formData.email,
        country: formData.country,
        currentPassword: formData.currentPassword,
        newPassword: passwordChangeMode ? formData.newPassword : undefined
      });

      setProfile(prev => ({
        ...prev,
        name: updatedProfile.name,
        email: updatedProfile.email,
        country: updatedProfile.country
      }));

      setProfileEditErrors(prev => ({ ...prev, general: 'Profile updated successfully!' }));
      
      setEditProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.message?.includes('current password')) {
        setProfileEditErrors(prev => ({ 
          ...prev, 
          currentPassword: 'Current password is incorrect' 
        }));
      } else {
        setProfileEditErrors(prev => ({ 
          ...prev, 
          general: error.message || 'Failed to update profile'
        }));
      }
    }
  }, [user._id]);

  const handleSecurityQuestionChange = useCallback((index, field, value) => {
    setSecurityQuestions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  }, []);

  const handleSecurityQuestionsSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      setSecurityQuestionsError('');

      if (securityQuestions.some(q => !q.answer.trim())) {
        setSecurityQuestionsError('All questions must have answers');
        return;
      }

      await updateSecurityQuestions(securityQuestions);
      
      setProfile(prev => ({
        ...prev,
        hasSecurityQuestions: true,
        securityQuestions: [...securityQuestions]
      }));
      
      setShowSecurityQuestionsModal(false);
    } catch (error) {
      console.error('Error updating security questions:', error);
      setSecurityQuestionsError(error.message || 'Failed to update security questions');
    }
  }, [securityQuestions]);

  const navigateToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen(prev => !prev);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <LoadingSpinner>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Loading your profile...</h5>
        </div>
      </LoadingSpinner>
    );
  }

  const currentTab = tabConfig[activeTab];

  return (
    <PageContainer>
      <Header logout={logout} />
      
      <MobileNavToggle>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-link text-white p-0 me-3"
            onClick={navigateToDashboard}
          >
            <ChevronLeft size={24} />
          </button>
          <h5 className="mb-0 fw-bold">{currentTab.title}</h5>
        </div>
        <Button
          variant="outline-light"
          size="sm"
          className="rounded-pill"
          onClick={toggleMobileNav}
        >
          <GearFill size={18} />
        </Button>
      </MobileNavToggle>

      {mobileNavOpen && (
        <MobileNavDrawer onClick={toggleMobileNav}>
          <NavDrawerContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={toggleMobileNav}>×</CloseButton>
            <MobileHeader>
              <h4 className="mb-0">Profile Settings</h4>
              <p className="text-white-50 mb-0">Manage your account</p>
            </MobileHeader>
            <ProfileNavigation
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileNavOpen(false);
              }}
              navigateToDashboard={navigateToDashboard}
            />
          </NavDrawerContent>
        </MobileNavDrawer>
      )}
      
      <ContentWrapper>
        <Container fluid className="py-4">
          {!apiConnected && (
            <div className="alert alert-warning mb-4" role="alert">
              <div className="d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                <div>
                  <strong>Connection issue detected.</strong> Some features may not work properly. Please check your internet connection.
                </div>
              </div>
            </div>
          )}
          
          <Row>
            <Col md={3} className="d-none d-md-block mb-4">
              <ContentCard>
                <div className="p-4" style={{ background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)', color: 'white' }}>
                  <h4 className="fw-bold mb-0">Profile Settings</h4>
                  <p className="text-white-50 mb-0">Manage your account</p>
                </div>
                <ProfileNavigation 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  navigateToDashboard={navigateToDashboard} 
                />
              </ContentCard>
            </Col>
            
            <Col md={9}>
              <div className="content-area">
                <ContentCard className="mb-4">
                  <CardHeader>
                    <div className="d-flex align-items-center">
                      <IconWrapper gradient={currentTab.gradient} shadowColor={currentTab.shadowColor}>
                        {currentTab.icon}
                      </IconWrapper>
                      <div>
                        <h4 className="fw-bold mb-0">{currentTab.title}</h4>
                        <p className="text-muted mb-0">{currentTab.subtitle}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <Card.Body className="p-4">
                    {activeTab === 'skills' && (
                      <SkillsManagement 
                        teachingSkills={profile.teachingSkills} 
                        learningSkills={profile.learningSkills}
                        onAddSkill={handleAddSkill}
                        onRemoveSkill={handleRemoveSkill}
                      />
                    )}
                    
                    {activeTab === 'profile' && (
                      <EditProfileForm 
                        profileData={{
                          name: profile.name,
                          email: profile.email,
                          country: profile.country,
                          currentPassword: '',
                          newPassword: '',
                          confirmNewPassword: ''
                        }}
                        onUpdateProfile={handleUpdateProfile}
                        editProfileErrors={profileEditErrors}
                      />
                    )}
                    
                    {activeTab === 'security' && (
                      <SecuritySettings 
                        hasSecurityQuestions={profile.hasSecurityQuestions}
                        onShowSecurityQuestionsModal={() => setShowSecurityQuestionsModal(true)}
                      />
                    )}
                    
                    {activeTab === 'view' && (
                      <div className="profile-preview-container">
                        <ProfilePreview profile={profile} />
                      </div>
                    )}
                  </Card.Body>
                </ContentCard>
              </div>
            </Col>
          </Row>
        </Container>
      </ContentWrapper>

      <Suspense fallback={null}>
        {showEditProfileModal && (
          <EditProfileModal 
            show={showEditProfileModal}
            onHide={() => setShowEditProfileModal(false)}
            editProfileData={editProfileData}
            setEditProfileData={setEditProfileData}
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateProfile(editProfileData, !!editProfileData.newPassword);
              setShowEditProfileModal(false);
            }}
            error={editProfileError}
          />
        )}

        {showSecurityQuestionsModal && (
          <SecurityQuestionsModal 
            show={showSecurityQuestionsModal}
            onHide={() => setShowSecurityQuestionsModal(false)}
            securityQuestions={securityQuestions}
            onSecurityQuestionChange={handleSecurityQuestionChange}
            onSubmit={handleSecurityQuestionsSubmit}
            error={securityQuestionsError}
          />
        )}
      </Suspense>
      
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        .content-area {
          animation: fadeIn 0.3s ease-out;
        }
        
        @media (max-width: 767.98px) {
          .container-fluid {
            padding-top: 0 !important;
          }
        }
        
        button:focus, input:focus, select:focus, textarea:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5) !important;
        }

        .nav-link {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
          margin-bottom: 0.5rem;
          
          &:hover {
            background: rgba(0,0,0,0.05);
          }
          
          &.active {
            background: linear-gradient(135deg, #0b1437 0%, #1a237e 100%);
            color: white;
          }
        }
        `}
      </style>
    </PageContainer>
  );
};

export default React.memo(ProfileManagement);