import React from 'react';
import styled from 'styled-components';

const Label = styled.label`
    font-size: 12px;
    font-family: 'Lato', sans-serif;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
`;


const Input = styled.input`
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 10px 14px;
    font-size: 16px;
    outline: none;

    &:hover {
        border-color: #9ca3af;
    }

    &:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 1px #6366f1;
    }
`;


export interface IInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string | null;
}

export default class InputField extends React.Component<IInputFieldProps> {
    render() {
        const { label, error, ...props } = this.props;
        return (
            <Label>
                {label}
                <Input {...props}/>
                {error && <p>{error}</p>}
            </Label>
        );
    }
}