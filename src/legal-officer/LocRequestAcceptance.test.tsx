jest.mock('../common/CommonContext');
jest.mock('./LegalOfficerContext');
jest.mock('../logion-chain');
jest.mock('../logion-chain/LogionLoc');
jest.mock('../logion-chain/Signature');
jest.mock('./Model');

import { shallowRender } from '../tests';
import LocRequestAcceptance from './LocRequestAcceptance';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { finalizeSubmission } from '../logion-chain/__mocks__/SignatureMock';
import { setAcceptLocRequest, acceptLocRequest } from './__mocks__/ModelMock';
import { LocRequest } from '../common/types/ModelTypes';
import { setCurrentAddress, DEFAULT_LEGAL_OFFICER_ACCOUNT, axiosMock } from '../common/__mocks__/CommonContextMock';
import { createLoc } from '../logion-chain/LogionLoc';
import { UUID } from '../logion-chain/UUID';

describe("TokenizationRequestAcceptance", () => {

    it("Renders null with no data", () => {
        const tree = shallowRender(<LocRequestAcceptance requestToAccept={null} clearRequestToAccept={jest.fn()} />);
        expect(tree).toMatchSnapshot();
    });

    const REQUEST: LocRequest = {
        id: new UUID().toString(),
        ownerAddress: DEFAULT_LEGAL_OFFICER_ACCOUNT.address,
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        description: "LOC description",
        status: "REQUESTED",
        createdOn: "2021-09-20T15:52:00.000",
    };

    it("Click on accept and proceed accepts request", async () => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
        render(<LocRequestAcceptance requestToAccept={REQUEST} clearRequestToAccept={jest.fn()} />);

        // Accept request
        setAcceptLocRequest(jest.fn().mockResolvedValue({}));
        const acceptButton = screen.getByTestId(`proceed-accept-${REQUEST.id}`);
        userEvent.click(acceptButton);
        await waitFor(() => expect(acceptLocRequest).toBeCalledWith(
            axiosMock.object(),
            expect.objectContaining({
                requestId: REQUEST.id
            })
        ));

        // Create LOC
        await waitFor(() => screen.getByTestId(`modal-accepted-${REQUEST.id}`));
        const createButton = screen.getByTestId(`proceed-create-${REQUEST.id}`);
        userEvent.click(createButton);
        await waitFor(() => screen.getByText(/Submitting/));
        act(finalizeSubmission);
        await waitFor(() => screen.getByText(/LOC successfully created/));

        const proceedReviewButton = screen.getByTestId(`proceed-review-${REQUEST.id}`);
        userEvent.click(proceedReviewButton);

        const closeReviewButton = await screen.findByTestId(`close-review-${REQUEST.id}`);
        userEvent.click(closeReviewButton);
    });
});