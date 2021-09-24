import React from 'react';

import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';

export default function RequestedLocs() {
    const { pendingLocRequests } = useCommonContext();

    if(pendingLocRequests === null) {
        return null;
    }

    return (
        <Table
            columns={[
                {
                    header: "Legal officer",
                    render: request => <Cell content={ request.ownerAddress }  overflowing tooltipId={ `dest-${request.id}` } />,
                    align: 'left',
                },
                {
                    "header": "Description",
                    render: request => <Cell content={ request.description } />,
                    align: 'left',
                },
                {
                    header: "Status",
                    render: request => <LocStatusCell status={ request.status }/>,
                    width: "140px",
                },
                {
                    header: "Creation date",
                    render: request => <DateCell dateTime={ request.createdOn || null } />,
                    width: '200px',
                }
            ]}
            data={ pendingLocRequests }
            renderEmpty={ () => <EmptyTableMessage>No requested LOCs</EmptyTableMessage> }
        />
    );
}