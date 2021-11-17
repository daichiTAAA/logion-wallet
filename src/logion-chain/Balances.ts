import { ApiPromise } from '@polkadot/api';
import { PrefixedNumber, ScientificNumber, convertToPrefixed, NONE, ATTO } from "./numbers";
import { ExtrinsicSubmissionParameters, Unsubscriber, signAndSend } from './Signature';
import { Call } from "@polkadot/types/interfaces";
import { SubmittableExtrinsic } from "@polkadot/api/submittable/types";

const LOG_DECIMALS = 18;
export const LOG_SMALLEST_UNIT = ATTO;
export const SYMBOL = "LGNT";

export interface GetAccountDataParameters {
    api: ApiPromise,
    accountId: string,
}

export interface AccountData {
    available: string,
    reserved: string,
}

export async function getAccountData(parameters: GetAccountDataParameters): Promise<AccountData> {
    const {
        api,
        accountId,
    } = parameters;

    const accountData = await api.query.system.account(accountId);

    return {
        available: accountData.data.free.toString(),
        reserved: accountData.data.reserved.toString(),
    };
}
export interface Coin {
    id: string,
    name: string,
    iconId: string,
    iconType: 'svg' | 'png',
    symbol: string,
}

export interface CoinBalance {
    coin: Coin,
    balance: PrefixedNumber,
    level: number,
}

export async function getBalances(parameters: GetAccountDataParameters): Promise<CoinBalance[]> {
    const {
        api,
        accountId,
    } = parameters;

    const data = await getAccountData({
        api: api!,
        accountId,
    });

    const logAvailable = scientificLogBalance(data.available).optimizeScale(3);
    const logPrefixedAvailable = convertToPrefixed(logAvailable);
    const logLevel = logAvailable.divideBy(ARTIFICIAL_MAX_BALANCE).toNumber();

    return [
        buildCoinBalance('log', logPrefixedAvailable, logLevel),
        buildCoinBalance('dot', new PrefixedNumber("0", NONE), 1)
    ];
}

export function scientificLogBalance(tokens: string): ScientificNumber {
    return new ScientificNumber(tokens, -LOG_DECIMALS).optimizeScale(3);
}

export function prefixedLogBalance(tokens: string): PrefixedNumber {
    const scientific = scientificLogBalance(tokens);
    return convertToPrefixed(scientific);
}

const ARTIFICIAL_MAX_BALANCE = scientificLogBalance("100");

function buildCoinBalance(coinId: string, balance: PrefixedNumber, level: number): CoinBalance {
    const coin = getCoin(coinId);
    return {
        coin,
        balance,
        level,
    }
}

export function getCoin(coinId: string): Coin {
    if(coinId === 'dot') {
        return {
            id: 'dot',
            name: 'Polkadot',
            iconId: 'dot',
            iconType: 'png',
            symbol: 'DOT',
        };
    } else if(coinId === "log") {
        return {
            id: 'log',
            name: 'Logion',
            iconId: 'log',
            iconType: 'png',
            symbol: SYMBOL,
        };
    } else {
        throw new Error(`Unsupported coin ${coinId}`);
    }
}

export interface TransferParameters extends ExtrinsicSubmissionParameters, BuildTransferCallParameters {
}

export function transfer(parameters: TransferParameters): Unsubscriber {
    const {
        signerId,
        callback,
        errorCallback,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: transferSubmittable(parameters),
        callback,
        errorCallback,
    });
}

export interface BuildTransferCallParameters {
    api: ApiPromise;
    destination: string;
    amount: PrefixedNumber;
}

function transferSubmittable(parameters: BuildTransferCallParameters): SubmittableExtrinsic<'promise'> {
    const {
        api,
        destination,
        amount
    } = parameters;
    return api.tx.balances.transfer(destination, amount.convertTo(LOG_SMALLEST_UNIT).coefficient.unnormalize())
}

export function buildTransferCall(parameters: BuildTransferCallParameters): Call {
    return parameters.api.createType('Call', transferSubmittable(parameters))
}

export async function estimateFee(parameters: BuildTransferCallParameters): Promise<PrefixedNumber> {
    const submittable = transferSubmittable(parameters);
    const paymentInfo = await submittable.paymentInfo(parameters.destination);
    return new PrefixedNumber(paymentInfo.partialFee.toString(), LOG_SMALLEST_UNIT);
}
