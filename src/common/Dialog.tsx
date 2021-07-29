import React from 'react';
import Modal from 'react-bootstrap/Modal';

import Button, { Action } from './Button';
import { Children } from './types/Helpers';
import { useCommonContext } from './CommonContext';

import './Dialog.css';

export type ModalSize = 'sm' | 'lg' | 'xl';

export interface Props {
    show: boolean,
    children: Children,
    modalTestId?: string,
    actions: Action[],
    size: ModalSize,
}

export default function Dialog(props: Props) {
    const { colorTheme } = useCommonContext();

    if(props.actions.length === 0) {
        throw new Error("There is no way for this dialog to be closed");
    }

    return (
        <Modal
            show={ props.show }
            backdrop="static"
            keyboard={ false }
            size={ props.size }
            data-testid={ props.modalTestId }
            className="Dialog"
        >
            <style>
                {
                `
                .Dialog .modal-dialog {
                    background-color: white;
                }
                .Dialog .modal-dialog .modal-content {
                    box-shadow: 0 0 25px ${colorTheme.shadowColor};
                    border-color: ${colorTheme.dialog.borderColor};
                    color: ${colorTheme.dialog.foreground};
                    background-color: ${colorTheme.dialog.background};
                }
                `
                }
            </style>
            <Modal.Body>
                { props.children }
            </Modal.Body>
            <Modal.Footer>
                {
                    props.actions.map(action => (
                        <Button
                            key={ action.id }
                            action={ action }
                        />
                    ))
                }
            </Modal.Footer>
        </Modal>
    );
}