// src/components/Channels.tsx
import * as React from 'react';
import { Avatar } from './Primitives';
import ChannelModel from '../models/ChannelModel';

interface IChannelsProps {
  channels: ChannelModel[];
  username: string;
  onClick: (channel: ChannelModel) => void;
}

export default class Channels extends React.Component<IChannelsProps> {
  renderItem = (item: ChannelModel) => {
    const initials = item.receiver?.username?.slice(0, 2).toUpperCase() || '??';
    const lastMessage = item.lastMessage || 'No messages yet';

    return (
      <button
        onClick={() => this.props.onClick(item)}
        key={item.id}
        className="w-full flex items-start px-4 py-3 hover:bg-indigo-100 transition"
      >
        <Avatar>{initials}</Avatar>
        <div className="ml-4 text-left max-w-[160px]">
          <div className="font-medium break-words">{item.receiver?.username}</div>
          <div className="text-sm text-gray-500 truncate max-w-full">{lastMessage}</div>
        </div>
      </button>
    );
  };

  render() {
    const { channels } = this.props;
    return (
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-130px)] bg-white divide-y divide-gray-100">
        {channels.map((channel) => this.renderItem(channel))}
      </div>
    );
  }
}
