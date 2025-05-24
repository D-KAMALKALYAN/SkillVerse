import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, InputGroup, Button, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useResponsive from '../../hooks/useResponsive';
import { 
  HiOutlineSearch, 
  HiOutlineAdjustments,
  HiOutlineLightningBolt,
  HiOutlineSparkles,
  HiOutlineChip
} from 'react-icons/hi';

const NavbarSearchDropdown = () => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    skillLevel: ''
  });
  const [showGlow, setShowGlow] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  // Memoize skill level options
  const skillLevels = React.useMemo(() => [
    { value: '', label: 'All Levels', icon: null },
    { value: 'Beginner', label: 'Beginner', icon: <HiOutlineLightningBolt className="text-info" /> },
    { value: 'Intermediate', label: 'Intermediate', icon: <HiOutlineSparkles className="text-warning" /> },
    { value: 'Expert', label: 'Expert', icon: <HiOutlineChip className="text-danger" /> }
  ], []);

  // Trigger initial animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Create glow effect when focused
  useEffect(() => {
    if (isActive) {
      setShowGlow(true);
    } else {
      const timer = setTimeout(() => setShowGlow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Memoize handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'query' && value.length > 0) {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 800);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams();
    
    if (searchParams.query) {
      queryParams.append('query', searchParams.query);
    }
    
    if (searchParams.skillLevel) {
      queryParams.append('skillLevel', searchParams.skillLevel);
    }
    
    navigate(`/search?${queryParams.toString()}`);
  }, [searchParams, navigate]);

  const handleSkillLevelSelect = useCallback((level) => {
    setSearchParams(prev => ({
      ...prev,
      skillLevel: level
    }));
  }, []);

  return (
    <Dropdown 
      onToggle={(isOpen) => {
        setIsActive(isOpen);
        if (isOpen && searchInputRef.current) {
          setTimeout(() => searchInputRef.current.focus(), 100);
        }
      }}
    >
      <Dropdown.Toggle 
        as={Button} 
        variant="transparent" 
        id="dropdown-search"
        className={`futuristic-search-toggle d-flex align-items-center justify-content-center position-relative ${pulseEffect ? 'pulse-animation' : ''}`}
        style={{
          borderRadius: '16px',
          height: isMobile ? '40px' : '42px',
          padding: isMobile ? '0 12px' : '0 18px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          background: isActive 
            ? 'linear-gradient(145deg, #ffffff, #f8fafc)' 
            : 'linear-gradient(145deg, #ffffff, #f1f5f9)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isActive 
            ? '0 0 20px rgba(59, 130, 246, 0.15)' 
            : '0 0 10px rgba(59, 130, 246, 0.1)'
        }}
      >
        <div className="search-icon-wrapper position-relative">
          <HiOutlineSearch 
            className={`search-icon ${isMobile ? "" : "me-2"}`} 
            size={isMobile ? 18 : 20}
            style={{
              color: 'rgba(59, 130, 246, 0.95)',
              filter: showGlow ? 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
          
          <div className="rings-container position-absolute">
            <div className={`ring ring-1 ${isActive ? 'active' : ''}`}></div>
            <div className={`ring ring-2 ${isActive ? 'active' : ''}`}></div>
          </div>
        </div>
        
        {!isMobile && (
          <span 
            className="search-text"
            style={{
              color: 'rgba(15, 23, 42, 0.95)',
              fontWeight: '500',
              fontSize: '0.95rem',
              letterSpacing: '0.3px',
              textShadow: showGlow ? '0 0 8px rgba(59, 130, 246, 0.3)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            Discover Skills
          </span>
        )}
        
        {showGlow && (
          <div 
            className="position-absolute glow-effect"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '16px',
              boxShadow: '0 0 20px 2px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2) inset',
              opacity: 0.8,
              pointerEvents: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu 
        className="futuristic-search-menu p-0 border-0"
        style={{ 
          width: isMobile ? '95vw' : '380px',
          maxWidth: isMobile ? '95vw' : '380px',
          background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.2)',
          marginTop: '12px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          transform: 'translateY(0)',
          opacity: 1,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        popperConfig={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 10],
              },
            },
          ],
        }}
      >
        <div className="futuristic-search-content p-4">
          <div 
            className="search-header mb-4 position-relative" 
            style={{
              borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
              paddingBottom: '12px',
            }}
          >
            <h6 
              className="m-0 d-flex align-items-center"
              style={{
                color: 'rgba(15, 23, 42, 0.95)',
                fontWeight: '600',
                fontSize: '1.1rem',
                letterSpacing: '0.5px'
              }}
            >
              <HiOutlineAdjustments 
                size={20} 
                className="me-2" 
                style={{ color: 'rgba(59, 130, 246, 0.95)' }}
              />
              Advanced Search
            </h6>
            <div 
              className="search-header-accent" 
              style={{
                position: 'absolute',
                bottom: '-1px',
                left: '0',
                width: '40%',
                height: '2px',
                background: 'linear-gradient(to right, rgba(59, 130, 246, 0.95), rgba(59, 130, 246, 0.1))'
              }}
            />
          </div>
          
          <Form onSubmit={handleSubmit} className="neo-form">
            <InputGroup 
              className="mb-4 search-input-group"
              style={{
                background: '#f8fafc',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2) inset, 0 4px 12px rgba(0, 0, 0, 0.05) inset'
              }}
            >
              <InputGroup.Text 
                id="search-addon"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0 0 0 16px'
                }}
              >
                <HiOutlineSearch 
                  size={20} 
                  style={{ color: 'rgba(59, 130, 246, 0.95)' }}
                />
              </InputGroup.Text>
              <Form.Control
                ref={searchInputRef}
                type="text"
                placeholder="Find skills or instructors..."
                name="query"
                value={searchParams.query}
                onChange={handleChange}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(15, 23, 42, 0.95)',
                  padding: '14px 16px',
                  fontSize: '1rem',
                  boxShadow: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className="futuristic-input"
              />
            </InputGroup>

            <Form.Group 
              className="mb-4 skill-level-group"
              style={{
                background: '#f8fafc',
                borderRadius: '14px',
                padding: '16px',
                boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2) inset, 0 4px 12px rgba(0, 0, 0, 0.05) inset'
              }}
            >
              <Form.Label 
                className="d-flex align-items-center mb-3"
                style={{
                  color: 'rgba(15, 23, 42, 0.95)',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                  letterSpacing: '0.5px'
                }}
              >
                <HiOutlineLightningBolt size={18} className="me-2" style={{ color: 'rgba(59, 130, 246, 0.95)' }} />
                Skill Level
              </Form.Label>
              
              <div 
                className="skill-level-options d-flex flex-wrap gap-3"
                style={{
                  marginTop: '8px'
                }}
              >
                {skillLevels.map(({ value, label, icon }) => (
                  <Button
                    key={value || 'all'}
                    variant="transparent"
                    className={`skill-level-btn d-flex align-items-center ${searchParams.skillLevel === value ? 'active' : ''}`}
                    style={{
                      background: searchParams.skillLevel === value 
                        ? 'rgba(59, 130, 246, 0.1)' 
                        : '#ffffff',
                      color: searchParams.skillLevel === value 
                        ? 'rgba(15, 23, 42, 0.95)' 
                        : 'rgba(15, 23, 42, 0.7)',
                      border: `1px solid ${searchParams.skillLevel === value 
                        ? 'rgba(59, 130, 246, 0.4)' 
                        : 'rgba(59, 130, 246, 0.2)'}`,
                      borderRadius: '12px',
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: searchParams.skillLevel === value 
                        ? '0 0 12px rgba(59, 130, 246, 0.2)' 
                        : 'none'
                    }}
                    onClick={() => handleSkillLevelSelect(value)}
                  >
                    {label}
                    {icon && <span className="ms-2">{icon}</span>}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 search-submit-btn"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: 'none',
                borderRadius: '14px',
                padding: '12px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <span 
                className="d-flex align-items-center justify-content-center gap-2"
                style={{
                  position: 'relative',
                  zIndex: 2,
                  fontSize: '1rem',
                  color: '#ffffff'
                }}
              >
                <HiOutlineSearch size={20} />
                Search
              </span>
              
              <div 
                className="button-glow"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)',
                  opacity: 0.8,
                  zIndex: 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </Button>
          </Form>
        </div>
      </Dropdown.Menu>

      <style jsx="true">{`
        .futuristic-search-toggle:hover {
          border-color: rgba(59, 130, 246, 0.5) !important;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.2) !important;
          transform: translateY(-1px);
        }
        
        .futuristic-search-toggle:active {
          transform: translateY(1px);
        }
        
        .futuristic-input::placeholder {
          color: rgba(15, 23, 42, 0.6);
        }
        
        .futuristic-input:focus {
          box-shadow: none !important;
          background: #ffffff !important;
        }
        
        .search-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${isMobile ? '24px' : '26px'};
          height: ${isMobile ? '24px' : '26px'};
          position: relative;
        }
        
        .rings-container {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .ring {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          border: 1px solid rgba(59, 130, 246, 0.3);
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.5);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .ring-1 {
          width: 160%;
          height: 160%;
        }
        
        .ring-2 {
          width: 220%;
          height: 220%;
          border-color: rgba(59, 130, 246, 0.2);
        }
        
        .ring.active {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
        
        .pulse-animation {
          animation: pulse-search 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        
        @keyframes pulse-search {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        
        .search-submit-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
          border: none !important;
        }
        
        .search-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3) !important;
          background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
        }
        
        .search-submit-btn:active {
          transform: translateY(1px);
          background: linear-gradient(135deg, #1d4ed8, #1e40af) !important;
        }
        
        .skill-level-btn {
          background: #ffffff !important;
          border: 1px solid rgba(59, 130, 246, 0.2) !important;
          color: rgba(15, 23, 42, 0.7) !important;
        }
        
        .skill-level-btn:hover {
          background: rgba(59, 130, 246, 0.1) !important;
          border-color: rgba(59, 130, 246, 0.4) !important;
          color: rgba(15, 23, 42, 0.95) !important;
          transform: translateY(-1px);
        }
        
        .skill-level-btn.active {
          background: rgba(59, 130, 246, 0.1) !important;
          border-color: rgba(59, 130, 246, 0.4) !important;
          color: rgba(15, 23, 42, 0.95) !important;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.2) !important;
        }
        
        .skill-level-btn:active {
          transform: translateY(1px);
          background: rgba(59, 130, 246, 0.15) !important;
        }
        
        .form-control:focus {
          color: rgba(15, 23, 42, 0.95) !important;
        }
        
        @media (max-width: 768px) {
          .skill-level-options {
            justify-content: space-between;
            gap: 8px !important;
          }
          
          .skill-level-btn {
            flex: 1;
            min-width: calc(50% - 4px);
            justify-content: center;
            padding: 6px 12px !important;
          }
        }

        @media (max-width: 576px) {
          .futuristic-search-toggle {
            padding: 0 12px !important;
            height: 38px !important;
          }

          .search-icon {
            margin-right: 0 !important;
            size: 16px !important;
          }

          .skill-level-btn {
            font-size: 0.8rem !important;
            padding: 6px 10px !important;
          }

          .futuristic-search-content {
            padding: 1rem !important;
          }
        }
      `}</style>
    </Dropdown>
  );
};

export default NavbarSearchDropdown;