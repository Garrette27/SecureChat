// src/models/UserApi.ts
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { EThree } from '@virgilsecurity/e3kit-browser';
import { FirebaseCollections } from './helpers/FirebaseCollections';
import AppStore from './AppState';
import ChatModel from './ChatModel';
import { initEThree } from '../virgil';

class UserApi {
  collectionRef = firebase.firestore().collection(FirebaseCollections.Users);
  eThree: Promise<EThree | null>;

  constructor(public state: AppStore) {
    this.eThree = Promise.resolve(null);

    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const email = user.email!;
        console.log('[UserApi] User logged in:', email);

        this.eThree = initEThree(email);
        const eThreeInstance = await this.eThree;

        console.log('[UserApi] EThree initialized for', email, eThreeInstance);

        if (eThreeInstance && await eThreeInstance.hasLocalPrivateKey()) {
          this.openChatWindow(email, eThreeInstance);
        } else {
          console.warn('[UserApi] No private key found — EThree fallback for', email);
          this.openChatWindow(email, null);
        }
      } else {
        this.state.setState(this.state.defaultState);
        this.eThree.then(eThree => {
          if (eThree) eThree.cleanup();
        });
      }
    });
  }

  async signUp(email: string, password: string, brainkeyPassword: string) {
    email = email.toLowerCase();
    this.validateBrainkey(brainkeyPassword);

    const userInfo = await firebase.auth().createUserWithEmailAndPassword(email, password);
    this.eThree = initEThree(email);
    const eThree = await this.eThree;

    try {
      if (eThree) {
        try {
          await eThree.unregister(); // 🔥 Try to unregister previous card
          console.log('[UserApi] Unregistered old Virgil card');
        } catch (err) {
          console.warn('[UserApi] unregister() failed or not needed:', err);
        }

        await eThree.register();
        await eThree.backupPrivateKey(brainkeyPassword);
        console.log('[UserApi] Registered and backed up key for', email);
      }

      await this.ensureUserDocument(userInfo.user!.uid, email);
      this.openChatWindow(email, eThree);
    } catch (error) {
      await userInfo.user!.delete();
      console.error('[UserApi] SignUp error, deleting user', error);
      throw error;
    }
  }

  async signIn(email: string, password: string, brainkeyPassword: string) {
    email = email.toLowerCase();
    this.validateBrainkey(brainkeyPassword);

    const userInfo = await firebase.auth().signInWithEmailAndPassword(email, password);
    this.eThree = initEThree(email);
    const eThree = await this.eThree;

    try {
      if (eThree) {
        const hasPrivateKey = await eThree.hasLocalPrivateKey();
        if (!hasPrivateKey) {
          await eThree.restorePrivateKey(brainkeyPassword);
          console.log('[UserApi] Private key restored for', email);
        } else {
          console.log('[UserApi] Local private key available');
        }
      }

      await this.ensureUserDocument(userInfo.user!.uid, email);
      this.openChatWindow(email, eThree);
    } catch (error) {
      firebase.auth().signOut();
      throw error;
    }
  }

  openChatWindow(email: string, eThree: EThree | null) {
    const chatModel = new ChatModel(this.state, email, eThree);
    this.state.setState({ chatModel, email });
  }

  private async ensureUserDocument(uid: string, email: string) {
    const userRef = this.collectionRef.doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid,
        email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        channels: [],
      });
    }
  }

  private validateBrainkey(brainkeyPassword: string) {
    if (
      typeof brainkeyPassword !== 'string' ||
      brainkeyPassword.length < 6 ||
      brainkeyPassword.length > 64
    ) {
      throw new Error(
        '[UserApi] Invalid brainkey password — must be a 6-64 character UTF-8 string.'
      );
    }
  }
}

export default UserApi;
