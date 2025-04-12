import { CONFIG } from 'src/config-global';

import { NotFoundView } from 'src/sections/error';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`403 Forbidden | Error - ${CONFIG.appName}`}</title>

      <NotFoundView />
    </>
  );
}
