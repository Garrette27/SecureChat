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

// ✅ Add the wait helper
async function waitForVirgilEThree(maxRetries = 20): Promise<EThree> {
  while (!window.virgilE2ee && maxRetries-- > 0) {
    console.log('[ChannelModel] Waiting for virgilE2ee...');
    await new Promise(res => setTimeout(res, 300));
  }

  if (!window.virgilE2ee) {
    throw new Error('[ChannelModel] virgilE2ee was not initialized in time');
  }

  return window.virgilE2ee;
}

export default class ChannelModel implements IChannel {
  public id: string;
  public count: number;
  public members: ChannelUser[];
  public lastMessage?: string;

  private messageStorage: MessageStorage;
  private encryptedMessageList?: CryptoMessageList;
  private messageList: MessagesListModel;

  constructor(
    { id, count, members }: IChannel,
    public senderUsername: string,
    public virgilE2ee: EThree | null
  ) {
    this.id = id;
    this.count = count;
    this.members = members;
    this.messageStorage = new MessageStorage(this.id);
    this.messageList = new MessagesListModel(this);

    if (this.virgilE2ee) {
      this.encryptedMessageList = new CryptoMessageList(this.messageList, this.virgilE2ee);
    } else {
      console.warn('[ChannelModel] virgilE2ee is null — CryptoMessageList not initialized.');
    }
  }

  get receiver() {
    return this.members.find(e => e.username !== this.senderUsername)!;
  }

  get sender() {
    return this.members.find(e => e.username === this.senderUsername)!;
  }

  async sendMessage(message: string) {
    if (!this.encryptedMessageList) {
      // ✅ Wait for virgilE2ee and re-init if not ready
      const eThree = await waitForVirgilEThree();
      this.encryptedMessageList = new CryptoMessageList(this.messageList, eThree);
    }

    return this.encryptedMessageList!.sendMessage(message);
  }

  listenMessages(cb: (messages: IMessage[]) => void) {
    if (!this.encryptedMessageList) {
      console.warn('[ChannelModel] virgilE2ee is null — trying to wait before listening...');

      waitForVirgilEThree()
        .then(eThree => {
          this.encryptedMessageList = new CryptoMessageList(this.messageList, eThree);

          // After getting eThree, set up listener
          this._startListening(cb);
        })
        .catch(err => {
          console.error('[ChannelModel] Failed to init virgilE2ee in time:', err);
          cb([]); // fallback to empty list
        });

      return () => {}; // Return dummy unsubscribe
    }

    return this._startListening(cb);
  }

  private _startListening(cb: (messages: IMessage[]) => void): () => void {
    return this.encryptedMessageList!.listenUpdates(this.id, (messages) => {
      const allMessages = this.messageStorage.addMessages(messages);

      if (allMessages.length > 0) {
        const latest = allMessages[allMessages.length - 1];
        this.lastMessage = latest.text;
      }

      cb(allMessages);
    });
  }
}
