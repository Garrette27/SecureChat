// functions/src/global.d.ts

import { EThree } from '@virgilsecurity/e3kit-browser';

declare global {
  interface Window {
    virgilE2ee?: EThree | null;
  }
}

export {}; // Ensure it's treated as a module
