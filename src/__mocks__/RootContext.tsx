import { TEST_WALLET_USER } from '../wallet-user/TestData';
import Addresses, { AccountAddress } from '../component/types/Addresses';

export let selectAddress = jest.fn();

export let currentAddress = TEST_WALLET_USER;

const DEFAULT_ACCOUNT: AccountAddress = {
    name: "name",
    address: TEST_WALLET_USER,
    isLegalOfficer: false,
}

export let addresses: Addresses = {
    currentAddress: DEFAULT_ACCOUNT,
    addresses: [ DEFAULT_ACCOUNT ]
}

export function useRootContext() {
    return {
        currentAddress,
        selectAddress,
        addresses,
    };
}
