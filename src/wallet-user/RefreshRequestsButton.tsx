import React from 'react';
import Button from 'react-bootstrap/Button';

import { useUserContext } from './UserContext';

export default function RefreshRequestsButton() {
    const { refreshRequests } = useUserContext();
    if(refreshRequests === null) {
        return null;
    } else {
        return <Button onClick={refreshRequests}>Refresh requests</Button>;
    }
}