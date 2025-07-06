// src/components/AuthForm.tsx
import React from 'react';
import { Formik, Form, Field, FieldProps, FormikHelpers, FormikProps, FormikErrors } from 'formik';
import InputField from './InputField';

export interface IAuthFormValues {
  username: string;
  password: string;
  brainkeyPassword: string;
}

type FormikSubmit = (
  values: IAuthFormValues,
  actions: FormikHelpers<IAuthFormValues>,
) => Promise<void>;

export interface IAuthFormProps {
  onSignIn: FormikSubmit;
  onSignUp: FormikSubmit;
}

interface IAuthFormState {
  isSignInClicked: boolean;
  isLoading: boolean;
}

export default class AuthForm extends React.Component<IAuthFormProps, IAuthFormState> {
  state: IAuthFormState = {
    isSignInClicked: false,
    isLoading: false,
  };

  validateForm = (values: IAuthFormValues) => {
    const errors: FormikErrors<IAuthFormValues> = {};
    if (!values.password) errors.password = 'required';
    if (!values.brainkeyPassword) errors.brainkeyPassword = 'required';
    return errors;
  };

  renderEmailInput = ({ field, form }: FieldProps<undefined, IAuthFormValues>) => {
    const error = form.touched.username && form.errors.username ? (form.errors.username as string) : null;
    return <InputField label="email" error={error} {...field} />;
  };

  renderPasswordInput = ({ field, form }: FieldProps<undefined, IAuthFormValues>) => {
    const error = form.touched.password && form.errors.password ? (form.errors.password as string) : null;
    return <InputField label="password" type="password" error={error} {...field} />;
  };

  renderBrainKeyPasswordInput = ({ field, form }: FieldProps<undefined, IAuthFormValues>) => {
    const error = form.touched.brainkeyPassword && form.errors.brainkeyPassword
      ? (form.errors.brainkeyPassword as string)
      : null;
    return <InputField label="backup key password" type="password" error={error} {...field} />;
  };

  onSubmit: FormikSubmit = (values, actions) => {
    this.setState({ isLoading: true });
    const promise = this.state.isSignInClicked
      ? this.props.onSignIn(values, actions)
      : this.props.onSignUp(values, actions);

    return promise.catch(() => this.setState({ isLoading: false }));
  };

  renderForm = ({ isValid }: FormikProps<IAuthFormValues>) => (
    <Form className="flex flex-col space-y-4">
      <Field name="username">{this.renderEmailInput}</Field>
      <Field name="password">{this.renderPasswordInput}</Field>
      <Field name="brainkeyPassword">{this.renderBrainKeyPasswordInput}</Field>
      {this.state.isLoading ? this.renderLoading() : this.renderButtons(isValid)}
    </Form>
  );

  renderButtons = (isValid: boolean) => (
    <div className="mt-5 flex justify-between">
      <button
        type="submit"
        disabled={!isValid}
        onClick={() => this.setState({ isSignInClicked: true })}
        className={`px-6 py-2 rounded bg-indigo-500 text-white uppercase transition hover:bg-indigo-600 disabled:opacity-50`}
      >
        Sign In
      </button>
      <button
        type="submit"
        disabled={!isValid}
        onClick={() => this.setState({ isSignInClicked: false })}
        className={`px-6 py-2 rounded bg-indigo-500 text-white uppercase transition hover:bg-indigo-600 disabled:opacity-50`}
      >
        Sign Up
      </button>
    </div>
  );

  renderLoading = () => (
    <div className="w-full text-center text-gray-500">loading...</div>
  );

  render() {
    return (
      <Formik
        validate={this.validateForm}
        initialValues={{ username: '', password: '', brainkeyPassword: '' }}
        onSubmit={this.onSubmit}
      >
        {this.renderForm}
      </Formik>
    );
  }
}
