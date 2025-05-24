import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Button, Dropdown, Nav } from 'react-bootstrap';
import { PersonFill, BoxArrowRight, ThreeDotsVertical, Globe } from 'react-bootstrap-icons';
import NotificationCenter from '../NotificationCenter';
import useResponsive from '../../hooks/useResponsive';
import styled, { keyframes } from 'styled-components';
import { breakpoints } from '../../styles/breakpoints';
import NavbarSearchDropdown from '../search/NavbarSearchDropdown';

// Performance optimized animations - using transform and opacity only
const rotateGlobe = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
`;

// Mobile-optimized header container
const ResponsiveHeader = styled(Card)`
  border-radius: ${props => props.$isMobile ? '0.75rem' : '1rem'};
  margin-bottom: ${props => props.$isMobile ? '0.75rem' : '1rem'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  /* Reduce padding on mobile for compactness */
  .card-body {
    padding: ${props => props.$isMobile ? '0.75rem' : '1rem'};
  }

  .header-content {
    flex-direction: row;
    transition: transform 0.3s ease;
    
    @media (max-width: ${breakpoints.sm}px) {
      flex-direction: column;
      gap: 0.5rem;
    }
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

  /* Optimized layout for search and notification area */
  .search-notification-container {
    display: flex;
    align-items: center;
    gap: ${props => props.$isMobile ? '0.25rem' : '0.5rem'};
    
    @media (max-width: ${breakpoints.sm}px) {
      width: 100%;
      justify-content: space-between;
    }
  }

  .right-container {
    display: flex;
    align-items: center;
    gap: ${props => props.$isMobile ? '0.5rem' : '1rem'};
    
    @media (max-width: ${breakpoints.sm}px) {
      width: 100%;
      margin-top: 0.25rem;
    }
  }
  
  /* Increase touch area for mobile */
  .search-icon-mobile {
    padding: ${props => props.$isMobile ? '0.375rem 0.5rem' : '0.25rem 0.375rem'};
      
    .dropdown-toggle::after {
      display: none;
    }
  }
`;

// Mobile-optimized Globe - reduced animation complexity
const RevolvingGlobe = styled.div`
  margin-right: ${props => props.$isMobile ? '6px' : '12px'};
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  border-radius: 50%;
  padding: ${props => props.$isMobile ? '8px' : '10px'};
  width: ${props => props.$isMobile ? '32px' : '42px'};
  height: ${props => props.$isMobile ? '32px' : '42px'};
  
  /* Simplified animation for better mobile performance */
  animation: ${rotateGlobe} ${props => props.$isMobile ? '15s' : '10s'} linear infinite;
  will-change: transform;
  
  /* Simpler highlight effect without additional elements */
  background-image: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, rgba(76, 130, 246, 0.8) 70%);
  
  svg {
    color: white;
    height: ${props => props.$isMobile ? '16px' : '22px'};
    width: ${props => props.$isMobile ? '16px' : '22px'};
  }
`;

// Simplified title component for mobile
const EnhancedTitle = styled.div`
  margin-bottom: 0;
  
  .title-container {
    position: relative;
    display: inline-block;
  }
  
  .main-title {
    /* Prioritize system fonts for better performance */
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-weight: 800;
    letter-spacing: ${props => props.$isMobile ? '1px' : '1.5px'};
    font-size: ${props => props.$isMobile ? '1.2rem' : '1.8rem'};
    color: #000000;
    position: relative;
    z-index: 1;
    text-transform: uppercase;
    margin: 0;
    padding-bottom: ${props => props.$isMobile ? '2px' : '4px'};
    transition: transform 0.3s ease;
    white-space: nowrap;
    will-change: transform;
  }
  
  /* Simpler typing animation for mobile */
  .typing-text {
    position: relative;
    display: inline-block;
    
    &::after {
      content: '|';
      position: absolute;
      right: -6px;
      animation: blink-caret 0.75s step-end infinite;
      color: #4361ee;
      font-weight: 400;
    }
  }
  
  @keyframes blink-caret {
    50% { opacity: 0; }
  }
  
  /* Simplified accent bar */
  .title-accent {
    position: absolute;
    bottom: 0;
    left: 0;
    height: ${props => props.$isMobile ? '3px' : '4px'};
    width: 100%;
    background: #4361ee;
    border-radius: 2px;
    z-index: 0;
  }
  
  .subtitle {
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: ${props => props.$isMobile ? '0.65rem' : '0.8rem'};
    letter-spacing: ${props => props.$isMobile ? '2px' : '3px'};
    text-transform: uppercase;
    color: #64748b;
    margin-top: 2px;
    opacity: 0.8;
    text-align: center;
    display: ${props => props.$isMobile ? 'none' : 'block'};
  }
`;

// Mobile-friendly action buttons with bigger touch targets
const ActionButton = styled(Button)`
  border-radius: ${props => props.$isMobile ? '6px' : '8px'};
  transition: transform 0.3s ease;
  border: none;
  padding: ${props => props.$isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem'};
  will-change: transform;
  min-height: ${props => props.$isMobile ? '40px' : 'auto'};
  min-width: ${props => props.$isMobile ? '40px' : 'auto'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  /* Increase icon size for better touch targets */
  svg {
    width: ${props => props.$isMobile ? '18px' : '16px'};
    height: ${props => props.$isMobile ? '18px' : '16px'};
  }
`;

// Optimized notification wrapper with proper spacing
const NotificationWrapper = styled.div`
  position: relative;
  z-index: 1;
  min-width: ${props => props.$isMobile ? '36px' : 'auto'};
  min-height: ${props => props.$isMobile ? '36px' : 'auto'};
  
  .badge {
    position: absolute;
    top: -6px;
    right: -6px;
    z-index: 10;
  }
`;

// Mobile optimized dropdown menu
const MobileDropdownMenu = styled(Dropdown.Menu)`
  padding: 0.5rem;
  
  .dropdown-item {
    border-radius: 6px;
    padding: 0.5rem;
    margin-bottom: 0.25rem;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &:active {
      background-color: #f3f4f6;
      color: inherit;
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
  
  &:focus {
    box-shadow: none;
  }
`;

const DashboardHeader = ({ handleLogout, navigate }) => {
  const { isMobile } = useResponsive();
  const [displayText, setDisplayText] = useState('');
  
  // Simplified text for mobile
  const fullText = useMemo(() => 
    isMobile ? 'Skill Barter' : 'Skill Barter Platform'
  , [isMobile]);
  
  const [showCursor, setShowCursor] = useState(true);
  
  // Only run typing animation if not on low-end mobile devices
  const isLowEndDevice = useMemo(() => {
    if (typeof window !== 'undefined') {
      // Check for hardware concurrency as a proxy for device capability
      return navigator.hardwareConcurrency <= 4;
    }
    return false;
  }, []);
  
  // Optimized typing animation with reduced frequency for mobile
  const handleTypingAnimation = useCallback(() => {
    // Skip animation on low-end devices
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
    }, isMobile ? 150 : 100); // Slower on mobile
    
    return () => clearTimeout(timeout);
  }, [displayText, fullText, isMobile, isLowEndDevice]);

  useEffect(() => {
    return handleTypingAnimation();
  }, [handleTypingAnimation]);
  
  // Less frequent animation reset on mobile
  const resetAnimation = useCallback(() => {
    // Skip animation reset on low-end devices
    if (isLowEndDevice) return;
    
    setDisplayText('');
    setShowCursor(true);
  }, [isLowEndDevice]);

  useEffect(() => {
    // Less frequent animation on mobile to save battery
    const interval = setInterval(resetAnimation, isMobile ? 15000 : 10000);
    return () => clearInterval(interval);
  }, [resetAnimation, isMobile]);

  // Optimized font loading - load only if needed
  useEffect(() => {
    // Skip custom font loading on mobile to improve performance
    if (isMobile) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap';
    link.async = true;
    document.head.appendChild(link);
    
    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [isMobile]);

  // Memoized desktop actions
  const renderDesktopActions = useMemo(() => (
    <div className="desktop-actions">
      <ActionButton 
        variant="primary" 
        className="d-flex align-items-center gap-2" 
        onClick={() => navigate('/profile')}
        $isMobile={isMobile}
        style={{ 
          background: 'linear-gradient(to right, #3b82f6, #1e40af)'
        }}
      >
        <PersonFill /> {!isMobile && 'Profile'}
      </ActionButton>
      <ActionButton 
        variant="danger" 
        className="d-flex align-items-center gap-2" 
        onClick={handleLogout}
        $isMobile={isMobile}
        style={{ 
          background: 'linear-gradient(to right, #ef4444, #b91c1c)'
        }}
      >
        <BoxArrowRight /> {!isMobile && 'Logout'}
      </ActionButton>
    </div>
  ), [isMobile, navigate, handleLogout]);

  // Memoized mobile menu with better touch targets
  const renderMobileMenu = useMemo(() => (
    <Dropdown align="end" className="mobile-menu">
      <MobileDropdownToggle 
        variant="light" 
        id="mobile-menu" 
        className="border-0 bg-transparent"
      >
        <ThreeDotsVertical size={isMobile ? 22 : 20} />
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
  ), [navigate, handleLogout, isMobile]);

  return (
    <ResponsiveHeader 
      $isMobile={isMobile} 
      className="bg-gradient-primary shadow"
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center header-content">
          <div className="d-flex align-items-center">
            <RevolvingGlobe $isMobile={isMobile}>
              <Globe />
            </RevolvingGlobe>
            
            <EnhancedTitle $isMobile={isMobile}>
              <div className="title-container">
                <h1 className="main-title">
                  <span className={showCursor && !isLowEndDevice ? "typing-text" : ""}>
                    {displayText || fullText} {/* Fallback to full text */}
                  </span>
                </h1>
                <div className="title-accent"></div>
                {!isMobile && <div className="subtitle">Exchange Expertise Globally</div>}
              </div>
            </EnhancedTitle>
          </div>
          
          <div className="right-container">
            <div className="search-notification-container">
              <Nav.Item className="search-icon-mobile">
                <NavbarSearchDropdown />
              </Nav.Item>
              <NotificationWrapper $isMobile={isMobile}>
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

// Use React.memo with a custom comparison function to prevent unnecessary re-renders
export default React.memo(DashboardHeader, (prevProps, nextProps) => {
  // Custom comparison to only re-render when necessary
  return true; // Replace with actual comparison logic if needed
});