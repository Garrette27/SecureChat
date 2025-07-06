// src/pages/AuthPage.tsx
import * as React from 'react';
import AuthForm, { IAuthFormValues } from '../components/AuthForm';
import { FormikHelpers as FormikActions } from 'formik';
import UserApi from '../models/UserModel';
import { IAppStore } from '../models/AppState';

export interface IAuthPageProps {
  store: IAppStore;
  model: UserApi;
}

export default class AuthPage extends React.Component<IAuthPageProps> {
  handleSignUp = async (values: IAuthFormValues, actions: FormikActions<IAuthFormValues>) => {
    const UserApi = this.props.model;
    try {
      await UserApi.signUp(values.username, values.password, values.brainkeyPassword);
    } catch (e) {
      actions.setErrors({ username: (e as Error).message });
      throw e;
    }
  };

  handleSignIn = async (values: IAuthFormValues, actions: FormikActions<IAuthFormValues>) => {
    const UserApi = this.props.model;
    try {
      await UserApi.signIn(values.username, values.password, values.brainkeyPassword);
    } catch (e) {
      actions.setErrors({ username: (e as Error).message });
      throw e;
    }
  };

  render() {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-full max-w-sm p-6 bg-white rounded shadow-lg border border-gray-200">
          <AuthForm onSignIn={this.handleSignIn} onSignUp={this.handleSignUp} />
        </div>
      </div>
    );
  }
}
