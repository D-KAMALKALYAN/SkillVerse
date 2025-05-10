import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { 
  ClipboardCheck, 
  Inbox, 
  CheckCircle, 
  ArrowRight 
} from 'react-bootstrap-icons';

// Import the apiConfig and apiClient to leverage their features
import apiConfig from '../../path/to/apiConfig';
import apiClient, { getErrorMessage } from '../../path/to/apiClient';

/**
 * AssessmentStats Component
 * 
 * Displays statistics for assessments with improved API handling
 * and error management using the shared API utilities.
 * 
 * @param {Object} props - Component props
 * @param {string} props.skillId - Optional skill ID to filter stats
 */
const AssessmentStats = ({ skillId }) => {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    pendingSubmissions: 0,
    totalCompletedSessions: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log('Fetching stats for skillId:', skillId || 'general');
        
        // Ensure API is initialized
        if (!apiConfig.isInitialized) {
          await apiConfig.initialize();
        }
        
        // Determine the correct endpoint based on presence of skillId
        const endpoint = skillId 
          ? `/api/assessments/${skillId}/assessment-stats` 
          : '/api/assessments/general-stats';
        
        console.log('Using endpoint:', endpoint);
        
        // Use apiClient which handles auth tokens automatically
        const response = await apiClient.get(endpoint);

        console.log('Response received:', response.data);

        if (response.data && response.data.success) {
          // Check if stats exist in the response
          if (response.data.stats) {
            console.log('Stats received:', response.data.stats);
            
            // Map backend field names to component expected names
            // Check each field individually to handle undefined values
            const mappedStats = {
              totalAssessments: response.data.stats.totalAssessments || 0,
              pendingSubmissions: response.data.stats.pendingSubmissions || 0,
              // Look for both possible field names
              totalCompletedSessions: response.data.stats.completedSubmissions || 
                                    response.data.stats.totalCompletedSessions || 0,
              averageScore: response.data.stats.averageScore || 0
            };
            
            console.log('Mapped stats:', mappedStats);
            setStats(mappedStats);
          } else {
            console.error('No stats property found in response data:', response.data);
            setError('No statistics data found in server response');
          }
        } else {
          throw new Error(response.data?.message || 'Failed to fetch stats');
        }
      } catch (err) {
        console.error('Error fetching assessment stats:', err);
        
        // Use the getErrorMessage utility to get a user-friendly error message
        setError(getErrorMessage(err));
        
        // Additional logging for debugging
        if (!apiConfig.isProduction) {
          if (err.response) {
            console.error('Server error response:', err.response.data);
            console.error('Status code:', err.response.status);
          } else if (err.request) {
            console.error('No response received:', err.request);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [skillId]); // Re-fetch when skillId changes

  // Function to format stats safely
  const formatStat = (value, isPercentage = false) => {
    if (value === null || value === undefined) return isPercentage ? '0%' : '0';
    if (isPercentage) {
      // Format as percentage with one decimal place
      return `${parseFloat(value).toFixed(1)}%`;
    }
    return value.toString();
  };

  const statItems = [
    {
      title: "Total Assessments",
      value: formatStat(stats.totalAssessments),
      icon: <ClipboardCheck />,
      color: "#4f46e5",
      bgColor: "rgba(79, 70, 229, 0.1)"
    },
    {
      title: "Pending Review",
      value: formatStat(stats.pendingSubmissions),
      icon: <Inbox />,
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)"
    },
    {
      title: "Teaching Sessions",
      value: formatStat(stats.totalCompletedSessions),
      icon: <CheckCircle />,
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.1)"
    },
    {
      title: "Avg. Score",
      value: formatStat(stats.averageScore, true),
      icon: <ArrowRight />,
      color: "#06b6d4",
      bgColor: "rgba(6, 182, 212, 0.1)"
    }
  ];

  if (loading) {
    return <div className="text-center p-4">Loading statistics...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-danger">
        <p>Error loading statistics</p>
        <small>{error}</small>
      </div>
    );
  }

  return (
    <Row className="g-3">
      {statItems.map((item, index) => (
        <Col xs={6} md={3} key={index}>
          <div className="p-3 rounded-4" style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: 'rgba(255, 255, 255, 0.2)'
                  }}>
                {item.icon}
              </div>
              <span className="text-white-50 small">{item.title}</span>
            </div>
            <h3 className="fw-bold mb-0 text-white">{item.value}</h3>
          </div>
        </Col>
      ))}
    </Row>
  );
};

export default AssessmentStats;