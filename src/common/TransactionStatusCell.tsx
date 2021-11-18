import { Transaction } from "./types/ModelTypes";
import Icon from "./Icon";
import { Col } from "./Grid";
import Detail from "./Detail";
import './TransactionStatusCell.css';

export interface StatusCellProps {
    transaction: Transaction
}

export function TransactionStatusCell(props: StatusCellProps) {
    const iconId = props.transaction.successful ? "ok" : "ko";
    return (
        <div className="TransactionStatusCell">
            <Icon icon={ { id: iconId } } />
        </div>);
}

export function TransactionStatusCellDetails(props: StatusCellProps) {
    if (props.transaction.successful) {
        return (
            <>
                <Col>
                    <Detail label="Description" value="Transaction OK" />
                </Col>
            </>
        );
    }
    const error = props.transaction.error;
    const errorCode = error ? `${ error.section }.${ error.name }` : "unknown"
    const description = error ? error.details : "An unknown error occurred"
    return (
        <>
            <Col>
                <Detail label="Error code" value={ errorCode } />
            </Col>
            <Col>
                <Detail label="Description" value={ description } />
            </Col>
        </>
    );
}

