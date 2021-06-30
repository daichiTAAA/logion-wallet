import React from 'react';

import { ProtectionRequest } from "../../legal-officer/Types";
import {FullWidthPane} from "../../component/Dashboard";
import Frame from "../../component/Frame";
import { useRootContext } from '../../RootContext';

import { useUserContext } from '../UserContext';

import { legalOfficerByAddress } from "./Model";

export interface Props {
    request: ProtectionRequest,
}

export default function RequestPending(props: Props) {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useUserContext();

    if(addresses === null || selectAddress === null) {
        return null;
    }

    if(props.request.isRecovery) {
        const forAccount = props.request.addressToRecover !== null ? ` for account ${props.request.addressToRecover}` : "";
        return (
            <FullWidthPane
                colors={ colorTheme }
                addresses={ addresses }
                selectAddress={ selectAddress }
            >
                <h1>My Logion Trust Protection</h1>
                <Frame
                    colors={ colorTheme }
                >
                    <h2>Recovery Process Status</h2>
                    <p>
                        Your Logion Recovery request ({ props.request.id })
                        { forAccount } has been submitted. A Legal Officer
                        will contact you as soon as possible to finalize the KYC process.
                    </p>
                    <ul>
                    {
                        props.request.decisions.map(decision => (
                            <li key={decision.legalOfficerAddress}>
                                {legalOfficerByAddress(decision.legalOfficerAddress).name} ({decision.legalOfficerAddress}): {decision.status}
                            </li>
                        ))
                    }
                    </ul>
                </Frame>
            </FullWidthPane>
        );
    } else {
        return (
            <FullWidthPane
                colors={ colorTheme }
                addresses={ addresses }
                selectAddress={ selectAddress }
            >
                <h1>My Logion Trust Protection</h1>
                <Frame
                    colors={ colorTheme }
                >
                    <h2>Protection request status</h2>
                    <p>
                        Your Logion Trust Protection request ({props.request.id}) has been submitted. A Legal Officer
                        will contact you as soon as possible to finalize the KYC process. Please note that, after the successful
                        completion of one of your Legal Officer approval processes, you will be able to use all features
                        provided by your logion account dashboard.
                    </p>
                    <ul>
                    {
                        props.request.decisions.map(decision => (
                            <li key={decision.legalOfficerAddress}>
                                {legalOfficerByAddress(decision.legalOfficerAddress).name} ({decision.legalOfficerAddress}): {decision.status}
                            </li>
                        ))
                    }
                    </ul>
                </Frame>
            </FullWidthPane>
        );
    }
}
