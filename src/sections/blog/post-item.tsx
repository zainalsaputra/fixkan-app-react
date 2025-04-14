import type { CardProps } from '@mui/material/Card';
import type { IconifyName } from 'src/components/iconify';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components/router-link';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

export type IPostItem = {
  id: string;
  userId: string;
  type_report: string;
  description: string;
  province: string;
  district: string;
  subdistrict: string;
  createdAt: string;
  image: string;
};

export function PostItem({
  sx,
  post,
  latestPost,
  latestPostLarge,
  ...other
}: CardProps & {
  post: IPostItem;
  latestPost: boolean;
  latestPostLarge: boolean;
}) {

  const capitalizeWords = (str?: string) => {
    if (!str?.trim()) return '-';
    return str
      .toLowerCase()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderAvatar = (
    <Avatar
      alt={post.userId}
      src={`/assets/images/avatar/avatar-${Math.floor(Math.random() * 25) + 1}.webp`}
      sx={{
        left: 24,
        zIndex: 9,
        bottom: -24,
        position: 'absolute',
        ...((latestPostLarge || latestPost) && {
          top: 24,
        }),
      }}
    />
  );

  const renderTitle = (
    <Link
      component={RouterLink as any}
      to={`/report/${post.id}`}
      color="inherit"
      variant="subtitle2"
      underline="hover"
      sx={{
        height: 44,
        overflow: 'hidden',
        WebkitLineClamp: 2,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        ...(latestPostLarge && { typography: 'h5', height: 60 }),
        ...((latestPostLarge || latestPost) && {
          color: 'common.white',
        }),
      }}
    >
      {post.type_report}
    </Link>
  );

  const renderDescription = (
    <Typography
      variant="body2"
      sx={{
        mt: 0,
        color: 'text.secondary',
        ...((latestPostLarge || latestPost) && {
          color: 'common.white',
          opacity: 0.64,
        }),
      }}
    >
      {post.description.length > 99
        ? post.description.slice(0, 99) + '...'
        : post.description}
    </Typography>
  );


  const renderInfo = (
    <Box
      sx={{
        mt: 3,
        gap: 1.5,
        display: 'flex',
        flexWrap: 'wrap',
        color: 'text.disabled',
        justifyContent: 'flex-end',
      }}
    >
      {[
        { number: capitalizeWords(post.province), icon: 'solar:map-point-bold' },
        { number: capitalizeWords(post.district), icon: 'solar:map-bold' },
        { number: capitalizeWords(post.subdistrict), icon: 'solar:city-bold' },
      ].map((info, _index) => (
        <Box
          key={_index}
          sx={{
            display: 'flex',
            ...((latestPostLarge || latestPost) && {
              opacity: 0.64,
              color: 'common.white',
            }),
          }}
        >
          <Iconify width={16} icon={info.icon as IconifyName} sx={{ mr: 0.5 }} />
          <Typography variant="caption">{info.number}</Typography>
        </Box>
      ))}
    </Box>
  );

  const renderCover = (
    <Box
      component="img"
      alt={post.type_report}
      src={post.image}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  const renderDate = (
    <Typography
      variant="caption"
      component="div"
      sx={{
        mb: 1,
        color: 'text.disabled',
        ...((latestPostLarge || latestPost) && {
          opacity: 0.48,
          color: 'common.white',
        }),
      }}
    >
      {fDate(post.createdAt)}
    </Typography>
  );

  const renderShape = (
    <SvgColor
      src="/assets/icons/shape-avatar.svg"
      sx={{
        left: 0,
        width: 88,
        zIndex: 9,
        height: 36,
        bottom: -16,
        position: 'absolute',
        color: 'background.paper',
        ...((latestPostLarge || latestPost) && { display: 'none' }),
      }}
    />
  );

  return (
    <Card sx={sx} {...other}>
      <Box
        sx={(theme) => ({
          position: 'relative',
          pt: 'calc(100% * 3 / 4)',
          ...((latestPostLarge || latestPost) && {
            pt: 'calc(100% * 4 / 3)',
            '&:after': {
              top: 0,
              content: "''",
              width: '100%',
              height: '100%',
              position: 'absolute',
              bgcolor: varAlpha(theme.palette.grey['900Channel'], 0.72),
            },
          }),
          ...(latestPostLarge && {
            pt: {
              xs: 'calc(100% * 4 / 3)',
              sm: 'calc(100% * 3 / 4.66)',
            },
          }),
        })}
      >
        {renderShape}
        {renderAvatar}
        {renderCover}
      </Box>

      <Box
        sx={(theme) => ({
          p: theme.spacing(6, 3, 3, 3),
          ...((latestPostLarge || latestPost) && {
            width: 1,
            bottom: 0,
            position: 'absolute',
          }),
        })}
      >
        {renderDate}
        {renderTitle}
        {renderDescription}
        {renderInfo}
      </Box>
    </Card>
  );
}
