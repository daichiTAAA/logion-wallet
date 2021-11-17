jest.mock('react-router');
jest.mock("./CommonContext");

import { shallowRender } from '../tests';

import Transactions from './Transactions';
import { setBalances, setTransactions } from './__mocks__/CommonContextMock';
import { setParams } from '../__mocks__/ReactRouterMock';
import { DEFAULT_COIN_BALANCE, DEFAULT_TRANSACTION, DEFAULT_FAILED_TRANSACTION } from './TestData';

test('renders null with missing data', () => {
    const result = shallowRender(<Transactions
        backPath={ "back" }
    />);
    expect(result).toMatchSnapshot();
});

test('renders with all data', () => {
    setParams({coinId: 'log'});
    setBalances([ DEFAULT_COIN_BALANCE ]);
    setTransactions([ DEFAULT_TRANSACTION ]);
    const result = shallowRender(<Transactions
        backPath={ "back" }
    />);
    expect(result).toMatchSnapshot();
});

test('renders failed transaction', () => {
    setParams({coinId: 'log'});
    setBalances([ DEFAULT_COIN_BALANCE ]);
    setTransactions([ DEFAULT_FAILED_TRANSACTION ]);
    const result = shallowRender(<Transactions
        backPath={ "back" }
    />);
    expect(result).toMatchSnapshot();
});
