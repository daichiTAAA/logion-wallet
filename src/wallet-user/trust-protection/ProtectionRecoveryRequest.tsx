import { useCallback, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { LegalOfficer, PendingProtection, UnavailableProtection } from "@logion/client";

import { useLogionChain } from '../../logion-chain';

import { FullWidthPane } from "../../common/Dashboard";
import Frame from "../../common/Frame";
import Button from '../../common/Button';
import Icon from '../../common/Icon';
import { GREEN, ORANGE, rgbaToHex, YELLOW } from '../../common/ColorTheme';
import { useCommonContext } from '../../common/CommonContext';
import NetworkWarning from '../../common/NetworkWarning';
import ClientExtrinsicSubmitter, { Call } from '../../ClientExtrinsicSubmitter';

import { useUserContext } from '../UserContext';
import { SETTINGS_PATH } from '../UserRouter';

import SelectLegalOfficer from './SelectLegalOfficer';

import './ProtectionRecoveryRequest.css';
import { ProtectionRequestStatus } from '@logion/client/dist/RecoveryClient';

export type ProtectionRecoveryRequestStatus = 'pending' | 'accepted' | 'activated' | 'unavailable';

export interface Props {
    type: ProtectionRecoveryRequestStatus,
}

export default function ProtectionRecoveryRequest(props: Props) {
    const { getOfficer } = useLogionChain();
    const { colorTheme, availableLegalOfficers, nodesDown } = useCommonContext();
    const { protectionState, activateProtection, claimRecovery } = useUserContext();
    const [ activationCall, setActivationCall ] = useState<Call>();
    const [ claimCall, setClaimCall ] = useState<Call>();

    const activateProtectionCallback = useCallback(async () => {
        setActivationCall(() => activateProtection!);
    }, [ activateProtection, setActivationCall ]);

    const claimRecoveryCallback = useCallback(async () => {
        setActivationCall(undefined);
        setClaimCall(() => claimRecovery!);
    }, [ claimRecovery, setClaimCall ]);

    if(protectionState === undefined || availableLegalOfficers === undefined || getOfficer === undefined) {
        return null;
    }

    if(props.type !== 'unavailable') {
        const protectionParameters = protectionState.protectionParameters;
        const legalOfficer1: LegalOfficer = protectionParameters.states[0].legalOfficer;
        const legalOfficer2: LegalOfficer = protectionParameters.states[1].legalOfficer;
        let legalOfficer1Status: ProtectionRequestStatus;
        let legalOfficer2Status: ProtectionRequestStatus;
        if(protectionState instanceof PendingProtection) {
            legalOfficer1Status = protectionParameters.states[0].status;
            legalOfficer2Status = protectionParameters.states[1].status;
        } else if(props.type === 'accepted') {
            legalOfficer1Status = 'ACCEPTED';
            legalOfficer2Status = 'ACCEPTED';
        } else {
            legalOfficer1Status = 'ACTIVATED';
            legalOfficer2Status = 'ACTIVATED';
        }

        const forAccount = protectionParameters.isRecovery ? ` for account ${protectionParameters.recoveredAddress}` : "";

        const mainTitle = protectionParameters.isRecovery && !protectionParameters.isClaimed ? "Recovery" : "My Logion Protection";
        let subTitle;
        let header = null;
        if(props.type === 'pending') {
            subTitle = protectionParameters.isRecovery ? "Recovery process status" : undefined;
            if(protectionParameters.isRecovery) {
                subTitle = "Recovery process status";
                header = (
                    <Header
                        icon="pending"
                        color={ ORANGE }
                        text={`Your Logion Recovery request ${forAccount} has been submitted. Your Legal Officers will contact you
                        as soon as possible to finalize the KYC process.`}
                    />
                );
            } else {
                header = (
                    <Header
                        icon="pending"
                        color={ ORANGE }
                        text={`Your Logion Protection request has been submitted. Your Legal Officers
                        will contact you as soon as possible to finalize the KYC process. Please note that, after the successful
                        completion of one of your Legal Officer approval processes, you will be able to use all features
                        provided by your logion account dashboard.`}
                    />
                );
            }
        } else if(props.type === 'accepted') {
            if(protectionParameters.isRecovery) {
                subTitle = "My recovery request";
                header = (
                    <Header
                        icon="accepted"
                        color={ YELLOW }
                        text={`Your recovery request has been accepted by your Legal Officers.
                        You may now activate your protection. This will require 2 signatures.
                        After that, you'll be able to initiate the actual recovery.`}
                    />
                );
            } else {
                subTitle = "My Logion protection request";
                header = (
                    <Header
                        icon="accepted"
                        color={ YELLOW }
                        text={`Your Logion Protection request has been accepted by your
                        Legal Officers. You may now activate your protection.`}
                    />
                );
            }
        } else if(props.type === 'activated') {
            if(protectionParameters.isRecovery && !protectionParameters.isClaimed) {
                header = (
                    <Header
                        icon="activated"
                        color={ GREEN }
                        text={`You are now ready to claim the access to address ${protectionParameters.recoveredAddress}.`}
                    />
                );
            } else {
                header = (
                    <Header
                        icon="activated"
                        color={ GREEN }
                        text={`Your Logion Protection is active`}
                    />
                );
            }
        }

        return (
            <FullWidthPane
                mainTitle={ mainTitle }
                subTitle={ subTitle }
                titleIcon={{
                    icon: {
                        id: protectionParameters.isRecovery && !protectionParameters.isClaimed ? 'recovery' : 'shield',
                        hasVariants: protectionParameters.isRecovery && !protectionParameters.isClaimed ? false : true,
                    },
                    background: protectionParameters.isRecovery && !protectionParameters.isClaimed ? colorTheme.recoveryItems.iconGradient : undefined,
                }}
            >
                    {
                        nodesDown.length > 0 &&
                        <NetworkWarning settingsPath={ SETTINGS_PATH } />
                    }
                    <Frame className="ProtectionRecoveryRequest">
                        { header }

                        {
                            props.type === 'accepted' && !protectionParameters.isActive && activationCall === undefined &&
                            <Button
                                data-testid="btnActivate"
                                onClick={ activateProtectionCallback }
                            >
                                Activate
                            </Button>
                        }
                        <ClientExtrinsicSubmitter
                            successMessage="Protection successfully activated."
                            call={ activationCall }
                        />
                        {
                            props.type === 'activated' && protectionParameters.isRecovery && !protectionParameters.isClaimed && claimCall === undefined &&
                            <Button
                                data-testid="btnClaim"
                                onClick={ claimRecoveryCallback }
                            >
                                Claim
                            </Button>
                        }
                        <ClientExtrinsicSubmitter
                            successMessage="Recovery successfully initiated."
                            call={ claimCall }
                        />

                        <Row className="legal-officers">
                            <Col md={6}>
                                <SelectLegalOfficer
                                    legalOfficerNumber={ 1 }
                                    legalOfficer={ legalOfficer1 }
                                    otherLegalOfficer={ legalOfficer2 }
                                    legalOfficers={ availableLegalOfficers }
                                    mode="view"
                                    status={ legalOfficer1Status }
                                />
                            </Col>
                            <Col md={6}>
                                <SelectLegalOfficer
                                    legalOfficerNumber={ 2 }
                                    legalOfficer={ legalOfficer2 }
                                    otherLegalOfficer={ legalOfficer1 }
                                    legalOfficers={ availableLegalOfficers }
                                    mode="view"
                                    status={ legalOfficer2Status }
                                />
                            </Col>
                        </Row>

                        <Row className="footer">
                            <Col md={4} className="legal-officers-images">
                                <img className="legal-officer-male-image" alt="male legal officer" src={process.env.PUBLIC_URL + "/assets/landing/protection_male.svg"}/>
                                <img className="legal-officer-female-image" alt="female legal officer" src={process.env.PUBLIC_URL + "/assets/landing/protection_female.svg"}/>
                            </Col>
                            <Col md={8} className="legal-officers-text">
                                <p className="foundation"><strong>The foundation of</strong> your protection</p>
                                <p>
                                    In charge of a <strong>public office</strong>, Logion Legal Officers are <strong>identified Judicial Officers</strong>,<br/>who apply a
                                    strict code of ethics and are <strong>legaly responsible</strong> for their actions<br/>
                                    while legally securing your digital assets and digital transactions.
                                </p>
                            </Col>
                        </Row>
                    </Frame>
            </FullWidthPane>
        );
    } else {
        const unavailableProtection = protectionState as UnavailableProtection;
        const mainTitle = unavailableProtection.isRecovery ? "Recovery" : "My Logion Protection";

        return (
            <FullWidthPane
                mainTitle={ mainTitle }
                titleIcon={{
                    icon: {
                        id: unavailableProtection.isRecovery ? 'recovery' : 'shield',
                        hasVariants: unavailableProtection.isRecovery ? false : true,
                    },
                    background: unavailableProtection.isRecovery ? colorTheme.recoveryItems.iconGradient : undefined,
                }}
            >
                    {
                        nodesDown.length > 0 &&
                        <NetworkWarning settingsPath={ SETTINGS_PATH } />
                    }
                    <Frame className="ProtectionRecoveryRequest network-warning">

                        {
                            unavailableProtection.isActivated &&
                            <div
                                className="alert-activated"
                                style={{
                                    color: GREEN,
                                    borderColor: GREEN,
                                }}
                            >
                                <Icon
                                    icon={{id: 'activated'}}
                                /> Your Logion Trust Protection is active
                            </div>
                        }
                        <p>The node of one of your legal officers is down. Please come back later in order to proceed.</p>
                    </Frame>
            </FullWidthPane>
        );
    }
}

interface HeaderProps {
    color: string;
    icon: string;
    text: string;
}

function Header(props: HeaderProps) {
    const backgroundColor = rgbaToHex(props.color, 0.2);
    return (
        <div
            className="header"
        >
            <Icon
                icon={{id: props.icon}}
            />
            <br/>
            <p
                className="text"
                style={{
                    color: props.color,
                    borderColor: props.color,
                    backgroundColor: backgroundColor,
                }}
            >
                { props.text }
            </p>
        </div>
    );
}
