import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Button, Dropdown, Nav } from 'react-bootstrap';
import { PersonFill, BoxArrowRight, ThreeDotsVertical, Globe } from 'react-bootstrap-icons';
import NotificationCenter from '../NotificationCenter';
import useResponsive from '../../hooks/useResponsive';
import styled, { keyframes } from 'styled-components';
import { breakpoints } from '../../styles/breakpoints';
import NavbarSearchDropdown from '../search/NavbarSearchDropdown';

// Performance optimized animations
const rotateGlobe = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Mobile-optimized header container
const ResponsiveHeader = styled(Card)`
  border-radius: ${props => props.$isMobile ? '0.75rem' : '1rem'};
  margin-bottom: ${props => props.$isMobile ? '0.75rem' : '1rem'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .card-body {
    padding: ${props => props.$isMobile ? '0.75rem' : '1rem'};
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;
    gap: 1rem;
    
    @media (max-width: ${breakpoints.sm}px) {
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }

  .left-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 0; // Prevent flex item from growing beyond container
  }

  .right-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0; // Prevent shrinking
  }

  .desktop-actions {
    display: flex;
    gap: 0.5rem;
    
    @media (max-width: ${breakpoints.md}px) {
      display: none;
    }
  }

  .mobile-menu {
    display: none;
    
    @media (max-width: ${breakpoints.md}px) {
      display: flex;
    }
  }

  .search-notification-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

// Optimized Globe component
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
    width: ${props => props.$isMobile ? '16px' : '22px'};
  }
`;

// Optimized title component
const EnhancedTitle = styled.div`
  min-width: 0; // Prevent text overflow
  flex: 1;
  
  .title-container {
    position: relative;
    display: inline-block;
  }
  
  .main-title {
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-weight: 800;
    font-size: ${props => props.$isMobile ? '1.2rem' : '1.8rem'};
    color: #000000;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .subtitle {
    font-size: ${props => props.$isMobile ? '0.65rem' : '0.8rem'};
    color: #64748b;
    margin-top: 2px;
    display: ${props => props.$isMobile ? 'none' : 'block'};
  }
`;

// Optimized action buttons
const ActionButton = styled(Button)`
  border-radius: 8px;
  transition: transform 0.2s ease;
  border: none;
  padding: 0.5rem 1rem;
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Optimized notification wrapper
const NotificationWrapper = styled.div`
  position: relative;
  z-index: 1;
  min-width: 36px;
  min-height: 36px;
`;

// Optimized mobile menu
const MobileDropdownMenu = styled(Dropdown.Menu)`
  padding: 0.5rem;
  min-width: 200px;
  
  .dropdown-item {
    border-radius: 6px;
    padding: 0.5rem;
    margin-bottom: 0.25rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const MobileDropdownToggle = styled(Dropdown.Toggle)`
  padding: 0.5rem;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    display: none;
  }
`;

const DashboardHeader = ({ handleLogout, navigate }) => {
  const { isMobile } = useResponsive();
  const [displayText, setDisplayText] = useState('');
  
  const fullText = useMemo(() => 
    isMobile ? 'Skill Barter' : 'Skill Barter Platform'
  , [isMobile]);
  
  const [showCursor, setShowCursor] = useState(true);
  
  const isLowEndDevice = useMemo(() => {
    if (typeof window !== 'undefined') {
      return navigator.hardwareConcurrency <= 4;
    }
    return false;
  }, []);
  
  const handleTypingAnimation = useCallback(() => {
    if (isLowEndDevice) {
      if (displayText !== fullText) {
        setDisplayText(fullText);
      }
      return () => {};
    }
    
    if (displayText === fullText) {
      const timeout = setTimeout(() => setShowCursor(false), 3000);
      return () => clearTimeout(timeout);
    }
    
    const timeout = setTimeout(() => {
      setDisplayText(fullText.substring(0, displayText.length + 1));
    }, isMobile ? 150 : 100);
    
    return () => clearTimeout(timeout);
  }, [displayText, fullText, isMobile, isLowEndDevice]);

  useEffect(() => {
    return handleTypingAnimation();
  }, [handleTypingAnimation]);
  
  const resetAnimation = useCallback(() => {
    if (isLowEndDevice) return;
    setDisplayText('');
    setShowCursor(true);
  }, [isLowEndDevice]);

  useEffect(() => {
    const interval = setInterval(resetAnimation, isMobile ? 15000 : 10000);
    return () => clearInterval(interval);
  }, [resetAnimation, isMobile]);

  const renderDesktopActions = useMemo(() => (
    <div className="desktop-actions">
      <ActionButton 
        variant="primary" 
        onClick={() => navigate('/profile')}
        style={{ 
          background: 'linear-gradient(to right, #3b82f6, #1e40af)'
        }}
      >
        <PersonFill /> {!isMobile && 'Profile'}
      </ActionButton>
      <ActionButton 
        variant="danger" 
        onClick={handleLogout}
        style={{ 
          background: 'linear-gradient(to right, #ef4444, #b91c1c)'
        }}
      >
        <BoxArrowRight /> {!isMobile && 'Logout'}
      </ActionButton>
    </div>
  ), [isMobile, navigate, handleLogout]);

  const renderMobileMenu = useMemo(() => (
    <Dropdown align="end" className="mobile-menu">
      <MobileDropdownToggle 
        variant="light" 
        id="mobile-menu" 
        className="border-0 bg-transparent"
      >
        <ThreeDotsVertical size={20} />
      </MobileDropdownToggle>
      <MobileDropdownMenu className="shadow border-0">
        <Dropdown.Item 
          onClick={() => navigate('/profile')} 
          className="d-flex align-items-center"
        >
          <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
            style={{ 
              width: '28px', 
              height: '28px',
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              color: 'white'
            }}>
            <PersonFill size={14} />
          </div>
          <span>Profile</span>
        </Dropdown.Item>
        <Dropdown.Item 
          onClick={handleLogout} 
          className="d-flex align-items-center text-danger"
        >
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
      </MobileDropdownMenu>
    </Dropdown>
  ), [navigate, handleLogout]);

  return (
    <ResponsiveHeader 
      $isMobile={isMobile} 
      className="bg-gradient-primary shadow"
    >
      <Card.Body>
        <div className="header-content">
          <div className="left-section">
            <RevolvingGlobe $isMobile={isMobile}>
              <Globe />
            </RevolvingGlobe>
            
            <EnhancedTitle $isMobile={isMobile}>
              <div className="title-container">
                <h1 className="main-title">
                  {displayText || fullText}
                </h1>
                {!isMobile && <div className="subtitle">Exchange Expertise Globally</div>}
              </div>
            </EnhancedTitle>
          </div>
          
          <div className="right-section">
            <div className="search-notification-container">
              <Nav.Item>
                <NavbarSearchDropdown />
              </Nav.Item>
              <NotificationWrapper>
                <NotificationCenter />
              </NotificationWrapper>
            </div>
            
            {renderDesktopActions}
            {renderMobileMenu}
          </div>
        </div>
      </Card.Body>
    </ResponsiveHeader>
  );
};

export default React.memo(DashboardHeader);