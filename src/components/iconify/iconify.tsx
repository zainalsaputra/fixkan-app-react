import type { IconProps, IconifyIcon } from '@iconify/react';

import { useId } from 'react';
import { Icon } from '@iconify/react';
import { mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';

import { iconifyClasses } from './classes';
import { registerIcons } from './register-icons';


// ----------------------------------------------------------------------

export type IconifyProps = React.ComponentProps<typeof IconRoot> &
  Omit<IconProps, 'icon'> & {
    icon: string | IconifyIcon;
  };


  export function Iconify({ className, icon, width = 20, height, sx, ...other }: IconifyProps) {
    const id = useId();
  
    if (typeof icon === 'string') {
      console.warn(
        [
          `Icon "${icon}" is currently loaded online, which may cause flickering effects.`,
          `To ensure a smoother experience, please register your icon collection for offline use.`,
          `More information is available at: https://docs.minimals.cc/icons/`,
        ].join('\n')
      );
    }
  
    registerIcons();
  
    return (
      <IconRoot
        ssr
        id={id}
        icon={icon}
        className={mergeClasses([iconifyClasses.root, className])}
        sx={[
          {
            width,
            flexShrink: 0,
            height: height ?? width,
            display: 'inline-flex',
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      />
    );
  }
  

// ----------------------------------------------------------------------

const IconRoot = styled(Icon)``;
