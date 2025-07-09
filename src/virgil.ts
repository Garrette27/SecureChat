// src/virgil.ts
import { EThree } from '@virgilsecurity/e3kit-browser';
import firebase from 'firebase/app';
import 'firebase/functions';
import { initCrypto } from 'virgil-crypto';

export async function initEThree(identity: string): Promise<EThree> {
  console.log("initEThree called with:", identity);

  await initCrypto(); // ✅ Required before using EThree

  const getVirgilJwt = firebase.functions().httpsCallable('getVirgilToken');
  const response = await getVirgilJwt({ identity });
  const virgilToken = response.data.token;

  const eThree = await EThree.initialize(() => Promise.resolve(virgilToken));
  console.log("EThree initialized for:", identity);

  try {
    await eThree.register();
    console.log("EThree registration complete");
  } catch (err: any) {
    if (err.name === 'IdentityAlreadyExistsError') {
      console.log("EThree identity exists — restoring private key");

      const hasLocalKey = await eThree.hasLocalPrivateKey();
      if (!hasLocalKey) {
        await eThree.restorePrivateKey(); // ✅ Only if not already stored
        console.log("Private key restored from cloud");
      } else {
        console.log("Local private key found — no restore needed");
      }
    } else {
      throw err; // ❌ Let other errors bubble up
    }
  }

  window.virgilE2ee = eThree; // ✅ Make it globally available if needed
  return eThree;
}
