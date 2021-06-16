import {TEST_WALLET_USER} from "../wallet-user/Model.test";

export let selectAddress = jest.fn();

export let currentAddress = TEST_WALLET_USER;

export function useRootContext() {
    return {
        currentAddress,
        selectAddress,
    };
}
