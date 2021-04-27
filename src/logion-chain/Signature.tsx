import { web3FromAddress } from '@polkadot/extension-dapp';
import { Keyring } from '@polkadot/ui-keyring';
import { ISubmittableResult } from '@polkadot/types/types';
import { SubmittableExtrinsic } from '@polkadot/api/submittable/types';

export type SignAndSendCallback = (result: ISubmittableResult) => void;

export type Unsubscriber = Promise<() => void>;

export type ErrorCallback = (error: any) => void;

export interface SignatureParameters {
    keyring: Keyring,
    signerId: string,
    submittable: SubmittableExtrinsic<'promise'>,
    callback: SignAndSendCallback,
    errorCallback: ErrorCallback
}

export function signAndSend(parameters: SignatureParameters): Unsubscriber {
    const signer = parameters.keyring.getPair(parameters.signerId);
    let unsubscriber: Unsubscriber;
    if(signer.isLocked) {
        unsubscriber = web3FromAddress(parameters.signerId)
            .then(extension => parameters.submittable.signAndSend(parameters.signerId, {signer: extension.signer}, parameters.callback));
    } else {
        unsubscriber = parameters.submittable.signAndSend(signer, parameters.callback);
    }
    unsubscriber.catch(parameters.errorCallback);
    return unsubscriber;
}

export function replaceUnsubscriber(
    currentUnsubscriber: Unsubscriber | null,
    setUnsubscriber: (newUnsubscriber: Unsubscriber) => void,
    newUnsubscriber: Unsubscriber) {
    if(currentUnsubscriber !== null) {
        currentUnsubscriber
            .then(callable => callable())
            .then(_ => setUnsubscriber(newUnsubscriber));
    } else {
        setUnsubscriber(newUnsubscriber);
    }
}
