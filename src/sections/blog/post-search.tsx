import type { Theme, SxProps } from '@mui/material/styles';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';

import { Iconify } from 'src/components/iconify';

import type { IPostItem } from './post-item';

// ----------------------------------------------------------------------

type PostSearchProps = {
  posts: IPostItem[];
  sx?: SxProps<Theme>;
  onSearch?: (query: string) => void;
};

export function PostSearch({ posts, sx, onSearch }: PostSearchProps) {
  // Hilangkan duplikat berdasarkan type_report
  const uniquePosts = Array.from(
    new Map(posts.map((post) => [post.type_report, post])).values()
  );

  return (
    <Autocomplete
      sx={{ width: 280 }}
      autoHighlight
      popupIcon={null}
      freeSolo
      onInputChange={(_, value) => {
        if (onSearch) onSearch(value);
      }}
      slotProps={{
        paper: {
          sx: {
            width: 320,
            [`& .${autocompleteClasses.option}`]: {
              typography: 'body2',
            },
            ...sx,
          },
        },
      }}
      options={uniquePosts}
      getOptionLabel={(post) => {
        if (typeof post === 'string') return post;
        return post.type_report;
      }}
      isOptionEqualToValue={(option, value) =>
        typeof option !== 'string' &&
        typeof value !== 'string' &&
        option.id === value.id
      }
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search post..."
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify
                    icon="eva:search-fill"
                    sx={{ ml: 1, width: 20, height: 20, color: 'text.disabled' }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
}
