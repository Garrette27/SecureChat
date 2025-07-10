import React from 'react';
import firebase from 'firebase/app';
import ChatModel from '../models/ChatModel';
import { IAppStore } from '../models/AppState';
import Channels from '../components/Channels';
import Messages from '../components/Messages';
import MessageField from '../components/MessageField';
import { LinkButton } from '../components/Primitives';
import { IChannel } from '../models/ChannelModel';
import {
  ChatContainer,
  Header,
  RightSide,
  ChatLayout,
  SideBar,
  BottomPrimaryButton,
  ChatWorkspace,
} from '../components/ChatPrimitives';

export interface IChatPageProps {
  model: ChatModel;
  store: IAppStore;
}

export default class ChatPage extends React.Component<IChatPageProps> {
  componentWillUnmount() {
    this.props.model.unsubscribe(); // ✅ Stop listeners
  }

  createChannel = async () => {
    const receiver = prompt('Enter the other user’s email exactly as they signed up:');
    if (!receiver) return;

    try {
      await this.props.model.channelsList.createChannel(receiver.toLowerCase());
      alert('✅ Channel created successfully!');
    } catch (err: any) {
      console.error('❌ createChannel error', err);
      alert(`Error creating channel: ${err.message}`);
    }
  };

  sendMessage = async (message: string) => {
    try {
      await this.props.model.sendMessage(message);
    } catch (err: any) {
      alert(`Error sending message: ${err.message}`);
    }
  };

  selectChannel = (channel: IChannel) => {
    this.props.store.setState({ currentChannel: channel });
    this.props.model.listenMessages(channel.id);
  };

  signOut = async () => {
    try {
      const eThree = this.props.model.getVirgilInstance?.();
      if (eThree) {
        // ✅ Safely try to unregister if registered
        try {
          await eThree.unregister();
          console.log('[ChatPage] Virgil card unregistered');
        } catch (unregErr: any) {
          if (unregErr.name === 'RegisterRequiredError') {
            console.warn('[ChatPage] Cannot unregister — identity not registered');
          } else {
            console.warn('[ChatPage] Failed to unregister:', unregErr);
          }
        }

        try {
          await eThree.cleanup();
          console.log('[ChatPage] Local private key cleaned up');
        } catch (cleanupErr) {
          console.warn('[ChatPage] Cleanup failed:', cleanupErr);
        }
      }
    } catch (err) {
      console.warn('[ChatPage] Error accessing EThree instance:', err);
    }

    try {
      this.props.model.unsubscribe(); // ✅ Stop Firestore listeners
      await firebase.auth().signOut(); // ✅ Firebase sign-out
      console.log('[ChatPage] Firebase sign-out complete');
    } catch (signOutErr) {
      console.error('[ChatPage] Sign-out failed:', signOutErr);
    }
  };

  render() {
    if (this.props.store.error) alert(this.props.store.error);

    return (
      <ChatContainer>
        <Header>
          <LinkButton color="white" href="#">
            SecureChat AI
          </LinkButton>
          <RightSide>
            {this.props.model.email}
            <LinkButton color="white" onClick={this.signOut}>
              logout
            </LinkButton>
          </RightSide>
        </Header>

        <ChatLayout>
          <SideBar>
            <Channels
              onClick={this.selectChannel}
              username={this.props.model.email}
              channels={this.props.store.channels}
            />
            <BottomPrimaryButton onClick={this.createChannel}>
              New Channel
            </BottomPrimaryButton>
          </SideBar>

          <ChatWorkspace>
            {this.props.store.currentChannel ? (
              <>
                <Messages messages={this.props.store.messages} />
                <MessageField handleSend={this.sendMessage} />
              </>
            ) : (
              <div className="text-gray-500 text-center p-4">
                Select a channel first.
              </div>
            )}
          </ChatWorkspace>
        </ChatLayout>
      </ChatContainer>
    );
  }
}
