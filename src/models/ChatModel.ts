import AppStore from './AppState';
import firebase from 'firebase/app';
import ChannelListModel from './ChannelListModel';
import { IChannel } from './ChannelModel';
import { EThree } from '@virgilsecurity/e3kit-browser';

export class ChatModel {
    channelsList: ChannelListModel;

    channelsListener?: firebase.Unsubscribe;
    messageListener?: firebase.Unsubscribe;
    
    constructor(public store: AppStore, public email: string, virgilE2ee: EThree) {
        this.channelsList = new ChannelListModel(email, virgilE2ee);
        this.listenChannels(email);
    }

    sendMessage = async (message: string) => {
        if (!this.store.state.currentChannel) throw Error('set channel first');
        const currentChannel = this.channelsList.getChannel(this.store.state.currentChannel.id);

        return await currentChannel.sendMessage(message);
    };

    listenMessages = async (channel: IChannel) => {
        if (this.messageListener) this.messageListener();
        const channelModel = this.channelsList.getChannel(channel.id);
        this.store.setState({ currentChannel: channel, messages: [] });
        this.messageListener = channelModel.listenMessages(messages =>
            this.store.setState({ messages }),
        );
    };

    unsubscribe() {
        if (this.channelsListener) this.channelsListener();
        if (this.messageListener) this.messageListener();
    }

    private async listenChannels(username: string) {
        if (this.channelsListener) this.channelsListener();

        // ✅ PATCH: Ensure user doc exists for testing
        const userRef = firebase.firestore().collection('Users').doc(username);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.warn(`Creating test user doc for ${username}`);
            await userRef.set({
                createdAt: new Date(),
                uid: null,
                channels: [],
            });
        }

        this.channelsListener = this.channelsList.listenUpdates(username, channels =>
            this.store.setState({ channels }),
        );
    }
}

export default ChatModel;
