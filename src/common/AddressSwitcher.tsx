import React, { useCallback } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import './AddressSwitcher.css';
import AccountAddress from './AccountAddress';
import { useCommonContext } from './CommonContext';
import Button from './Button';
import { authenticate } from './Authentication';

export interface Props {
    selectAddress: ((userAddress: string) => void) | null,
}

export default function AddressSwitcher(props: Props) {
    const { colorTheme, logout, axios, setTokens, addresses } = useCommonContext();

    const login = useCallback((address: string) => {
        (async function() {
            const tokens = await authenticate(axios!, [address]);
            setTokens(tokens);
        })();
    }, [ axios, setTokens ]);

    if(addresses === null || props.selectAddress === null || addresses.currentAddress === undefined) {
        return null;
    }

    return (
        <div
            className={ "AddressSwitcher " + colorTheme.type }
            style={{
                color: colorTheme.accounts.foreground
            }}
        >
            <Dropdown>
                <Dropdown.Toggle id="address-switcher-toggle">
                    <div className="address-data">
                        <AccountAddress
                            hint="Click to select another address"
                            address={ addresses.currentAddress }
                            disabled={ addresses.currentAddress.token === undefined }
                        />
                    </div>
                </Dropdown.Toggle>
                <Dropdown.Menu
                    style={{
                        color: colorTheme.accounts.foreground,
                        backgroundColor: colorTheme.accounts.background,
                        boxShadow: `0 0 25px ${colorTheme.shadowColor}`,
                    }}
                >
                    {
                        addresses.addresses
                            .filter(address => address.address !== addresses!.currentAddress!.address)
                            .map(address => (
                            <Dropdown.Item
                                key={ address.address }
                                onClick={ () => address.token !== undefined && props.selectAddress!(address.address) }
                            >
                                <AccountAddress
                                    address={ address }
                                    disabled={ address.token === undefined }
                                    login={ () => login(address.address) }
                                />
                            </Dropdown.Item>
                        ))
                    }
                    <Dropdown.Item
                        key="logout"
                        onClick={ logout }
                        style={{
                            borderTop: `1px solid ${colorTheme.accounts.foreground}`,
                        }}
                        className="logout"
                    >
                        <Button variant='salmon'>Log Out</Button>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}
