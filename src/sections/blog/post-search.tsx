import type { Theme, SxProps } from '@mui/material/styles';

import { useMemo, useState } from 'react';

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
  const [query, setQuery] = useState('');

  const uniquePosts = useMemo(() => posts, [posts]);

  // Field yang digunakan untuk pencarian dan tampilan
  const searchableFields = ['type_report', 'description', 'province', 'district', 'subdistrict'];

  // Fungsi pencocokan
  const isMatch = (post: IPostItem, keyword: string) => {
    const lowerKeyword = keyword.toLowerCase();

    return searchableFields.some((field) => {
      const value = post[field as keyof IPostItem];
      return typeof value === 'string' && value.toLowerCase().includes(lowerKeyword);
    });
  };

  // Ambil teks pertama yang cocok dari field tertentu
  const getFirstMatchingText = (post: IPostItem, keyword: string): string => {
    const lowerKeyword = keyword.toLowerCase();

    const match = searchableFields.find((field) => {
      const value = post[field as keyof IPostItem];
      return typeof value === 'string' && value.toLowerCase().includes(lowerKeyword);
    });

    return match ? (post[match as keyof IPostItem] as string) : post.type_report;
  };

  const filteredPosts = useMemo(() => {
    
    if (!query.trim()) return [];
  
    const seenLabels = new Set<string>();
  
    return uniquePosts.filter((post) => {
      if (!isMatch(post, query)) return false;
  
      const label = getFirstMatchingText(post, query).toLowerCase().trim();
  
      if (seenLabels.has(label)) return false;
  
      seenLabels.add(label);
      return true;
    });
  }, [uniquePosts, query]);
  

  // Highlight teks yang cocok
  const highlightMatch = (text: string, keyword: string) => {
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();    

    const startIndex = lowerText.indexOf(lowerKeyword);
    if (startIndex === -1) return text;

    const endIndex = startIndex + keyword.length;

    return (
      <>
        {text.substring(0, startIndex)}
        <strong>{text.substring(startIndex, endIndex)}</strong>
        {text.substring(endIndex)}
      </>
    );
  };

  const toTitleCase = (str: string) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());

  return (
    <Autocomplete
      sx={{ width: 280 }}
      autoHighlight
      popupIcon={null}
      freeSolo
      onInputChange={(_, value) => {
        setQuery(value);
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
      options={filteredPosts}
      getOptionLabel={(post) => {
        if (typeof post === 'string') return toTitleCase(post);
        return toTitleCase(getFirstMatchingText(post, query));
      }}      
      isOptionEqualToValue={(option, value) =>
        typeof option !== 'string' &&
        typeof value !== 'string' &&
        option.id === value.id
      }
      renderOption={(props, option) => {
        const text = toTitleCase(getFirstMatchingText(option, query));
        return (
          <li {...props}>
            {highlightMatch(text, query)}
          </li>
        );
      }}
      
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search post..."
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ ml: 1, width: 20, height: 20, color: 'text.disabled' }}
                />
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
}
