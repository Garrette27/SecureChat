// src/virgil.ts

import { EThree } from '@virgilsecurity/e3kit-browser';
import firebase from 'firebase/app';
import 'firebase/functions';
import { initCrypto } from 'virgil-crypto';

export async function initEThree(identity: string): Promise<EThree> {
  console.log("initEThree called with:", identity);

  await initCrypto();

  const getVirgilJwt = firebase.functions().httpsCallable('getVirgilToken');
  const response = await getVirgilJwt({ identity });
  const virgilToken = response.data.token;

  const eThree = await EThree.initialize(() => Promise.resolve(virgilToken));
  console.log("EThree initialized for:", identity);

  try {
    // ✅ Attempt unregister, but handle if not registered yet
    try {
      await eThree.unregister();
      console.log('[virgil.ts] Existing Virgil card unregistered');
    } catch (unregErr: any) {
      if (unregErr.name === 'RegisterRequiredError') {
        console.warn('[virgil.ts] Cannot unregister — identity not registered yet');
      } else {
        throw unregErr;
      }
    }

    await eThree.register();
    console.log('[virgil.ts] Registered new Virgil card');
  } catch (err: any) {
    if (err.name === 'IdentityAlreadyExistsError') {
      console.warn('[virgil.ts] IdentityAlreadyExistsError — restoring key');

      const hasLocalKey = await eThree.hasLocalPrivateKey();
      if (!hasLocalKey) {
        await eThree.restorePrivateKey();
        console.log('[virgil.ts] Private key restored');
      } else {
        console.log('[virgil.ts] Local key exists');
      }
    } else if (err.name === 'MultipleCardsError') {
      console.error('[virgil.ts] ❌ MultipleCardsError: clean-up failed, contact admin or reset identity manually');
      throw err;
    } else {
      console.error('[virgil.ts] Unhandled error:', err);
      throw err;
    }
  }

  return eThree;
}
