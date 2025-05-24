// src/components/Leaderboard/index.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { ArrowLeft, Trophy } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { breakpoints } from '../../styles/breakpoints';
import useResponsive from '../../hooks/useResponsive';

// Import components
import LeaderboardTable from './LeaderboardTable';
import UserStatsCard from './UserStatsCard';
import AchievementGuide from './AchievementGuide';
import LeaderboardFilter from './LeaderboardFilters';
import LeaderboardHeader from './LeaderboardHeader';
import Pagination from './Pagination';

// Import utilities
import { fetchLeaderboardData, fetchUserRankData } from './utils/apiUtils';

// Performance optimized animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Mobile-optimized container
const ResponsiveContainer = styled(Container)`
  padding: ${props => props.$isMobile ? '1rem' : '1.5rem'};
  animation: ${fadeIn} 0.5s ease-out;
`;

// Optimized card component
const StyledCard = styled(Card)`
  border: none;
  border-radius: ${props => props.$isMobile ? '0.75rem' : '1rem'};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

// Optimized content wrapper
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$isMobile ? '1rem' : '1.5rem'};
`;

const Leaderboard = () => {
  // Navigation
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  
  // States
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [timeFrame, setTimeFrame] = useState('weekly');
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('points');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Memoized filter props
  const filterProps = useMemo(() => ({
    isScrolledDown,
    timeFrame,
    setTimeFrame,
    showFilters,
    setShowFilters,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    limit,
    setLimit,
    setPage
  }), [
    isScrolledDown,
    timeFrame,
    showFilters,
    category,
    searchQuery,
    limit
  ]);

  // Memoized table props
  const tableProps = useMemo(() => ({
    isLoading,
    error,
    leaderboardData,
    userRank,
    sortBy,
    sortDirection,
    searchQuery,
    setSearchQuery
  }), [
    isLoading,
    error,
    leaderboardData,
    userRank,
    sortBy,
    sortDirection,
    searchQuery
  ]);

  // Handle scroll event for sticky header
  const handleScroll = useCallback(() => {
    setIsScrolledDown(window.scrollY > 100);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Fetch leaderboard data
  const loadLeaderboardData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const result = await fetchLeaderboardData({
        timeFrame,
        category,
        page,
        limit,
        sortBy,
        sortDirection,
        searchQuery
      });
      
      setLeaderboardData(result.leaderboard);
      setTotalPages(result.totalPages);
      setError(result.error);
      
      // Fetch user's rank if not already fetched
      if (!userRank) {
        const userRankResult = await fetchUserRankData();
        if (userRankResult.success) {
          setUserRank(userRankResult.rank);
          setUserDetails(userRankResult.details);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [timeFrame, category, page, limit, sortBy, sortDirection, searchQuery, userRank]);

  useEffect(() => {
    loadLeaderboardData();
  }, [loadLeaderboardData]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      // Scroll to top of table on page change
      document.querySelector('.card')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [totalPages]);

  // Handle sort
  const handleSort = useCallback((column) => {
    setSortBy(column);
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    setPage(1);
  }, []);

  return (
    <ResponsiveContainer fluid $isMobile={isMobile}>
      <ContentWrapper $isMobile={isMobile}>
        <LeaderboardHeader />

        {/* User stats section if logged in */}
        {userRank && userDetails && (
          <UserStatsCard userRank={userRank} userDetails={userDetails} />
        )}
        
        {/* Leaderboard Panel */}
        <StyledCard $isMobile={isMobile}>
          <LeaderboardFilter {...filterProps} />
          
          <LeaderboardTable 
            {...tableProps}
            handleSort={handleSort}
          />
          
          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
            <Pagination 
              page={page}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          )}
        </StyledCard>
        
        {/* Achievement Guide Card */}
        <AchievementGuide />
      </ContentWrapper>
    </ResponsiveContainer>
  );
};

export default React.memo(Leaderboard);