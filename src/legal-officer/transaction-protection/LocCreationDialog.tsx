import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCommonContext } from '../../common/CommonContext';
import { CreateLocRequest, createLocRequest } from '../../common/Model';
import Dialog from '../../common/Dialog';
import LocCreationForm, { FormValues } from "./LocCreationForm";
import { useLocContext } from "./LocContext";
import { LocRequest } from "../../common/types/ModelTypes";
import LocCreationSteps from "./LocCreationSteps";
import { useLegalOfficerContext } from '../LegalOfficerContext';

export interface Props {
    show: boolean,
    exit: () => void,
    onSuccess: (locRequest: LocRequest) => void
}

export default function LocCreationDialog(props: Props) {
    const { colorTheme, accounts, refresh } = useCommonContext();
    const { axios } = useLegalOfficerContext();
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        defaultValues: {
            description: ""
        }
    });
    const { locRequest } = useLocContext();
    const [ newLocRequest, setNewLocRequest ] = useState<LocRequest | null>(null)

    const submit = useCallback((formValues: FormValues) => {
        (async function () {
            const currentAddress = accounts!.current!.address;
            const request: CreateLocRequest = {
                ownerAddress: currentAddress,
                requesterAddress: locRequest!.requesterAddress,
                description: formValues.description,
                userIdentity: locRequest!.userIdentity,
            }
            setNewLocRequest(await createLocRequest!(axios!, request));
            refresh()
        })();
    }, [ axios, accounts, locRequest, refresh ]);

    return (
        <>
            <Dialog
                show={ props.show }
                size="lg"
                actions={ [
                    {
                        id: "submit",
                        buttonText: 'Submit',
                        buttonVariant: 'primary',
                        type: 'submit',
                    },
                    {
                        id: "cancel",
                        callback: () => {
                            reset();
                            props.exit();
                        },
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    }
                ] }
                onSubmit={ handleSubmit(submit) }
            >
                { newLocRequest === null &&
                <LocCreationForm
                    control={ control }
                    errors={ errors }
                    colors={ colorTheme.dialog }
                />
                }
                { newLocRequest !== null &&
                <LocCreationSteps
                    requestToCreate={ newLocRequest }
                    exit={ () => {
                        props.exit();
                        reset();
                    } }
                    onSuccess={ () => props.onSuccess(newLocRequest) }
                />
                }
            </Dialog>
        </>
    );
}