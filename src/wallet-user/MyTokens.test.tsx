jest.mock('../logion-chain');
jest.mock('./UserContext');
jest.mock('react-router-dom');

import { shallowRender } from '../tests';
import MyTokens from './MyTokens';
import { setAcceptedRequests } from './__mocks__/UserContextMock';
import { render, screen, act, waitFor } from '@testing-library/react';
import { DEFAULT_ASSETS_DECIMALS } from '../logion-chain';

test("renders with no requests", () => {
    const tree = shallowRender(<MyTokens />);
    expect(tree).toMatchSnapshot();
});

test("renders with requests", async () => {
    setAcceptedRequests([
        {
            id: "1",
            legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "address",
            requestedTokenName: "TOKEN1",
            bars: 1,
            status: "ACCEPTED",
            assetDescription: {
                assetId: "assetId",
                decimals: DEFAULT_ASSETS_DECIMALS
            }
        }
    ]);
    render(<MyTokens />);
    await waitFor(() => expect(screen.getByText("TOKEN1")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("42")).toBeInTheDocument());
});
