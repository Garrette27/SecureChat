import { createBrainKey } from 'virgil-pythia';
import {
    SyncKeyStorage,
    CloudKeyStorage,
    KeyknoxManager,
    KeyknoxCrypto,
    KeyEntryDoesntExistError,
} from '@virgilsecurity/keyknox';
import { VirgilPythiaCrypto, VirgilPublicKey } from 'virgil-crypto/dist/virgil-crypto-pythia.es';
import VirgilToolbox from '../VirgilToolbox';
import { VirgilPrivateKey } from 'virgil-crypto';
import { KeyEntryStorage } from 'virgil-sdk';

export interface IBrainKey {
    generateKeyPair(
        password: string,
        id?: string,
    ): Promise<{
        privateKey: VirgilPrivateKey;
        publicKey: VirgilPublicKey;
    }>;
}

export default class KeyknoxLoader {
    private pythiaCrypto = new VirgilPythiaCrypto();
    private brainKey: IBrainKey;
    private syncStorage?: Promise<SyncKeyStorage>;
    private localStorage = new KeyEntryStorage({ name: 'demo-firebase-js-keyknox' });

    constructor(public toolbox: VirgilToolbox) {
        this.brainKey = createBrainKey({
            virgilCrypto: this.toolbox.virgilCrypto,
            virgilPythiaCrypto: this.pythiaCrypto,
            accessTokenProvider: this.toolbox.jwtProvider,
        });
    }

    async loadPrivateKey(password?: string, id?: string) {
        const privateKey = await this.loadLocalPrivateKey();
        if (privateKey) return privateKey;
        if (!password) throw new Error('Private key not found, password required');
        if (!this.syncStorage) this.syncStorage = this.createSyncStorage(password, id);
        const storage = await this.syncStorage;
        const key = await storage.retrieveEntry(this.toolbox.identity).catch(e => {
            if (e instanceof KeyEntryDoesntExistError) {
                return null;
            }
            throw e;
        });
        if (!key) return null;
        return this.toolbox.virgilCrypto.importPrivateKey(key.value) as VirgilPrivateKey;
    }

    async savePrivateKey(privateKey: VirgilPrivateKey, password: string, id?: string) {
        if (!this.syncStorage) this.syncStorage = this.createSyncStorage(password, id);
        const storage = await this.syncStorage;
        await storage.storeEntry(
            this.toolbox.identity,
            this.toolbox.virgilCrypto.exportPrivateKey(privateKey),
        );
    }

    private async createSyncStorage(password: string, id?: string) {
        const { privateKey, publicKey } = await this.brainKey.generateKeyPair(password, id);
        const storage = new SyncKeyStorage(
            new CloudKeyStorage(
                new KeyknoxManager(
                    this.toolbox.jwtProvider,
                    privateKey,
                    publicKey,
                    undefined,
                    new KeyknoxCrypto(this.toolbox.virgilCrypto),
                ),
            ),
            this.localStorage,
        );

        await storage.sync();

        return storage;
    }

    private async loadLocalPrivateKey() {
        const privateKeyData = await this.localStorage.load(this.toolbox.identity);
        if (!privateKeyData) return null;
        return this.toolbox.virgilCrypto.importPrivateKey(privateKeyData.value) as VirgilPrivateKey;
    }
}
