// src/components/Channels.tsx
import * as React from 'react';
import { Avatar } from './Primitives';
import ChannelModel, { IChannel } from '../models/ChannelModel';

interface IChannelsProps {
  channels: ChannelModel[];
  username: string;
  onClick: (channel: IChannel) => void;
}

export default class Channels extends React.Component<IChannelsProps> {
  renderItem = (item: ChannelModel) => {
    return (
      <button
        onClick={() => this.props.onClick(item)}
        key={item.id}
        className="w-full flex items-center px-4 py-3 hover:bg-indigo-100 transition"
      >
        <Avatar>{item.receiver.username.slice(0, 2).toUpperCase()}</Avatar>
        <span className="ml-4 break-words max-w-[130px] text-left">{item.receiver.username}</span>
      </button>
    );
  };

  render() {
    return (
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-130px)] bg-white divide-y divide-gray-100">
        {this.props.channels.map((channel) => this.renderItem(channel))}
      </div>
    );
  }
}
