import React, { memo, useMemo } from 'react';
import { Card, Nav } from 'react-bootstrap';
import { 
  GearFill, 
  PersonFill, 
  ShieldLockFill, 
  EyeFill, 
  Speedometer2 as SpeeddometerFill,
  ChevronRight,
  MortarboardFill
} from 'react-bootstrap-icons';
import styled from 'styled-components';
import { breakpoints } from '../../styles/breakpoints';
import useResponsive from '../../hooks/useResponsive';

// Styled components for better performance and maintainability
const StyledCard = styled(Card)`
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: ${props => props.$isMobile ? '0.75rem' : '1rem'};
  overflow: hidden;
  transition: transform 0.2s ease;
  margin-bottom: ${props => props.$isMobile ? '0.75rem' : '1rem'};
  background: white;

  @media (max-width: ${breakpoints.sm}px) {
    margin: 0;
    box-shadow: none;
  }
`;

const NavLink = styled(Nav.Link)`
  display: flex;
  align-items: center;
  padding: ${props => props.$isMobile ? '0.875rem 1rem' : '1rem 1.25rem'};
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  
  &:hover:not(.active) {
    background: rgba(241, 245, 249, 0.7);
  }

  &.active {
    background: #3b82f6;
    color: white;
    
    ${props => props.$isMobile && `
      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        border-left: 8px solid #2563eb;
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
      }
    `}
  }

  @media (max-width: ${breakpoints.sm}px) {
    padding: 0.875rem 1rem;
  }
`;

const IconWrapper = styled.div`
  width: ${props => props.$isMobile ? '36px' : '40px'};
  height: ${props => props.$isMobile ? '36px' : '40px'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  transition: all 0.3s ease;
  background: ${props => props.active 
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(203, 213, 225, 0.2)'};
  color: ${props => props.active ? 'white' : '#64748b'};

  svg {
    width: ${props => props.$isMobile ? '18px' : '20px'};
    height: ${props => props.$isMobile ? '18px' : '20px'};
  }

  @media (max-width: ${breakpoints.sm}px) {
    width: 32px;
    height: 32px;
    margin-right: 0.875rem;
  }
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  min-width: 0;
`;

const Title = styled.div`
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-weight: 600;
  color: ${props => props.active ? 'white' : '#0f172a'};
  font-size: ${props => props.$isMobile ? '0.9rem' : '0.95rem'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: ${breakpoints.sm}px) {
    font-size: 0.875rem;
  }
`;

const Description = styled.div`
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 0.8rem;
  color: ${props => props.active ? 'rgba(255, 255, 255, 0.8)' : '#64748b'};
  margin-top: 2px;
  
  @media (max-width: ${breakpoints.sm}px) {
    display: none;
  }
`;

const DashboardButton = styled(NavLink)`
  background: #f8fafc;
  color: #0f172a;
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;

  &:hover {
    background: #f1f5f9;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  ${IconWrapper} {
    background: #e2e8f0;
    color: #64748b;
  }

  ${Title} {
    color: #0f172a;
  }

  ${Description} {
    color: #64748b;
  }

  .chevron-right {
    color: #64748b;
  }
`;

const ProfileNavigation = memo(({ activeTab, setActiveTab, navigateToDashboard }) => {
  const { isMobile } = useResponsive();
  
  const navItems = useMemo(() => [
    {
      id: 'skills',
      title: 'Skills Management',
      icon: <MortarboardFill />,
      description: 'Manage what you teach and learn'
    },
    {
      id: 'profile',
      title: 'Profile Information',
      icon: <PersonFill />,
      description: 'Update your personal details'
    },
    {
      id: 'security',
      title: 'Security Settings',
      icon: <ShieldLockFill />,
      description: 'Enhance your account protection'
    },
    {
      id: 'view',
      title: 'Profile Preview',
      icon: <EyeFill />,
      description: 'See how others view your profile'
    }
  ], []);

  return (
    <StyledCard $isMobile={isMobile}>
      <Card.Body className="p-0">
        <Nav className="flex-column">
          {navItems.map(item => (
            <Nav.Item key={item.id}>
              <NavLink
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                className={activeTab === item.id ? 'active' : ''}
                role="button"
                aria-pressed={activeTab === item.id}
                $isMobile={isMobile}
              >
                <IconWrapper active={activeTab === item.id} $isMobile={isMobile}>
                  {item.icon}
                </IconWrapper>
                <ContentWrapper>
                  <Title active={activeTab === item.id} $isMobile={isMobile}>
                    {item.title}
                  </Title>
                  <Description active={activeTab === item.id}>
                    {item.description}
                  </Description>
                </ContentWrapper>
                {activeTab === item.id && (
                  <ChevronRight style={{ color: 'white' }} />
                )}
              </NavLink>
            </Nav.Item>
          ))}
          
          <Nav.Item>
            <DashboardButton
              onClick={navigateToDashboard}
              role="button"
              aria-label="Go to Dashboard"
              $isMobile={isMobile}
            >
              <IconWrapper active={false} $isMobile={isMobile}>
                <SpeeddometerFill />
              </IconWrapper>
              <ContentWrapper>
                <Title active={false} $isMobile={isMobile}>
                  Go to Dashboard
                </Title>
                <Description active={false}>
                  Return to main dashboard
                </Description>
              </ContentWrapper>
              <ChevronRight className="chevron-right" />
            </DashboardButton>
          </Nav.Item>
        </Nav>
      </Card.Body>
    </StyledCard>
  );
});

ProfileNavigation.displayName = 'ProfileNavigation';

export default ProfileNavigation;