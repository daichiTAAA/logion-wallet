import React from 'react';

import { Children } from './types/Helpers';
import { ColorTheme } from './ColorTheme';

import './Frame.css';

export interface Props {
    colors: ColorTheme,
    children: Children,
}

export default function Frame(props: Props) {
    return (
        <div
            className="Frame"
            style={{
                backgroundColor: props.colors.frame.background,
                color: props.colors.frame.foreground,
                boxShadow: `0 0 25px ${props.colors.shadowColor}`,
            }}
        >
            { props.children }
        </div>
    );
}
