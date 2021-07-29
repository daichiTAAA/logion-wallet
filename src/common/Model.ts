import axios from 'axios';

import {
    TokenizationRequestStatus,
    TokenizationRequest,
    TransactionsSet,
    LegalOfficerDecisionStatus,
    ProtectionRequestStatus,
    ProtectionRequest,
    Transaction,
} from './types/ModelTypes';

export interface FetchRequestSpecification {
    legalOfficerAddress?: string,
    requesterAddress?: string,
    status: TokenizationRequestStatus
}

export async function fetchRequests(specification: FetchRequestSpecification): Promise<TokenizationRequest[]> {
    const response = await axios.put("/api/token-request", specification);
    return response.data.requests;
}

export type ProtectionRequestKind = 'RECOVERY' | 'PROTECTION_ONLY' | 'ANY';

export interface FetchProtectionRequestSpecification {
    legalOfficerAddress?: string,
    requesterAddress?: string,
    decisionStatuses: LegalOfficerDecisionStatus[],
    kind: ProtectionRequestKind,
    protectionRequestStatus?: ProtectionRequestStatus,
}

export async function fetchProtectionRequests(
        specification: FetchProtectionRequestSpecification): Promise<ProtectionRequest[]> {
    const response = await axios.put("/api/protection-request", specification);
    return response.data.requests;
}

export interface FetchTransactionsSpecficication {
    address: string,
}

export async function getTransactions(request: FetchTransactionsSpecficication): Promise<TransactionsSet> {
    const response = await axios.put("/api/transaction", request);
    return {
        transactions: response.data.transactions.map((transaction: Transaction) => enrichTransaction(transaction, request.address))
    };
}

function enrichTransaction(transaction: Transaction, address: string): Transaction {
    return {
        ...transaction,
        type: transactionType(transaction, address)
    }
}

function transactionType(transaction: Transaction, address: string): string {
    console.log(transaction);
    if(transaction.pallet === "recovery") {
        if(transaction.method === "createRecovery") {
            return "Recovery created";
        } else if(transaction.method === "vouchRecovery") {
            return "Recovery vouched";
        } else if(transaction.method === "initiateRecovery") {
            return "Recovery initiated";
        } else if(transaction.method === "claimRecovery") {
            return "Recovery claimed";
        } else if(transaction.method === "asRecovered") {
            return "Assets recovered";
        } else {
            return "Other";
        }
    } else if(transaction.pallet === "balances") {
        if(transaction.method.startsWith("transfer")) {
            if(transaction.from === address) {
                return "Sent";
            } else {
                return "Received";
            }
        } else {
            return "Other";
        }
    } else if(transaction.pallet === "assets") {
        if(transaction.method === "mint") {
            return "Asset tokens minted";
        } else if(transaction.method === "create") {
            return "Asset created";
        } else if(transaction.method === "setMetadata") {
            return "Asset metadata set";
        } else {
            return "Other";
        }
    } else {
        return 'Other';
    }
}