import styled from 'styled-components';

export const Button = styled.button`
    font-family: 'Muller';
    font-size: 14px;
    display: inline-flex;
    justify-content: center;
    height: 44px;
    transition: all 0.5s;
    text-transform: uppercase;
    border: 0;
    border-radius: 3px;
    align-items: center;
`;

export const PrimaryButton = styled(Button)`
    color: white;
    background-color: #6366f1; /* indigo-500 */
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    padding: 0 25px;

    &:hover:not(:disabled) {
        background-color: #4f46e5; /* indigo-600 */
    }

    &:disabled {
        opacity: 0.5;
    }
`;


export const SecondaryButton = styled(Button)`
    --webkit-appearance: none;
    border: 0;
    display: inline-block;
    padding: 16px 19px;
    color: #9e3621;
    margin: 2px;
    font-family: Muller;
    text-transform: uppercase;
    text-decoration: none;

    &:disabled {
        color: #ebebeb;
    }
`;

export const Avatar = styled.div`
    height: 50px;
    width: 50px;
    line-height: 50px;
    border-radius: 50px;
    text-align: center;
    font-size: 24px;
    background-color: lightgray;
`;

export const LinkButton = styled.a`
    --webkit-appearance: none;
    border: 0;
    display: inline-block;
    padding: 16px 19px;
    color: ${props => props.color};
    font-family: Muller;
    text-transform: uppercase;
    text-decoration: none;

    &:hover {
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.1)
    }
`