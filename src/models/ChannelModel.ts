import MessagesListModel, { IMessage } from './MessageListModel';
import MessageStorage from './MessageStorage';
import CryptoMessageList from './CryptoMessageList';
import { EThree } from '@virgilsecurity/e3kit-browser';

export interface IChannel {
  id: string;
  count: number;
  members: ChannelUser[];
}

export type ChannelUser = { username: string; uid: string };

export default class ChannelModel implements IChannel {
  public id: string;
  public count: number;
  public members: ChannelUser[];
  public lastMessage?: string; // ✅ new field to preview last message

  private messageStorage: MessageStorage;
  private encryptedMessageList?: CryptoMessageList; // allow null
  private messageList: MessagesListModel;

  constructor(
    { id, count, members }: IChannel,
    public senderUsername: string,
    public virgilE2ee: EThree | null // allow null during initialization
  ) {
    this.id = id;
    this.count = count;
    this.members = members;
    this.messageStorage = new MessageStorage(this.id);
    this.messageList = new MessagesListModel(this);

    if (this.virgilE2ee) {
      this.encryptedMessageList = new CryptoMessageList(this.messageList, this.virgilE2ee);
    } else {
      console.warn('[ChannelModel] virgilE2ee is null — skipping CryptoMessageList.');
    }
  }

  get receiver() {
    return this.members.find((e) => e.username !== this.senderUsername)!;
  }

  get sender() {
    return this.members.find((e) => e.username === this.senderUsername)!;
  }

  async sendMessage(message: string) {
    if (!this.encryptedMessageList) {
      throw new Error('[ChannelModel] Cannot send message — virgilE2ee is not initialized.');
    }
    return this.encryptedMessageList.sendMessage(message);
  }

  listenMessages(cb: (messages: IMessage[]) => void) {
    if (!this.encryptedMessageList) {
      console.warn('[ChannelModel] Cannot listen to messages — virgilE2ee is not initialized.');
      cb([]);
      return () => {};
    }

    return this.encryptedMessageList.listenUpdates(this.id, (messages) => {
      const allMessages = this.messageStorage.addMessages(messages);

      // ✅ Set last message text for UI preview
      if (allMessages.length > 0) {
        const latest = allMessages[allMessages.length - 1];
        this.lastMessage = latest.text;
      }

      cb(allMessages);
    });
  }
}
