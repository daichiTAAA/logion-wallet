import { prefixedLogBalance } from "../logion-chain/Balances";
import { PrefixedNumber } from "../logion-chain/numbers";
import { GREEN, RED } from "./ColorTheme";
import Icon from "./Icon";
import { Cell } from "./Table";
import Accounts from "./types/Accounts";
import { Transaction } from "./types/ModelTypes";

import './TransferAmountCell.css';

export interface Props {
    amount: PrefixedNumber | null,
}

export default function TransferAmountCell(props: Props) {
    if(props.amount === null) {
        return <Cell content="-" align="center" />;
    } else if(props.amount.isNegative()) {
        return (
            <div className="TransferAmountCell">
                <Icon icon={{id: 'send_red'}} />
                <span className="number" style={{color: RED}}>
                    { props.amount.coefficient.toFixedPrecision(2) + " " + props.amount.prefix.symbol }
                </span>
            </div>
        );
    } else if(props.amount.coefficient.isZero()) {
        return (
            <div className="TransferAmountCell" style={{justifyContent: 'flex-end'}}>
                <span className="number">
                    { props.amount.coefficient.toFixedPrecision(2) + " " + props.amount.prefix.symbol }
                </span>
            </div>
        );
    } else {
        return (
            <div className="TransferAmountCell">
                <Icon icon={{id: 'receive_green'}} />
                <span className="number" style={{color: GREEN}}>
                    { props.amount.coefficient.toFixedPrecision(2) + " " + props.amount.prefix.symbol }
                </span>
            </div>
        );
    }
}

export function transferBalance(accounts: Accounts, transaction: Transaction): PrefixedNumber {
    const amount = prefixedLogBalance(transaction.transferValue);
    if(transaction.from === accounts!.current!.address) {
        return amount.negate();
    } else {
        return amount;
    }
}
