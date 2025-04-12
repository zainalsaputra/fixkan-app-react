import { useState, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import { LinearProgress, linearProgressClasses } from '@mui/material';

import { fetchReports } from 'src/utils/reports-services';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { PostItem } from '../post-item';
import { PostSort } from '../post-sort';
import { PostSearch } from '../post-search';

import type { IPostItem } from '../post-item';

// ----------------------------------------------------------------------

export function BlogView() {
  const [posts, setPosts] = useState<IPostItem[]>([]);
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const postsPerPage = 7;

  const TTL = 60 * 1000;

  useEffect(() => {
    const getReports = async () => {
      try {
        const cached = localStorage.getItem('reports');
        const cachedTime = localStorage.getItem('reports_timestamp');

        const now = Date.now();
        const isExpired = !cachedTime || now - Number(cachedTime) > TTL;

        if (cached && !isExpired) {
          setPosts(JSON.parse(cached));
          return;
        }

        const data = await fetchReports();
        setPosts(data);
        localStorage.setItem('reports', JSON.stringify(data));
        localStorage.setItem('reports_timestamp', now.toString());
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getReports();
  }, []);


  // Filter by search
  const filteredPosts = posts.filter((post) =>
    post.type_report.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    if (sortBy === 'latest') return dateB - dateA;
    if (sortBy === 'oldest') return dateA - dateB;
    return 0;
  });


  // Paginate
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const currentPosts = sortedPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  // Handle Loading
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LinearProgress
          sx={{
            width: 1,
            maxWidth: 320,
            bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
            [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
          }}
        />
      </Box>
    );
  }

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Blog
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          New post
        </Button>
      </Box>

      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <PostSearch
          posts={posts}
          onSearch={(query: string) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
        />

        <PostSort
          sortBy={sortBy}
          onSort={(value) => setSortBy(value)}
          options={[
            { value: 'latest', label: 'Latest' },
            { value: 'oldest', label: 'Oldest' },
          ]}
        />
      </Box>

      <Grid container spacing={3}>
        {currentPosts.map((post, index) => {
          const latestPostLarge = index === 0;
          const latestPost = index === 1 || index === 2;

          return (
            <Grid
              key={post.id}
              size={{
                xs: 12,
                sm: latestPostLarge ? 12 : 6,
                md: latestPostLarge ? 6 : 3,
              }}
            >
              <PostItem
                post={post}
                latestPost={latestPost}
                latestPostLarge={latestPostLarge}
              />
            </Grid>
          );
        })}
      </Grid>

      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(e, value) => setCurrentPage(value)}
        color="primary"
        sx={{ mt: 8, mx: 'auto', display: 'flex', justifyContent: 'center' }}
      />
    </DashboardContent>
  );
}
