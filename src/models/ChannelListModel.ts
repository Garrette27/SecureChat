import { FirebaseCollections } from './helpers/FirebaseCollections';
import firebase from 'firebase/app';
import 'firebase/firestore'; // Ensure Firestore features are included
import ChannelModel, { IChannel } from './ChannelModel';
import { EThree } from '@virgilsecurity/e3kit-browser';
import { base64UrlFromBase64 } from './helpers/base64UrlFromBase64';

export default class ChannelListModel {
    static channelCollectionRef = firebase.firestore().collection(FirebaseCollections.Channels);
    static userCollectionRef = firebase.firestore().collection(FirebaseCollections.Users);
    channels: ChannelModel[] = [];

    constructor(private senderUsername: string, private e3kit: EThree | null) {}

    getChannel(channelId: string) {
        const channel = this.channels.find(e => e.id === channelId);
        if (!channel) throw Error('Channel not found');
        return channel;
    }

    listenUpdates(senderUsername: string, cb: (channels: ChannelModel[]) => void) {
        return ChannelListModel.userCollectionRef.doc(senderUsername).onSnapshot(async snapshot => {
            const data = snapshot.data();
            if (!data || !data.channels) {
                console.warn(`[ChannelListModel] No channels found for user: ${senderUsername}`);
                cb([]);
                return;
            }

            const channelIds = data.channels as string[];

            try {
                const channelsRefs = await Promise.all(
                    channelIds.map((id: string) =>
                        ChannelListModel.channelCollectionRef.doc(id).get()
                    )
                );

                const channels = channelsRefs
                    .filter(doc => doc.exists)
                    .map(this.getChannelFromSnapshot);

                this.channels = channels.map(channel => {
                    try {
                        return new ChannelModel(channel, senderUsername, this.e3kit);
                    } catch (err) {
                        console.error(
                            '[ChannelListModel] Error initializing ChannelModel for channel:',
                            channel.id,
                            err
                        );
                        return null;
                    }
                }).filter(Boolean) as ChannelModel[];

                cb(this.channels);
            } catch (error) {
                console.error('[ChannelListModel] Error loading channel data:', error);
                cb([]);
            }
        });
    }

    async createChannel(receiverUsername: string) {
        receiverUsername = receiverUsername.toLowerCase();
        if (receiverUsername === this.senderUsername) {
            throw new Error('Autocommunication is not supported yet');
        }

        const hasChat = this.channels.some(e => e.receiver.username === receiverUsername);
        if (hasChat) throw new Error('You already have this channel');

        const receiverRef = firebase
            .firestore()
            .collection(FirebaseCollections.Users)
            .doc(receiverUsername);

        const senderRef = firebase
            .firestore()
            .collection(FirebaseCollections.Users)
            .doc(this.senderUsername);

        const [receiverDoc, senderDoc] = await Promise.all([receiverRef.get(), senderRef.get()]);

        if (!receiverDoc.exists) throw new Error("receiverDoc doesn't exist");
        if (!senderDoc.exists) throw new Error("senderDoc doesn't exist");

        const channelId = this.getChannelId(receiverUsername, this.senderUsername);
        const channelRef = ChannelListModel.channelCollectionRef.doc(channelId);

        return await firebase.firestore().runTransaction(async transaction => {
            const senderChannels = senderDoc.data()!.channels || [];
            const receiverChannels = receiverDoc.data()!.channels || [];

            transaction.set(channelRef, {
                count: 0,
                members: [
                    { username: this.senderUsername, uid: senderDoc.data()!.uid },
                    { username: receiverUsername, uid: receiverDoc.data()!.uid },
                ],
            });

            transaction.update(senderRef, {
                channels: [...new Set([...senderChannels, channelId])],
            });

            transaction.update(receiverRef, {
                channels: [...new Set([...receiverChannels, channelId])],
            });

            return transaction;
        });
    }

    private getChannelFromSnapshot(snapshot: firebase.firestore.DocumentSnapshot): IChannel {
        return {
            ...(snapshot.data() as IChannel),
            id: snapshot.id,
        } as IChannel;
    }

    private getChannelId(username1: string, username2: string): string {
        const combination = username1 > username2
            ? username1 + username2
            : username2 + username1;

        if (!this.e3kit) {
            // A-mode fallback (no E3Kit): simple hash using btoa
            const base64 = btoa(combination).substring(0, 30); // shorten for Firestore ID
            return base64.replace(/[^a-z0-9]/gi, '_');
        }

        // B-mode (secure E2EE hashing with Virgil Crypto)
        return base64UrlFromBase64(
            this.e3kit.virgilCrypto.calculateHash(combination).toString('base64')
        );
    }
}
