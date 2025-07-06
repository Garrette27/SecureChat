import * as firebase from 'firebase';
import { EThree } from '@virgilsecurity/e3kit-browser';
import { FirebaseCollections } from './helpers/FirebaseCollections';
import AppStore from './AppState';
import ChatModel from './ChatModel';

export type AuthHandler = (client: EThree | null) => void;

class UserApi {
    collectionRef = firebase.firestore().collection(FirebaseCollections.Users);
    eThree: Promise<EThree | null>;

    constructor(public state: AppStore) {
        // TEMPORARY: disable Virgil init to avoid CORS
        this.eThree = Promise.resolve(null);

        firebase.auth().onAuthStateChanged(async user => {
            if (user) {
                const eThree = await this.eThree;
                if (eThree && await eThree.hasLocalPrivateKey()) {
                    this.openChatWindow(user.email!, eThree);
                } else {
                    this.openChatWindow(user.email!, null);
                }
            } else {
                this.state.setState(state.defaultState);
                this.eThree.then(eThree => {
                    if (eThree) eThree.cleanup();
                });
            }
        });
    }

    async signUp(email: string, password: string, brainkeyPassword: string) {
        email = email.toLowerCase();
        const userInfo = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const eThree = await this.eThree;

        try {
            if (eThree) {
                await eThree.register();
                await eThree.backupPrivateKey(brainkeyPassword);
            }

            // ✅ Ensure Firestore document is created for this user
            await this.ensureUserDocument(userInfo.user!.uid, email);

            this.openChatWindow(email, eThree);
        } catch (error) {
            await userInfo.user!.delete();
            console.error(error);
            throw error;
        }
    }

    async signIn(email: string, password: string, brainkeyPassword: string) {
        email = email.toLowerCase();
        const userInfo = await firebase.auth().signInWithEmailAndPassword(email, password);
        const eThree = await this.eThree;

        try {
            if (eThree) {
                const hasPrivateKey = await eThree.hasLocalPrivateKey();
                if (!hasPrivateKey) await eThree.restorePrivateKey(brainkeyPassword);
            }

            // ✅ Ensure Firestore document is created for this user if missing
            await this.ensureUserDocument(userInfo.user!.uid, email);

            this.openChatWindow(email, eThree);
        } catch (e) {
            firebase.auth().signOut();
            throw e;
        }
    }

    async openChatWindow(email: string, eThree: EThree | null) {
        const chatModel = new ChatModel(this.state, email, eThree);
        this.state.setState({ chatModel, email });
    }

    // ✅ Helper to create the Firestore user document if it doesn't exist
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
}

export default UserApi;
