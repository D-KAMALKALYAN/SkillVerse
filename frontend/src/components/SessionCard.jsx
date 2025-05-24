import React from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { CalendarCheck, PersonFill, ChevronRight } from 'react-bootstrap-icons';

const SessionCard = React.memo(({ session, formatDateTime, onViewDetails }) => {
  return (
    <Card 
      className="border-0 shadow-sm rounded-4 overflow-hidden session-card"
      onClick={onViewDetails}
    >
      <Card.Body className="p-0">
        <Row className="g-0">
          {/* Status Indicator */}
          <Col xs="auto">
            <div 
              className="status-indicator"
              style={{ background: session.statusInfo.color }}
            />
          </Col>
          
          {/* Session Details */}
          <Col>
            <div className="p-3">
              <Row className="align-items-center">
                {/* Left section: Status and Title */}
                <Col xs={12} md={4} className="mb-3 mb-md-0">
                  <div className="d-flex align-items-center mb-2">
                    <div 
                      className="status-icon me-2"
                      style={{ 
                        background: session.statusInfo.bgColor,
                        color: session.statusInfo.color
                      }}
                    >
                      {session.statusInfo.icon}
                    </div>
                    <Badge 
                      className="status-badge rounded-pill px-3 py-2"
                      style={{ 
                        background: session.statusInfo.bgColor,
                        color: session.statusInfo.color,
                        border: `1px solid ${session.statusInfo.borderColor}`,
                      }}
                    >
                      {session.statusInfo.status}
                    </Badge>
                  </div>
                  <h5 className="session-title fw-bold mb-0">
                    {session.title || `${session.skillName || 'Skill'} Session`}
                  </h5>
                </Col>
                
                {/* Middle section: Date/Time and Person */}
                <Col xs={12} md={5} className="mb-3 mb-md-0">
                  <div className="d-flex flex-column flex-md-row">
                    <div className="me-md-4 mb-2 mb-md-0">
                      <div className="text-muted small mb-1">Date & Time</div>
                      <div className="d-flex align-items-center">
                        <CalendarCheck className="me-2 text-primary" />
                        <div>{formatDateTime(session.startTime)}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted small mb-1">With</div>
                      <div className="d-flex align-items-center">
                        <PersonFill className="me-2 text-primary" />
                        <div>{session.otherPerson}</div>
                      </div>
                    </div>
                  </div>
                </Col>
                
                {/* Right section: Role and Action */}
                <Col xs={12} md={3} className="d-flex align-items-center justify-content-between justify-content-md-end">
                  <div className="d-flex align-items-center">
                    <div 
                      className="role-icon me-2"
                      style={{ 
                        background: `rgba(${session.roleInfo.role === 'Teacher' ? '59, 130, 246' : '6, 182, 212'}, 0.1)`,
                        color: session.roleInfo.color
                      }}
                    >
                      {session.roleInfo.icon}
                    </div>
                    <span className="role-text" style={{ color: session.roleInfo.color }}>
                      {session.roleInfo.role}
                    </span>
                  </div>
                  <Button 
                    variant="light" 
                    className="action-button rounded-circle ms-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails();
                    }}
                  >
                    <ChevronRight />
                  </Button>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
});

SessionCard.displayName = 'SessionCard';

export default SessionCard; 