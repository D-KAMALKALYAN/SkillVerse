import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Card, Alert, Row, Col, InputGroup, Accordion, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiConfig from '../config/apiConfig';
import { getErrorMessage } from '../config/apiConfig';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaGlobe, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

// List of countries for the dropdown
const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "India",
  "Germany", "France", "Japan", "China", "Brazil", "Mexico", "Spain",
  "Italy", "Netherlands", "Sweden", "South Korea", "Russia", "Other"
];

// Enhanced list of security questions
const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "In what city were you born?",
  "What is your mother's maiden name?",
  "What high school did you attend?",
  "What was the make of your first car?",
  "What was your childhood nickname?",
  "What is the name of your favorite childhood friend?",
  "What street did you grow up on?",
  "What was your first phone number?",
  "What was the name of your first teacher?",
  "What is your favorite book?",
  "What is the name of the place your wedding reception was held?",
  "What is the name of your favorite movie?",
  "What was your first job?",
  "What is your father's middle name?"
];

// Password validation regex
const PASSWORD_REGEX = {
  minLength: /.{8,}/,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    securityQuestions: [
      { question: SECURITY_QUESTIONS[0], answer: '' },
      { question: SECURITY_QUESTIONS[1], answer: '' }
    ]
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiHealthy, setApiHealthy] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  // Check API health on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const isHealthy = await apiConfig.checkHealth();
        setApiHealthy(isHealthy);
        
        if (!isHealthy) {
          setMessage({
            type: 'warning',
            text: 'We are experiencing connectivity issues with our servers. Please try again later or check your internet connection.'
          });
        }
      } catch (error) {
        console.error('API health check failed:', error);
        setApiHealthy(false);
        setMessage({
          type: 'warning',
          text: 'Unable to connect to our servers. Please try again later.'
        });
      }
    };
    
    checkApiHealth();
  }, []);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) {
      return { score: 0, feedback: [] };
    }

    let score = 0;
    const feedback = [];

    if (PASSWORD_REGEX.minLength.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should be at least 8 characters');
    }

    if (PASSWORD_REGEX.hasUpperCase.test(password)) {
      score += 1;
    } else {
      feedback.push('Include at least one uppercase letter');
    }

    if (PASSWORD_REGEX.hasLowerCase.test(password)) {
      score += 1;
    } else {
      feedback.push('Include at least one lowercase letter');
    }

    if (PASSWORD_REGEX.hasNumber.test(password)) {
      score += 1;
    } else {
      feedback.push('Include at least one number');
    }

    if (PASSWORD_REGEX.hasSpecialChar.test(password)) {
      score += 1;
    } else {
      feedback.push('Include at least one special character');
    }

    return { score, feedback };
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    setPasswordStrength(checkPasswordStrength(password));
  };

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'danger', text: 'Please enter a valid email address.' });
      return false;
    }

    // Password matching validation
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'danger', text: 'Passwords do not match. Please ensure both passwords are identical.' });
      return false;
    }

    // Password strength validation
    if (passwordStrength.score < 3) {
      setMessage({ 
        type: 'danger', 
        text: 'Please create a stronger password. ' + passwordStrength.feedback.join('. ')
      });
      return false;
    }

    // Required fields validation
    if (!formData.name.trim() || !formData.country) {
      setMessage({ type: 'danger', text: 'Please fill in all required fields.' });
      return false;
    }

    // Security questions validation
    const hasEmptyAnswers = formData.securityQuestions.some(q => !q.answer.trim());
    if (hasEmptyAnswers) {
      setMessage({ type: 'danger', text: 'Please answer all security questions. They are required for account recovery.' });
      return false;
    }

    // Duplicate security questions validation
    const questions = formData.securityQuestions.map(q => q.question);
    if (new Set(questions).size !== questions.length) {
      setMessage({ type: 'danger', text: 'Please select different security questions. Duplicate questions are not allowed.' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiHealthy) {
      setMessage({ 
        type: 'warning', 
        text: 'Unable to connect to our servers. Please check your internet connection and try again.' 
      });
      return;
    }

    // Clear previous messages
    setMessage({ type: '', text: '' });
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Use apiConfig.client instead of direct API call
      const response = await apiConfig.client.post(apiConfig.ENDPOINTS.AUTH.REGISTER, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        securityQuestions: formData.securityQuestions
      });

      if (response.data) {
        login(response.data);
        setMessage({ 
          type: 'success', 
          text: 'Account created successfully! Redirecting to login...' 
        });
        
        // Simulate a delay to show success message
        setTimeout(() => navigate('/login'), 1500);
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setMessage({ type: 'danger', text: errorMsg });
      
      // Log error for debugging
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.securityQuestions];
    updatedQuestions[index][field] = value;
    setFormData({
      ...formData,
      securityQuestions: updatedQuestions
    });
  };

  const addSecurityQuestion = () => {
    if (formData.securityQuestions.length >= 3) {
      setMessage({ 
        type: 'warning', 
        text: 'Maximum of 3 security questions allowed.' 
      });
      return;
    }

    // Find an unused question
    const usedQuestions = formData.securityQuestions.map(q => q.question);
    const unusedQuestion = SECURITY_QUESTIONS.find(q => !usedQuestions.includes(q));

    if (unusedQuestion) {
      setFormData({
        ...formData,
        securityQuestions: [
          ...formData.securityQuestions,
          { question: unusedQuestion, answer: '' }
        ]
      });
    }
  };

  const removeSecurityQuestion = (index) => {
    if (formData.securityQuestions.length <= 2) {
      setMessage({ 
        type: 'warning', 
        text: 'At least 2 security questions are required.' 
      });
      return;
    }

    const updatedQuestions = [...formData.securityQuestions];
    updatedQuestions.splice(index, 1);
    setFormData({
      ...formData,
      securityQuestions: updatedQuestions
    });
  };

  const formFields = [
    { 
      id: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your full name',
      icon: <FaUser className="text-primary" />
    },
    { 
      id: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email',
      icon: <FaEnvelope className="text-primary" />
    },
    { 
      id: 'country',
      label: 'Country',
      type: 'select',
      placeholder: 'Select your country',
      icon: <FaGlobe className="text-primary" />,
      options: COUNTRIES
    },
    { 
      id: 'password',
      label: 'Password',
      type: showPassword ? 'text' : 'password',
      placeholder: 'Create a strong password',
      icon: <FaLock className="text-primary" />,
      toggleIcon: showPassword ? 
        <FaEyeSlash className="text-muted" onClick={() => setShowPassword(!showPassword)} /> : 
        <FaEye className="text-muted" onClick={() => setShowPassword(!showPassword)} />,
      onChange: handlePasswordChange
    },
    { 
      id: 'confirmPassword',
      label: 'Confirm Password',
      type: showConfirmPassword ? 'text' : 'password',
      placeholder: 'Confirm your password',
      icon: <FaLock className="text-primary" />,
      toggleIcon: showConfirmPassword ? 
        <FaEyeSlash className="text-muted" onClick={() => setShowConfirmPassword(!showConfirmPassword)} /> : 
        <FaEye className="text-muted" onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
    }
  ];

  // Password strength indicator
  const renderPasswordStrength = () => {
    if (!formData.password) return null;
    
    const getStrengthLabel = () => {
      if (passwordStrength.score === 0) return 'Very Weak';
      if (passwordStrength.score === 1) return 'Weak';
      if (passwordStrength.score === 2) return 'Fair';
      if (passwordStrength.score === 3) return 'Good';
      if (passwordStrength.score === 4) return 'Strong';
      return 'Very Strong';
    };
    
    const getStrengthColor = () => {
      if (passwordStrength.score <= 1) return 'danger';
      if (passwordStrength.score === 2) return 'warning';
      if (passwordStrength.score === 3) return 'info';
      return 'success';
    };
    
    return (
      <div className="mt-2">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <small>Password Strength: <span className={`text-${getStrengthColor()}`}>{getStrengthLabel()}</span></small>
        </div>
        <div className="progress" style={{ height: '5px' }}>
          <div 
            className={`progress-bar bg-${getStrengthColor()}`} 
            role="progressbar" 
            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
            aria-valuenow={(passwordStrength.score / 5) * 100}
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>
        {passwordStrength.feedback.length > 0 && (
          <ul className="ps-3 mt-1 mb-0" style={{ fontSize: '0.75rem' }}>
            {passwordStrength.feedback.map((tip, index) => (
              <li key={index} className="text-muted">{tip}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="register-page bg-light">
      <Container fluid>
        <Row className="vh-100">
          {/* Left side - Image and info */}
          <Col md={6} lg={7} xl={8} className="d-none d-md-flex align-items-center">
            <div className="position-relative w-100 h-100">
              <div 
                className="position-absolute w-100 h-100 bg-primary"
                style={{
                  backgroundImage: 'url(https://source.unsplash.com/random/1200x900/?skills,teaching)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  clipPath: 'polygon(0 0, 90% 0, 100% 100%, 0 100%)',
                }}
              ></div>
              <div 
                className="position-absolute w-100 h-100"
                style={{
                  background: 'linear-gradient(135deg, rgba(65, 88, 208, 0.8) 0%, rgba(200, 80, 192, 0.8) 46%, rgba(255, 204, 112, 0.8) 100%)',
                  clipPath: 'polygon(0 0, 90% 0, 100% 100%, 0 100%)',
                }}
              ></div>
              <div className="position-absolute top-50 start-50 translate-middle text-white text-center" style={{ width: '80%' }}>
                <h2 className="display-4 fw-bold mb-4">Join Our Community</h2>
                <p className="lead mb-4">Share your knowledge and expertise with others while gaining new skills from talented individuals.</p>
                <div className="d-flex justify-content-center">
                  <div className="px-4 py-3 bg-white bg-opacity-10 rounded-3 backdrop-blur-sm">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <div className="display-6 fw-bold">500+</div>
                        <div className="small">Skills exchanged</div>
                      </div>
                      <div className="vr bg-white opacity-25 mx-3 h-100"></div>
                      <div>
                        <div className="display-6 fw-bold">10k+</div>
                        <div className="small">Active members</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Right side - Registration form */}
          <Col md={6} lg={5} xl={4} className="d-flex align-items-center">
            <Container className="py-5">
              <div className="text-center mb-5">
                <h1 className="fw-bold text-primary">SkillBarter</h1>
                <p className="text-muted">Exchange skills, grow together</p>
              </div>

              {!apiHealthy && (
                <Alert variant="warning" className="mb-4">
                  <div className="d-flex align-items-center">
                    <FaExclamationTriangle className="me-2" />
                    <div>
                      <strong>Connection Issue</strong>
                      <div>We're having trouble connecting to our servers. Please check your internet connection.</div>
                    </div>
                  </div>
                </Alert>
              )}

              <Card className="border-0 shadow-sm rounded-3">
                <Card.Body className="p-4 p-md-5">
                  <h2 className="text-center mb-4 fw-bold">Create Account</h2>
                  
                  {message.text && (
                    <Alert 
                      variant={message.type} 
                      className="text-center animate__animated animate__fadeIn"
                    >
                      {message.text}
                    </Alert>
                  )}
                  
                  <Form onSubmit={handleSubmit}>
                    {formFields.map((field) => (
                      <Form.Group className="mb-4" controlId={field.id} key={field.id}>
                        <Form.Label>{field.label}</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light">
                            {field.icon}
                          </InputGroup.Text>
                          {field.type === 'select' ? (
                            <Form.Select
                              placeholder={field.placeholder}
                              value={formData[field.id]}
                              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                              required
                              className="py-2"
                            >
                              <option value="">Select your country</option>
                              {field.options.map((option, idx) => (
                                <option key={idx} value={option}>{option}</option>
                              ))}
                            </Form.Select>
                          ) : (
                            <Form.Control
                              type={field.type}
                              placeholder={field.placeholder}
                              value={formData[field.id]}
                              onChange={field.onChange || ((e) => setFormData({ ...formData, [field.id]: e.target.value }))}
                              required
                              className="py-2"
                            />
                          )}
                          {field.toggleIcon && (
                            <InputGroup.Text 
                              className="bg-light cursor-pointer"
                              style={{ cursor: 'pointer' }}
                            >
                              {field.toggleIcon}
                            </InputGroup.Text>
                          )}
                        </InputGroup>
                        {field.id === 'password' && renderPasswordStrength()}
                      </Form.Group>
                    ))}

                    {/* Security Questions Section */}
                    <Accordion className="mb-4" defaultActiveKey="0">
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>
                          <div className="d-flex align-items-center">
                            <FaShieldAlt className="text-primary me-2" />
                            <span>Security Questions (Required)</span>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          <p className="text-muted small mb-3">
                            Security questions help you recover your account if you forget your password.
                            Choose questions you can easily remember but others cannot guess.
                          </p>
                          
                          {formData.securityQuestions.map((q, index) => (
                            <div key={index} className="mb-3 pb-3 border-bottom">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0">Question {index + 1}</h6>
                                {index >= 2 && (
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => removeSecurityQuestion(index)}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                              
                              <Form.Group className="mb-2">
                                <Form.Label>Select Question</Form.Label>
                                <Form.Select
                                  value={q.question}
                                  onChange={(e) => handleSecurityQuestionChange(index, 'question', e.target.value)}
                                  required
                                >
                                  {SECURITY_QUESTIONS.map((question, qIdx) => (
                                    <option key={qIdx} value={question}>{question}</option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                              
                              <Form.Group>
                                <Form.Label>Answer</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={q.answer}
                                  onChange={(e) => handleSecurityQuestionChange(index, 'answer', e.target.value)}
                                  placeholder="Your answer"
                                  required
                                />
                                <Form.Text muted>
                                  Remember your answer exactly as typed.
                                </Form.Text>
                              </Form.Group>
                            </div>
                          ))}
                          
                          {formData.securityQuestions.length < 3 && (
                            <div className="d-grid mt-3">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={addSecurityQuestion}
                              >
                                Add Another Question (Optional)
                              </Button>
                            </div>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>

                    <div className="d-grid mb-4">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="lg" 
                        className="py-2"
                        disabled={loading || !apiHealthy}
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            Create Account <FaUserPlus className="ms-2" />
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="text-center">
                      <span className="text-muted">Already have an account?</span>{' '}
                      <Link to="/login" className="text-primary fw-bold text-decoration-none">
                        Login
                      </Link>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
              
              <div className="mt-4 text-center small text-muted">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-decoration-none">Terms of Service</Link> and{' '}
                <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>
              </div>
            </Container>
          </Col>
        </Row>
      </Container>

      {/* Custom CSS */}
      <style jsx>{`
        .register-page {
          min-height: 100vh;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .bg-opacity-10 {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
};

export default Register;