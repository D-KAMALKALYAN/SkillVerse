import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import SecurityQuestionsForm from '../SecurityQuestionsForm';
import { ShieldLockFill, X } from 'react-bootstrap-icons';
import styled from 'styled-components';

const StyledModal = styled(Modal)`
  .modal-content {
    border: none;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  @media (max-width: 767.98px) {
    .modal-content {
      border-radius: 0.75rem;
      margin: 0.5rem;
    }
  }
`;

const ModalHeaderWrapper = styled.div`
  position: relative;
  background: linear-gradient(135deg, #0b1437 0%, #1a237e 100%);
  padding: 1.25rem 1.5rem 1rem;
  color: white;
  overflow: hidden;

  @media (max-width: 767.98px) {
    padding: 1rem 1.25rem 0.75rem;
  }
`;

const DecorativeCircle = styled.div`
  position: absolute;
  border-radius: 50%;
  background: ${props => props.gradient};
  opacity: ${props => props.opacity};
  filter: blur(8px);
`;

const TopRightCircle = styled(DecorativeCircle)`
  top: -20px;
  right: -20px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);

  @media (max-width: 767.98px) {
    width: 100px;
    height: 100px;
    top: -10px;
    right: -10px;
  }
`;

const BottomLeftCircle = styled(DecorativeCircle)`
  bottom: -20px;
  left: 10%;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(64,115,255,0.2) 0%, rgba(64,115,255,0) 70%);

  @media (max-width: 767.98px) {
    width: 80px;
    height: 80px;
    bottom: -10px;
    left: 5%;
  }
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  margin-right: 1rem;

  @media (max-width: 767.98px) {
    width: 36px;
    height: 36px;
    margin-right: 0.875rem;
  }

  svg {
    width: 20px;
    height: 20px;
    color: white;

    @media (max-width: 767.98px) {
      width: 18px;
      height: 18px;
    }
  }
`;

const CloseButton = styled(Button)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem;
  color: white;
  background: none;
  border: none;
  opacity: 0.8;
  transition: all 0.2s ease;
  z-index: 5;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  @media (max-width: 767.98px) {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.375rem;
  }
`;

const ModalTitle = styled.h4`
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.5px;
  font-size: 1.25rem;
  display: flex;
  align-items: center;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ModalSubtitle = styled.p`
  margin: 0.5rem 0 0;
  opacity: 0.8;
  font-size: 0.875rem;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const ModalBodyWrapper = styled(Modal.Body)`
  padding: 1.5rem;

  @media (max-width: 767.98px) {
    padding: 1.25rem;
  }
`;

const SecurityQuestionsModal = ({ 
  show, 
  onHide, 
  securityQuestions, 
  onSecurityQuestionChange, 
  onSubmit, 
  error 
}) => {
  return (
    <StyledModal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
      aria-labelledby="security-questions-modal"
    >
      <ModalHeaderWrapper>
        <TopRightCircle />
        <BottomLeftCircle />
        
        <ModalTitle id="security-questions-modal">
          <IconWrapper>
            <ShieldLockFill />
          </IconWrapper>
          Set Security Questions
        </ModalTitle>
        <ModalSubtitle>
          Enhance your account recovery options
        </ModalSubtitle>
        
        <CloseButton 
          onClick={onHide}
          aria-label="Close modal"
        >
          <X size={24} />
        </CloseButton>
      </ModalHeaderWrapper>

      <ModalBodyWrapper>
        <SecurityQuestionsForm 
          securityQuestions={securityQuestions}
          onSecurityQuestionChange={onSecurityQuestionChange}
          onSubmit={onSubmit}
          error={error}
        />
      </ModalBodyWrapper>

      <style>
        {`
        .form-control:focus, .form-select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25) !important;
        }

        .form-control, .form-select {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;

          @media (min-width: 768px) {
            padding: 0.875rem 1.25rem;
            font-size: 1rem;
          }

          &:hover {
            border-color: #cbd5e1;
          }
        }

        .form-label {
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #1e293b;
          font-size: 0.875rem;

          @media (min-width: 768px) {
            font-size: 1rem;
          }
        }

        .btn {
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          border-radius: 0.5rem;
          transition: all 0.2s ease;

          @media (min-width: 768px) {
            padding: 0.875rem 1.75rem;
          }
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
          }
        }

        .btn-outline-secondary {
          border-color: #e2e8f0;
          color: #64748b;

          &:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
            color: #475569;
          }
        }

        .alert {
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border: none;
          font-size: 0.875rem;

          @media (min-width: 768px) {
            padding: 1.25rem;
            font-size: 1rem;
          }
        }

        .alert-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #b91c1c;
        }

        .alert-success {
          background: rgba(16, 185, 129, 0.1);
          color: #047857;
        }
        `}
      </style>
    </StyledModal>
  );
};

export default SecurityQuestionsModal;