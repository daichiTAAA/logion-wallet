import { useCallback, useState } from "react";
import { SignAndSubmit } from "../ExtrinsicSubmitter";
import { useLogionChain } from "../logion-chain";
import { prefixedLogBalance, SYMBOL } from "../logion-chain/Balances";
import { VaultApi, VaultTransferRequest } from "../vault/VaultApi";
import AmountCell from "./AmountCell";
import Button from "./Button";
import ButtonGroup from "./ButtonGroup";
import { useCommonContext } from "./CommonContext";
import Icon from "./Icon";

import LegalOfficerName from "./LegalOfficerNameCell";
import RequestToCancel from "./RequestToCancel";
import { useResponsiveContext } from "./Responsive";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "./Table";
import VaultTransferRequestDetails from "./VaultTransferDetails";
import { cancelVaultTransferCallback, onCancelVaultTransferSuccessCallback } from "./VaultTransferRequestsCallbacks";
import VaultTransferRequestStatusCell from "./VaultTransferRequestStatusCell";

export default function RejectedVaultTransferRequests() {
    const { api } = useLogionChain();
    const { width } = useResponsiveContext();
    const { rejectedVaultTransferRequests, axiosFactory, refresh, accounts } = useCommonContext();
    const [ requestToCancel, setRequestToCancel ] = useState<VaultTransferRequest | null>(null);
    const [ cancelFailed, setCancelFailed ] = useState(false);
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    const cancelRequestCallback = useCallback(() => cancelVaultTransferCallback({
        api: api!,
        requestToCancel: requestToCancel!,
        signerId: accounts!.current!.address,
        setSignAndSubmit
    }), [ accounts, api, requestToCancel, setSignAndSubmit ]);

    const onCancelSuccessCallback = useCallback(() => onCancelVaultTransferSuccessCallback({
        requestToCancel: requestToCancel!,
        axiosFactory: axiosFactory!,
        refresh: refresh!,
        setSignAndSubmit,
        setRequestToCancel
    }), [ requestToCancel, axiosFactory, setRequestToCancel, refresh ]);

    const resubmitRequestCallback = useCallback((request: VaultTransferRequest) => {
        (async function() {
            const legalOfficer = request.legalOfficerAddress;
            const api = new VaultApi(axiosFactory!(legalOfficer), legalOfficer);
            await api.resubmitVaultTransferRequest(request.id);
            refresh!();
        })()
    }, [ axiosFactory, refresh ]);

    if(!rejectedVaultTransferRequests) {
        return null;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "Legal Officer",
                        render: request => <LegalOfficerName address={ request.legalOfficerAddress } />,
                        align: 'left',
                        renderDetails: request => <VaultTransferRequestDetails request={ request } />
                    },
                    {
                        header: "Type",
                        render: () => <Cell content={`${SYMBOL}`} />,
                        width: '80px',
                    },
                    {
                        header: "Amount",
                        render: request => <AmountCell amount={ prefixedLogBalance(request.amount) } />,
                        align: 'right',
                        width: width({
                            onSmallScreen: "100px",
                            otherwise: "120px"
                        }),
                    },
                    {
                        header: "Status",
                        render: request => <VaultTransferRequestStatusCell status={ request.status } viewer="Wallet User" />,
                        width: '150px',
                    },
                    {
                        header: "Creation date",
                        render: request => <DateTimeCell dateTime={ request.createdOn } />,
                        width: '130px',
                    },
                    {
                        header: "Decision",
                        render: request => <DateTimeCell dateTime={ request.decision!.decisionOn } />,
                        width: '130px',
                    },
                    {
                        header: "Submit again?",
                        render: request => (
                            <ButtonGroup aria-label="actions">
                                <Button
                                    onClick={ cancelRequestCallback }
                                    variant="none"
                                >
                                    <Icon icon={{id: "ko"}} height='40px' />
                                </Button>
                                <Button
                                    onClick={ () => resubmitRequestCallback(request) }
                                    variant="none"
                                >
                                    <Icon icon={{id: "ok"}} height='40px' />
                                </Button>
                            </ButtonGroup>
                        ),
                        width: '130px',
                    },
                ]}
                data={ rejectedVaultTransferRequests }
                renderEmpty={ () => <EmptyTableMessage>No request to display</EmptyTableMessage> }
            />
            <RequestToCancel
                cancelFailed={ cancelFailed }
                cancelRequestCallback={ cancelRequestCallback }
                onCancelSuccessCallback={ onCancelSuccessCallback }
                requestToCancel={ requestToCancel }
                setCancelFailed={ setCancelFailed }
                setRequestToCancel={ setRequestToCancel }
                setSignAndSubmit={ setSignAndSubmit }
                signAndSubmit={ signAndSubmit }
            />
        </>
    );
}