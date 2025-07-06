// src/components/MessageField.tsx
import React from 'react';
import { SecondaryButton } from './Primitives';

export interface IMessageFieldProps {
  handleSend: (message: string) => void;
}

export interface IMessageFieldState {
  message: string;
}

export default class MessageField extends React.Component<IMessageFieldProps, IMessageFieldState> {
  state = { message: '' };

  handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (this.state.message.trim() === '') return;
    this.props.handleSend(this.state.message);
    this.setState({ message: '' });
  };

  handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ message: e.target.value });
  };

  handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault();
      this.handleSend(e as any);
    } else if (e.key === 'Enter' && e.ctrlKey) {
      this.setState((state) => ({ message: state.message + '\n' }));
    }
  };

  render() {
    return (
      <form onSubmit={this.handleSend} className="flex items-center px-10 py-4 w-full bg-white border-t border-gray-200">
        <textarea
          className="flex-1 border border-gray-300 rounded-md px-4 py-2 mr-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Write a message..."
          value={this.state.message}
          onChange={this.handleMessageChange}
          onKeyDown={this.handleEnter}
          rows={2}
        />
        <SecondaryButton type="submit" disabled={this.state.message.trim() === ''}>
          Send
        </SecondaryButton>
      </form>
    );
  }
}
