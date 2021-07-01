import React, { useCallback, useState, useEffect } from 'react';

import {
    useLogionChain,
    Unsubscriber,
    ISubmittableResult,
    replaceUnsubscriber,
    isFinalized
} from '../../logion-chain';
import { createRecovery } from '../../logion-chain/Recovery';
import ExtrinsicSubmissionResult from '../../legal-officer/ExtrinsicSubmissionResult';

import { ProtectionRequest } from "../../legal-officer/Types";
import LegalOfficer from '../../component/types/LegalOfficer';
import { ContentPane } from "../../component/Dashboard";
import Frame from "../../component/Frame";
import Alert from '../../component/Alert';
import Button from '../../component/Button';
import { useRootContext } from '../../RootContext';

import { useUserContext } from '../UserContext';

import { legalOfficerByAddress, checkActivation } from "./Model";
import LegalOfficers from './LegalOfficers';

export type ProtectionRecoveryRequestStatus = 'pending' | 'accepted' | 'activated';

export interface Props {
    request: ProtectionRequest,
    type: ProtectionRecoveryRequestStatus;
}

export default function ProtectionRecoveryRequest(props: Props) {
    const { api } = useLogionChain();
    const { selectAddress, addresses, currentAddress } = useRootContext();
    const { refreshRequests, colorTheme } = useUserContext();
    const [ activationResult, setActivationResult ] = useState<ISubmittableResult | null>(null);
    const [ activationError, setActivationError ] = useState<any>(null);
    const [ activationUnsubscriber, setActivationUnsubscriber ] = useState<Unsubscriber | null>(null);
    const [ refreshedAfterActivation, setRefreshedAfterActivation ] = useState<boolean>(false);
    const [ confirmButtonEnabled, setConfirmButtonEnabled ] = useState(props.request.status === "PENDING");

    const activateProtection = useCallback((request: ProtectionRequest) => {
        setActivationResult(null);
        setActivationError(null);
        (async function() {
            const unsubscriber = createRecovery({
                api: api!,
                signerId: currentAddress,
                callback: setActivationResult,
                errorCallback: setActivationError,
                legalOfficers: request.decisions.map(decision => decision.legalOfficerAddress),
            });
            await replaceUnsubscriber(activationUnsubscriber, setActivationUnsubscriber, unsubscriber);
            refreshRequests!();
        })();
    }, [ api, currentAddress, refreshRequests, activationUnsubscriber, setActivationUnsubscriber ]);

    useEffect(() => {
        if (isFinalized(activationResult) && !refreshedAfterActivation) {
            setRefreshedAfterActivation(true);
            checkActivation(props.request)
                .finally(() => refreshRequests!())
        }
    }, [ activationResult, refreshedAfterActivation, setRefreshedAfterActivation, refreshRequests, props ]);

    if(addresses === null || selectAddress === null) {
        return null;
    }

    const legalOfficer1: LegalOfficer = legalOfficerByAddress(props.request.decisions[0].legalOfficerAddress);
    const legalOfficer1Decision = props.request.decisions[0].status;
    const legalOfficer2: LegalOfficer = legalOfficerByAddress(props.request.decisions[1].legalOfficerAddress);
    const legalOfficer2Decision = props.request.decisions[1].status;

    const forAccount = props.request.addressToRecover !== null ? ` for account ${props.request.addressToRecover}` : "";

    const mainTitle = props.request.isRecovery ? "Recovery" : "My Logion Trust Protection";
    let subTitle;
    let alert;
    if(props.type === 'pending') {
        subTitle = props.request.isRecovery ? "Recovery process status" : undefined;
        if(props.request.isRecovery) {
            subTitle = "Recovery process status";
            alert = (
                <Alert variant="info">
                    Your Logion Recovery request
                    { forAccount } has been submitted. Your Legal Officers
                    will contact you as soon as possible to finalize the KYC process.
                </Alert>
            );
        } else {
            alert = (
                <Alert variant="info">
                    Your Logion Trust Protection request has been submitted. Your Legal Officers
                    will contact you as soon as possible to finalize the KYC process. Please note that, after the successful
                    completion of one of your Legal Officer approval processes, you will be able to use all features
                    provided by your logion account dashboard.
                </Alert>
            );
        }
    } else if(props.type === 'accepted') {
        if(props.request.isRecovery) {
            subTitle = "My recovery request";
            alert = (
                <Alert variant="info">
                    Your recovery request has been accepted by your Legal Officers.
                    You may now activate your protection. After that, you'll be able to initiate the actual
                    recovery.
                </Alert>
            );
        } else {
            subTitle = "My Logion Trust protection request";
            alert = (
                <Alert variant="info">
                    Your Logion Trust Protection request has been accepted by your
                    Legal Officers. You may now activate your protection.
                </Alert>
            );
        }
    } else if(props.type === 'activated') {
        if(props.request.isRecovery) {
            alert = (
                <Alert variant="info">
                    You are now ready to initiate the actual recovery.
                </Alert>
            );
        } else {
            alert = (
                <Alert variant="info">
                    Your Logion Trust Protection is active.
                </Alert>
            );
        }
    } else {
        alert = null;
    }

    return (
        <ContentPane
            mainTitle={ mainTitle }
            subTitle={ subTitle }
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
            primaryPaneWidth={ 8 }
            primaryAreaChildren={
                <Frame
                    colors={ colorTheme }
                >
                    { alert }

                    {
                        props.type === 'accepted' && activationResult === null &&
                        <Button
                            data-testid="btnActivate"
                            onClick={() => activateProtection(props.request)}
                            backgroundColor={ colorTheme.buttons.secondaryBackgroundColor }
                        >
                            Activate
                        </Button>
                    }
                    {
                        (activationResult !== null || activationError !== null) &&
                        <ExtrinsicSubmissionResult
                            result={activationResult}
                            error={activationError}
                            successMessage="Protection successfully activated."
                        />
                    }

                    <LegalOfficers
                        legalOfficers={ [] }
                        legalOfficer1={ legalOfficer1 }
                        setLegalOfficer1={ () => {} }
                        legalOfficer1Decision={ legalOfficer1Decision }
                        legalOfficer2={ legalOfficer2 }
                        setLegalOfficer2={ () => {} }
                        legalOfficer2Decision={ legalOfficer2Decision }
                        colorTheme={ colorTheme }
                        mode="view"
                    />
    
                    {
                        props.type === 'activated' && props.request.isRecovery &&
                        <p>
                            You may initiate the actual recovery of account {props.request.addressToRecover}.
                        </p>
                    }
                    {
                        // This button is a safety net in case the same call at the previous step failed.
                        // In most cases, it will not show
                        props.type === 'activated' && confirmButtonEnabled &&
                        <>
                            <p>Mandatory: we detect that the Logion Application needs to be re-synchronized with the Logion
                                Blockchain. To proceed, please click on the button and sign to confirm this operation:</p>
                            <Button
                                id="btnConfirmProtection"
                                onClick={() => {
                                checkActivation(props.request)
                                    .then(() => setConfirmButtonEnabled(false))
                                }}
                                backgroundColor={ colorTheme.buttons.secondaryBackgroundColor }
                            >
                                Re-Sync Confirmation
                            </Button>
                        </>
                    }
                </Frame>
            }
            secondaryAreaChildren={ null }
        />
    );
}
