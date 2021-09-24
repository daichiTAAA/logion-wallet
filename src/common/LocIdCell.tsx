import React from 'react';

import { UUID } from '../logion-chain/UUID';

import { Cell } from './Table';
import { LocRequestStatus } from './types/ModelTypes';

export interface Props {
    status: LocRequestStatus;
    id: string;
}

export default function LocIdCell(props: Props) {
    
    let content: string;
    if(props.status === 'OPEN') {
        content = new UUID(props.id).toDecimalString();
    } else {
        content = "-";
    }

    return (
        <Cell
            content={ content }
        />
    );
}