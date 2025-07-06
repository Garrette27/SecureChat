// src/components/Message.tsx
import * as React from 'react';
import { Avatar } from './Primitives';
import format from 'date-fns/format';
import { IMessage } from '../models/MessageListModel';

interface IMessageProps {
  message: IMessage;
}

export default function Message({ message }: IMessageProps) {
  return (
    <div className="w-full min-h-[100px] flex">
      <div className="mr-6 flex-none">
        <Avatar>{message.sender.slice(0, 2).toUpperCase()}</Avatar>
      </div>
      <div className="flex-1 max-w-[calc(100%-100px)] flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{message.sender}</h3>
          <span className="text-sm text-gray-400">{format(message.createdAt, 'HH:mm:ss')}</span>
        </div>
        <div className="break-words text-gray-700">
          {message.body === '' ? '*Message Deleted*' : message.body}
        </div>
      </div>
    </div>
  );
}
