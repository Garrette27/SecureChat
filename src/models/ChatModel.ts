// src/models/ChatModel.ts
import * as firebase from 'firebase';
import { EThree } from '@virgilsecurity/e3kit-browser';
import AppStore from './AppState';
import ChannelListModel from './ChannelListModel';

export default class ChatModel {
  channelsList: ChannelListModel;
  channelsListener?: () => void;
  messageListener?: firebase.Unsubscribe;
  private virgilE2ee: EThree;

  constructor(public store: AppStore, public email: string, eThree: EThree | null) {
    if (!eThree) {
      throw new Error('[ChatModel] EThree instance is required but was null');
    }

    this.virgilE2ee = eThree;
    this.channelsList = new ChannelListModel(email, this.virgilE2ee);
    this.listenChannels(email);
  }

  sendMessage = async (message: string) => {
    if (!this.store.state.currentChannel) {
      throw Error('[ChatModel] No channel selected');
    }

    const currentChannel = this.channelsList.getChannel(this.store.state.currentChannel.id);
    return await currentChannel.sendMessage(message);
  };

  listenChannels(email: string) {
    this.channelsListener = this.channelsList.listenUpdates(email, (channels) => {
      console.log('[ChatModel] Channels updated:', channels);
      this.store.setState({ channels });

      if (!this.store.state.currentChannel && channels.length > 0) {
        this.store.setState({ currentChannel: channels[0] });
        this.listenMessages(channels[0].id);
      }
    });
  }

  listenMessages(channelId: string) {
    if (this.messageListener) {
      this.messageListener();
    }

    this.messageListener = firebase
      .firestore()
      .collection('channels')
      .doc(channelId)
      .collection('messages')
      .orderBy('createdAt')
      .onSnapshot(snapshot => {
        const currentChannel = this.channelsList.getChannel(channelId);
        currentChannel.updateMessages(snapshot);

        const messages = currentChannel.messageList.getMessages();
        this.store.setState({ messages, currentChannel });
      });
  }

  unsubscribe() {
    if (this.channelsListener) this.channelsListener();
    if (this.messageListener) this.messageListener();
  }

  getVirgilInstance(): EThree {
    return this.virgilE2ee;
  }
}
