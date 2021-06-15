import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Children } from './types/Helpers';
import Addresses from './types/Addresses';
import Logo from './Logo';
import AddressSwitcher from './AddressSwitcher';
import { AccountAddressColors } from './AccountAddress';

import './Dashboard.css';

export interface BackgroundAndForegroundColors {
    background: string,
    foreground: string,
}

export interface PrimaryAreaColors extends BackgroundAndForegroundColors {
    link: string,
}

export interface ColorTheme {
    menuArea: BackgroundAndForegroundColors,
    primaryArea: PrimaryAreaColors,
    secondaryArea: BackgroundAndForegroundColors,
    accountColors: AccountAddressColors,
}

export interface Props {
    children: Children,
    title: string,
    colors: ColorTheme,
    addresses: Addresses,
    selectAddress: (userAddress: string) => void,
}

export default function Dashboard(props: Props) {

    const inlineCss = `
    .Dashboard .PrimaryArea a, .Dashboard .PrimaryArea .btn-link {
        color: ${props.colors.primaryArea.link}
    }
    .Dashboard .PrimaryArea .table {
        color: ${props.colors.primaryArea.foreground}
    }
    `;

    return (
        <Container className="Dashboard" fluid>
            <style>
            { inlineCss }
            </style>
            <Row>
                <Col
                    md={2}
                    style={{
                        backgroundColor: props.colors.menuArea.background,
                        color: props.colors.menuArea.foreground,
                    }}
                >
                    <div className="MenuArea">
                        <Logo />
                    </div>
                </Col>
                <Col
                    md={7}
                    style={{
                        backgroundColor: props.colors.primaryArea.background,
                        color: props.colors.primaryArea.foreground,
                    }}
                >
                    <div className="PrimaryArea">
                        <div className="TitleArea">
                            <h1>{ props.title }</h1>
                        </div>
                        { props.children }
                    </div>
                </Col>
                <Col
                    md={3}
                    style={{
                        backgroundColor: props.colors.secondaryArea.background,
                        color: props.colors.secondaryArea.foreground,
                    }}
                >
                    <div className="SecondaryArea">
                        <div className="AddressSwitcherArea">
                            <AddressSwitcher
                                addresses={ props.addresses }
                                colors={ props.colors.accountColors }
                                selectAddress={ props.selectAddress }
                            />
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
