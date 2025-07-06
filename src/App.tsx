import React from 'react';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';

import { createGlobalStyle } from 'styled-components';
import AppStore, { IAppStore } from './models/AppState';
import UserApi from './models/UserModel';

const GlobalStyle = createGlobalStyle`
    html {
        box-sizing: border-box;
        background-color: #f9fafb;
        font-family: 'Lato', sans-serif;
        letter-spacing: 0.05em;
    }
    *, *::before, *::after {
        box-sizing: inherit;
    }

    body {
        margin: 0;
        padding: 0;
        color: #111827; /* slate-900 */
        background-color: #f9fafb; /* slate-50 */
    }
`;


export default class App extends React.Component<{}, IAppStore> {
    userModel: UserApi;
    store = new AppStore(this.setState.bind(this), () => this.state);
    
    constructor(props: {}) {
        super(props);
        this.state = this.store.defaultState;
        this.userModel = new UserApi(this.store);
    }

    render() {
        const isAuthPage = this.state.chatModel == null;
        const isChatPage = this.state.chatModel != null;
        return (
            <React.Fragment>
                <GlobalStyle />
                {isAuthPage && <AuthPage store={this.state as IAppStore} model={this.userModel} />}
                {isChatPage && <ChatPage store={this.state as IAppStore} model={this.state.chatModel!} />}
            </React.Fragment>
        );
    }
}
