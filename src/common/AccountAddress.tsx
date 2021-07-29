import React, { CSSProperties } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { AccountAddress as AddressType } from './types/Addresses';
import { useCommonContext } from './CommonContext';

import './AccountAddress.css';

export interface Props {
    hint?: string,
    address: AddressType,
}

export default function AccountAddress(props: Props) {
    const { colorTheme } = useCommonContext();

    let style: CSSProperties = {};
    const icon = colorTheme.accounts.legalOfficerIcon;
    if(props.address.isLegalOfficer) {
        style['backgroundImage'] = `url("${process.env.PUBLIC_URL}/assets/${icon.id}.svg")`;
        style['backgroundRepeat'] = 'no-repeat';
        style['backgroundPositionX'] = '6px';
        style['backgroundPositionY'] = 'center';
    } else {
        style['backgroundColor'] = colorTheme.accounts.iconBackground;
    }

    return (
        <div className="AccountAddress">
            <div
                className="icon"
                style={ style }
            >
                { props.address.name.substring(0, 1).toUpperCase() }
            </div>
            <div
                className="text"
                style={{
                    justifyContent: props.hint === undefined ? 'space-around' : 'space-between'
                }}
            >
                {
                    props.hint !== undefined &&
                    <div
                        className="hint"
                        style={{
                            color: colorTheme.accounts.hintColor,
                        }}
                    >
                        { props.hint }
                    </div>
                }
                <div
                    className="name"
                    style={{
                        color: colorTheme.accounts.foreground,
                    }}
                >
                    { props.address.name }
                </div>
                <div
                    className="address"
                    style={{
                        color: colorTheme.accounts.foreground,
                    }}
                >
                    <OverlayTrigger
                      placement="bottom"
                      delay={ 500 }
                      overlay={
                        <Tooltip id={`tooltip-${props.address.address}`}>
                          { props.address.address }
                        </Tooltip>
                      }
                    >
                      <span>{ props.address.address }</span>
                    </OverlayTrigger>
                </div>
            </div>
        </div>
    );
}