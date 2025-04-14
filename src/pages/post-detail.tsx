import { CONFIG } from 'src/config-global';

import { PostDetail } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Blog - ${CONFIG.appName}`}</title>

      <PostDetail/>
    </>
  );
}
