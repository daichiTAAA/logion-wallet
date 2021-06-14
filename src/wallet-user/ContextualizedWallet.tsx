import React from 'react';
import Button from 'react-bootstrap/Button';

import { useLogionChain, ApiState, NodeMetadata } from '../logion-chain';

import Shell from '../Shell';
import UserRouter from "./UserRouter";
import { useUserContext } from "./UserContext";

function status(apiState: ApiState, metadata: NodeMetadata | null): string {
    if(apiState === 'READY' && metadata === null) {
        return "connected";
    } else if(apiState === 'READY' && metadata !== null) {
        return `connected to node "${metadata.name}" (Peer ID: ${metadata.peerId})`;
    } else if(apiState === 'DISCONNECTED') {
        return "disconnected";
    } else if(apiState === 'ERROR') {
        return "disconnected (error)";
    } else {
        return "connecting";
    }
}

export default function ContextualizedWallet() {
    const { injectedAccounts, apiState, connect, connectedNodeMetadata } = useLogionChain();
    const { setUserAddress } = useUserContext();

    if(injectedAccounts === null || setUserAddress === null) {
        return null;
    }

    const connectButton = apiState === 'DISCONNECTED' ? <Button onClick={connect}>Connect</Button> : null;
    const userContext = apiState === 'READY' ? <UserRouter /> : null;

    return (
        <Shell>
            <h1>You are ready to use the Logion wallet, congratulations!</h1>

            <p>The following account(s) were detected:</p>
            <ul>
                {injectedAccounts.map(injectedAccount =>
                    <li key={injectedAccount.address}>
                        <Button variant="link" onClick={ () => setUserAddress(injectedAccount.address) }>{injectedAccount.address} ({injectedAccount.meta.name || ""})</Button>
                    </li>
                )}
            </ul>
            <p>You are currently {status(apiState, connectedNodeMetadata)}</p>
            {connectButton}
            {userContext}
        </Shell>
    );
}
