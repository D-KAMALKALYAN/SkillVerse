// src/components/Leaderboard/LeaderboardHeader.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, Button, Dropdown } from 'react-bootstrap';
import { ArrowLeft, Trophy, ThreeDotsVertical } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { breakpoints } from '../../styles/breakpoints';
import useResponsive from '../../hooks/useResponsive';

// Performance optimized animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Mobile-optimized header container
const ResponsiveHeader = styled(Card)`
  border-radius: ${props => props.$isMobile ? '0.75rem' : '1rem'};
  margin-bottom: ${props => props.$isMobile ? '0.75rem' : '1rem'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;
  will-change: transform, opacity;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top right, rgba(0,0,0,0.02) 0%, transparent 70%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0,0,0,0.02), transparent);
    pointer-events: none;
  }
  
  .card-body {
    padding: ${props => props.$isMobile ? '0.75rem' : '1rem'};
    position: relative;
    z-index: 1;
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
    min-width: 0;
  }

  .right-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
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
`;

// Optimized Trophy component
const RevolvingTrophy = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  padding: ${props => props.$isMobile ? '8px' : '10px'};
  width: ${props => props.$isMobile ? '32px' : '42px'};
  height: ${props => props.$isMobile ? '32px' : '42px'};
  animation: ${pulse} 2s infinite ease-in-out;
  will-change: transform;
  border: 2px solid rgba(255, 193, 7, 0.2);
  
  svg {
    color: #ffc107;
    height: ${props => props.$isMobile ? '16px' : '22px'};
    width: ${props => props.$isMobile ? '16px' : '22px'};
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }
`;

// Optimized title component
const EnhancedTitle = styled.div`
  min-width: 0;
  flex: 1;
  
  .title-container {
    position: relative;
    display: inline-block;
  }
  
  .main-title {
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-weight: 700;
    font-size: clamp(1.2rem, 4vw, 1.8rem);
    color: #2c3e50;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    letter-spacing: -0.5px;
    position: relative;
    
    background: linear-gradient(
      90deg,
      rgba(0,0,0,0) 0%,
      rgba(0,0,0,0.1) 50%,
      rgba(0,0,0,0) 100%
    );
    background-size: 200px 100%;
    background-repeat: no-repeat;
    background-position: -200px 0;
    animation: ${shimmer} 3s infinite;
  }
  
  .subtitle {
    font-size: clamp(0.65rem, 2vw, 0.8rem);
    color: #6c757d;
    margin-top: 2px;
    display: ${props => props.$isMobile ? 'none' : 'block'};
    text-shadow: none;
  }
`;

// Optimized action buttons
const ActionButton = styled(Button)`
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: ${props => props.$isMobile ? '0.5rem 1rem' : '0.6rem 1.2rem'};
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  background: white;
  color: #2c3e50;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
    background: #f8f9fa;
  }
  
  svg {
    width: ${props => props.$isMobile ? '16px' : '20px'};
    height: ${props => props.$isMobile ? '16px' : '20px'};
  }
`;

// Optimized mobile menu
const MobileDropdownMenu = styled(Dropdown.Menu)`
  padding: 0.5rem;
  min-width: 200px;
  background: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  
  .dropdown-item {
    border-radius: 6px;
    padding: 0.5rem;
    margin-bottom: 0.25rem;
    transition: all 0.2s ease;
    color: #2c3e50;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &:hover {
      background: rgba(0, 0, 0, 0.04);
      transform: translateX(4px);
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
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
    transform: translateY(-1px);
  }
  
  &::after {
    display: none;
  }
  
  svg {
    color: #2c3e50;
  }
`;

const LeaderboardHeader = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [displayText, setDisplayText] = useState('');
  
  const fullText = useMemo(() => 
    isMobile ? 'Leaderboard' : 'Skill Leaderboard'
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

  const handleBack = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const renderDesktopActions = useMemo(() => (
    <div className="desktop-actions">
      <ActionButton 
        onClick={handleBack}
        $isMobile={isMobile}
        aria-label="Back to Dashboard"
      >
        <ArrowLeft /> {!isMobile && 'Back to Dashboard'}
      </ActionButton>
    </div>
  ), [isMobile, handleBack]);

  const renderMobileMenu = useMemo(() => (
    <Dropdown align="end" className="mobile-menu">
      <MobileDropdownToggle 
        id="mobile-menu"
      >
        <ThreeDotsVertical size={20} />
      </MobileDropdownToggle>
      <MobileDropdownMenu className="shadow">
        <Dropdown.Item 
          onClick={handleBack} 
          className="d-flex align-items-center"
        >
          <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
            style={{ 
              width: '28px', 
              height: '28px',
              background: 'rgba(0, 0, 0, 0.04)',
              color: '#2c3e50'
            }}>
            <ArrowLeft size={14} />
          </div>
          <span>Back to Dashboard</span>
        </Dropdown.Item>
      </MobileDropdownMenu>
    </Dropdown>
  ), [handleBack]);

  return (
    <ResponsiveHeader $isMobile={isMobile}>
      <Card.Body>
        <div className="header-content">
          <div className="left-section">
            <RevolvingTrophy $isMobile={isMobile}>
              <Trophy />
            </RevolvingTrophy>
            
            <EnhancedTitle $isMobile={isMobile}>
              <div className="title-container">
                <h1 className="main-title">
                  {displayText || fullText}
                  {showCursor && displayText !== fullText && !isLowEndDevice && (
                    <span style={{ opacity: showCursor ? 1 : 0, marginLeft: '2px' }}>|</span>
                  )}
                </h1>
                {!isMobile && <div className="subtitle">Top Performers & Rankings</div>}
              </div>
            </EnhancedTitle>
          </div>
          
          <div className="right-section">
            {renderDesktopActions}
            {renderMobileMenu}
          </div>
        </div>
      </Card.Body>
    </ResponsiveHeader>
  );
};

export default React.memo(LeaderboardHeader);