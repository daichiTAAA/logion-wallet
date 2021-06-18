import React from 'react';

import { ContentPane } from '../component/Dashboard';
import Frame from '../component/Frame';

import { useLegalOfficerContext } from './LegalOfficerContext';
import PendingProtectionRequests from './PendingProtectionRequests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';
import RefreshTokenizationRequestsButton from './RefreshTokenizationRequestsButton';
import ProtectedUsers from "./ProtectedUsers";

export default function ProtectionRequests() {
    const { colorTheme } = useLegalOfficerContext();

    return (
        <ContentPane
            primaryAreaChildren={
                <>
                    <h1>Protection Requests</h1>
                    <Frame
                            colors={colorTheme}
                    >
                        <RefreshTokenizationRequestsButton/>
                        <PendingProtectionRequests/>
                    </Frame>
                    <h1>Activated User Account Protection under my watch</h1>
                    <Frame
                            colors={colorTheme}
                    >
                        <ProtectedUsers/>
                    </Frame>
                </>
            }
            secondaryAreaChildren={
                <Frame
                    colors={ colorTheme }
                >
                    <ProtectionRequestsHistory />
                </Frame>
            }
        />
    );
}
