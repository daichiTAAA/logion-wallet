import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useHistory } from 'react-router-dom';

import { CoinBalance, prefixedLogBalance } from '../logion-chain/Balances';

import { useCommonContext } from './CommonContext';

import { FullWidthPane } from './Dashboard';
import Frame from './Frame';
import Table, { Cell, DateCell, EmptyTableMessage, ActionCell } from './Table';
import Icon from './Icon';
import Button from './Button';
import WalletGauge from './WalletGauge';
import Loader from './Loader';
import { Transaction } from './types/ModelTypes';

import './Wallet.css';

export interface Props {
    transactionsPath: (coinId: string) => string,
}

export default function Wallet(props: Props) {
    const { colorTheme } = useCommonContext();

    return (
        <FullWidthPane
            className="Wallet"
            mainTitle="Wallet"
            titleIcon={{
                icon: {
                    id: 'wallet'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
        >
            <Content { ...props } />
        </FullWidthPane>
    );
}

export function Content(props: Props) {
    const { balances, transactions } = useCommonContext();
    const history = useHistory();

    if(balances === null || transactions === null) {
        return <Loader />;
    }

    const latestTransaction = transactions[0];

    return (
        <>
            <Row>
                <Col md={8}>
                    <Frame
                        title="Asset balances"
                        fillHeight
                    >
                        <Table
                            columns={[
                                {
                                    header: "Asset name",
                                    render: balance => <AssetNameCell balance={ balance } />,
                                    width: "180px",
                                    align: 'left',
                                },
                                {
                                    header: "Balance",
                                    render: balance => <Cell content={ balance.balance.coefficient.toFixedPrecision(2) } />,
                                    width: "150px",
                                    align: 'right',
                                },
                                {
                                    header: "Last transaction date",
                                    render: balance => <DateCell dateTime={ balance.coin.id !== 'dot' && latestTransaction !== undefined ? latestTransaction.createdOn : null } />
                                },
                                {
                                    header: "Last transaction type",
                                    render: balance => <Cell content={ balance.coin.id !== 'dot' && latestTransaction !== undefined ? latestTransaction.type : "-" } />
                                },
                                {
                                    header: "Last transaction amount",
                                    render: balance => <Cell content={ balance.coin.id !== 'dot' && latestTransaction !== undefined ? prefixedLogBalance(transactionAmount(latestTransaction)).convertTo(balance.balance.prefix).coefficient.toFixedPrecision(2) : '-' } />,
                                    align: 'right',
                                },
                                {
                                    header: "",
                                    render: balance => balance.coin.id !== 'dot' ? <ActionCell><Button onClick={() => history.push(props.transactionsPath(balance.coin.id))}>More</Button></ActionCell> : <NotAvailable/>,
                                    width: "200px",
                                }
                            ]}
                            data={ balances }
                            renderEmpty={ () => <EmptyTableMessage>You have no asset yet</EmptyTableMessage> }
                        />
                    </Frame>
                </Col>
                <Col md={4}>
                    <Frame
                        title="Current LOG balance"
                        fillHeight
                    >
                        <WalletGauge
                            coin={ balances[0].coin }
                            balance={ balances[0].balance }
                            level={ balances[0].level }
                            type='arc'
                        />
                    </Frame>
                </Col>
            </Row>
        </>
    );
}

interface AssetNameCellProps {
    balance: CoinBalance,
}

export function AssetNameCell(props: AssetNameCellProps) {

    return (
        <div className="asset-name-cell">
            <Icon icon={{id: props.balance.coin.iconId}} type={ props.balance.coin.iconType } height="36px" width="auto" />
            <span className="name">{ props.balance.coin.name } ({ props.balance.balance.prefix.symbol }{ props.balance.coin.symbol })</span>
        </div>
    );
}

function NotAvailable() {

    return (
        <div className="not-available">
            <span>Not available (yet)</span>
        </div>
    );
}

function transactionAmount(transaction: Transaction): string {
    if(transaction.type === 'Received') {
        return transaction.transferValue;
    } else if(transaction.type === 'Sent') {
        return "-" + transaction.transferValue;
    } else {
        return transaction.total;
    }
}
