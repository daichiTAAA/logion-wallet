import { UUID } from "../../logion-chain/UUID";
import React, { useContext, useReducer, Reducer, useEffect, useCallback, useState } from "react";
import { LocRequest, LocFile, LocMetadataItem, LocLink } from "../../common/types/ModelTypes";
import {
    confirmLocFile,
    deleteLocFile,
    preClose,
    fetchLocRequest,
    preVoid,
    deleteLocLink,
    confirmLocLink,
    confirmLocMetadataItem,
    deleteLocMetadataItem
} from "../../common/Model";
import { useCommonContext } from "../../common/CommonContext";
import { getLegalOfficerCase, addMetadata, addFile, closeLoc, addLink, voidLoc } from "../../logion-chain/LogionLoc";
import { LegalOfficerCase, VoidInfo, File as ChainFile, MetadataItem, Link } from "../../logion-chain/Types";
import { useLogionChain } from "../../logion-chain";
import { SignAndSubmit } from "../../ExtrinsicSubmitter";
import { SignAndSendCallback } from "../../logion-chain/Signature";
import { LocItemStatus, LocItem } from "./types";
import {
    createDraftFileLocItem,
    createDraftMetadataLocItem,
    createDraftLinkedLocItem,
    mergeLocFile,
    mergeLocMetadataItem,
    mergeLocLinkItem
} from "./LocItemFactory";
import { addLink as modelAddLink, addMetadata as modelAddMetadata, addFile as modelAddFile } from "../Model"

export interface FullVoidInfo extends VoidInfo {
    reason: string;
}

export interface LocContext {
    locId: UUID
    locRequest: LocRequest | null
    loc: LegalOfficerCase | null
    supersededLoc?: LegalOfficerCase
    supersededLocRequest?: LocRequest
    locItems: LocItem[]
    addMetadata: ((name: string, value: string) => void) | null
    addLink: ((otherLocId: UUID, otherLocDescription: string, nature: string) => void) | null
    publishLink: ((locItem: LocItem) => SignAndSubmit) | null
    publishMetadata: ((locItem: LocItem) => SignAndSubmit) | null
    addFile: ((name: string, file: File, nature: string) => void) | null
    publishFile: ((locItem: LocItem) => SignAndSubmit) | null
    close: (() => void) | null
    closeExtrinsic: (() => SignAndSubmit) | null
    confirmFile: ((locItem: LocItem) => void) | null
    deleteFile: ((locItem: LocItem) => void) | null
    confirmLink: ((locItem: LocItem) => void) | null
    deleteLink: ((locItem: LocItem) => void) | null
    confirmMetadata: ((locItem: LocItem) => void) | null
    deleteMetadata: ((locItem: LocItem) => void) | null
    voidLoc: ((voidInfo: FullVoidInfo) => void) | null
    voidLocExtrinsic?: ((voidInfo: VoidInfo) => SignAndSubmit) | null
}

const MAX_REFRESH = 20;
const REFRESH_INTERVAL = 5000;

function initialContextValue(locId: UUID): LocContext {
    return {
        locId,
        locRequest: null,
        loc: null,
        locItems: [],
        addMetadata: null,
        addLink: null,
        publishLink: null,
        publishMetadata: null,
        addFile: null,
        publishFile: null,
        close: null,
        closeExtrinsic: null,
        confirmFile: null,
        deleteFile: null,
        confirmLink: null,
        deleteLink: null,
        confirmMetadata: null,
        deleteMetadata: null,
        voidLoc: null,
        voidLocExtrinsic: null,
    }
}

const LocContextObject: React.Context<LocContext> = React.createContext(initialContextValue(new UUID()))

type ActionType = 'SET_LOC_REQUEST'
    | 'SET_LOC'
    | 'SET_FUNCTIONS'
    | 'ADD_ITEM'
    | 'UPDATE_ITEM_STATUS'
    | 'UPDATE_ITEM_TIMESTAMP'
    | 'DELETE_ITEM'
    | 'CLOSE'
    | 'VOID'

interface Action {
    type: ActionType,
    locRequest?: LocRequest,
    loc?: LegalOfficerCase,
    supersededLoc?: LegalOfficerCase,
    supersededLocRequest?: LocRequest,
    locItem?: LocItem,
    status?: LocItemStatus,
    name?: string,
    timestamp?: string,
    addMetadata?: (name: string, value: string) => void,
    addLink?: (otherLocId: UUID, otherLocDescription: string, nature: string) => void,
    publishLink?: (locItem: LocItem) => SignAndSubmit,
    publishMetadata?: (locItem: LocItem) => SignAndSubmit,
    addFile?: (name: string, file: File, nature: string) => void
    publishFile?: (locItem: LocItem) => SignAndSubmit,
    close?: () => void,
    closeExtrinsic?: () => SignAndSubmit,
    confirmFile?: (locItem: LocItem) => void,
    deleteFile?: (locItem: LocItem) => void,
    confirmLink?: (locItem: LocItem) => void
    deleteLink?: (locItem: LocItem) => void,
    confirmMetadata?: (locItem: LocItem) => void,
    deleteMetadata?: (locItem: LocItem) => void,
    voidInfo?: FullVoidInfo,
    voidLoc?: (voidInfo: FullVoidInfo) => void,
    voidLocExtrinsic?: (voidInfo: VoidInfo) => SignAndSubmit,
}

const reducer: Reducer<LocContext, Action> = (state: LocContext, action: Action): LocContext => {
    const items = state.locItems.concat();
    const itemIndex = items.indexOf(action.locItem!);
    switch (action.type) {
        case "SET_LOC_REQUEST":
            return { ...state, locRequest: action.locRequest! }
        case "SET_LOC":
            return { ...state, loc: action.loc!, supersededLoc: action.supersededLoc, supersededLocRequest: action.supersededLocRequest, locRequest: action.locRequest! }
        case "SET_FUNCTIONS":
            return {
                ...state,
                addMetadata: action.addMetadata!,
                publishMetadata: action.publishMetadata!,
                addLink: action.addLink!,
                publishLink: action.publishLink!,
                addFile: action.addFile!,
                publishFile: action.publishFile!,
                closeExtrinsic: action.closeExtrinsic!,
                close: action.close!,
                confirmFile: action.confirmFile!,
                deleteFile: action.deleteFile!,
                confirmLink: action.confirmLink!,
                deleteLink: action.deleteLink!,
                confirmMetadata: action.confirmMetadata!,
                deleteMetadata: action.deleteMetadata!,
                voidLoc: action.voidLoc!,
                voidLocExtrinsic: action.voidLocExtrinsic!,
            }
        case "ADD_ITEM":
            if (itemExists(action.locItem!, state.locItems)) {
                return { ...state }
            } else {
                return { ...state, locItems: state.locItems.concat(action.locItem!) }
            }
        case "UPDATE_ITEM_STATUS":
            items[itemIndex] = { ...action.locItem!, status: action.status! }
            return { ...state, locItems: items }
        case "UPDATE_ITEM_TIMESTAMP":
            items[itemIndex] = { ...action.locItem!, timestamp: action.timestamp! }
            return { ...state, locItems: items }
        case "DELETE_ITEM":
            items.splice(itemIndex, 1)
            return { ...state, locItems: items }
        case "CLOSE":
            return {
                ...state,
                loc: {
                    ...state.loc!,
                    closed: true,
                },
                locRequest: {
                    ...state.locRequest!,
                    status: "CLOSED"
                }
            }
        case "VOID":
            return {
                ...state,
                loc: {
                    ...state.loc!,
                    voidInfo: {
                        replacer: action.voidInfo!.replacer
                    }
                },
                locRequest: {
                    ...state.locRequest!,
                    voidInfo: {
                        reason: action.voidInfo!.reason
                    }
                }
            }
        default:
            throw new Error(`Unknown type: ${ action.type }`);
    }
}

function itemExists(locItem: LocItem, locItems: LocItem[]): boolean {
    return locItems.find(item =>
        item.type === locItem.type &&
        item.name === locItem.name &&
        item.value === locItem.value) !== undefined;
}

export interface Props {
    locId: UUID
    children: JSX.Element | JSX.Element[] | null
}

const enum NextRefresh {
    STOP,
    SCHEDULE,
    IMMEDIATE
}

export function LocContextProvider(props: Props) {

    const { api } = useLogionChain();
    const { axiosFactory, accounts, refresh } = useCommonContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue(props.locId));
    const [ refreshing, setRefreshing ] = useState<boolean>(false);
    const [ refreshCounter, setRefreshCounter ] = useState<number>(0);

    useEffect(() => {
        if (contextValue.locRequest === null && axiosFactory !== undefined && contextValue.loc === null && api !== null) {
            (async function() {
                const locRequest = await fetchLocRequest(axiosFactory(accounts!.current!.address)!, contextValue.locId.toString());
                const loc = await getLegalOfficerCase({ locId: contextValue.locId, api });
                let supersededLoc: LegalOfficerCase | undefined;
                let supersededLocRequest: LocRequest | undefined;
                if(loc?.replacerOf !== undefined) {
                    supersededLoc = await getLegalOfficerCase({ locId: loc.replacerOf, api });
                    supersededLocRequest = await fetchLocRequest(axiosFactory!(accounts!.current!.address)!, loc.replacerOf.toString());
                }
                dispatch({ type: 'SET_LOC', loc, supersededLoc, supersededLocRequest, locRequest });
                if (loc) {
                    let refreshNeeded = false;
                    const submitter = loc.owner;
                    locRequest.metadata.forEach(itemFromBackend => {
                        const itemFromChain = findMetadataItemInLoc(loc, itemFromBackend)
                        const result = mergeLocMetadataItem({ itemFromChain, itemFromBackend, submitter })
                        dispatch({ type: 'ADD_ITEM', locItem: result.locItem })
                        if (result.refreshNeeded) {
                            refreshNeeded = true;
                        }
                    })
                    locRequest.files.forEach(fileFromBackend => {
                        const fileFromChain = findFileInLoc(loc, fileFromBackend)
                        const result = mergeLocFile({ fileFromChain, fileFromBackend, submitter });
                        dispatch({ type: 'ADD_ITEM', locItem: result.locItem })
                        if (result.refreshNeeded) {
                            refreshNeeded = true;
                        }
                    })
                    for (let i = 0; i < locRequest.links.length; ++i) {
                        const linkFromBackend = locRequest.links[i];
                        const otherLocRequest = await fetchLocRequest(axiosFactory!(accounts!.current!.address)!, linkFromBackend.target)
                        const linkFromChain = findLinkInLoc(loc, linkFromBackend);
                        const result = mergeLocLinkItem({
                            linkFromChain,
                            linkFromBackend,
                            otherLocDescription: otherLocRequest.description,
                            submitter
                        })
                        dispatch({ type: 'ADD_ITEM', locItem: result.locItem })
                        if (result.refreshNeeded) {
                            refreshNeeded = true;
                        }
                    }
                    if (refreshNeeded) {
                        setRefreshCounter(MAX_REFRESH);
                    }
                }
            })();
        }
    }, [ contextValue.locRequest, contextValue.locId, axiosFactory, accounts, api, contextValue.loc ])

    const refreshNameTimestamp = useCallback<() => Promise<NextRefresh>>(() => {

        function refreshTimestamps(locRequest: LocRequest): boolean {
            let refreshed = false;
            contextValue.locItems
                .filter(locItem => locItem.timestamp === null)
                .forEach(locItem => {
                    const locRequestItem = findItemInLocRequest(locRequest, locItem)
                    if (locRequestItem && locRequestItem.addedOn) {
                        refreshed = true;
                        dispatch({ type: 'UPDATE_ITEM_TIMESTAMP', locItem, timestamp: locRequestItem.addedOn })
                    }
                })
            return refreshed;
        }

        function refreshRequestDates(locRequest: LocRequest): boolean {
            let refreshed = false;
            if(contextValue.locRequest?.closedOn === undefined && locRequest.closedOn) {
                refreshed = true;
            }
            if(contextValue.locRequest?.voidInfo?.voidedOn === undefined && locRequest.voidInfo?.voidedOn) {
                refreshed = true;
            }
            if(refreshed) {
                dispatch({ type: 'SET_LOC_REQUEST', locRequest });
            }
            return refreshed;
        }

        if (contextValue.locRequest === null || contextValue.loc === null || axiosFactory === undefined) {
            return Promise.resolve(NextRefresh.SCHEDULE);
        }

        if (allItemsOK(contextValue.locItems) && requestOK(contextValue.locRequest)) {
            refresh!();
            return Promise.resolve(NextRefresh.STOP);
        }

        const proceed = async () => {
            let nextRefresh = NextRefresh.SCHEDULE;
            const locRequest = await fetchLocRequest(axiosFactory(accounts!.current!.address)!, contextValue.locId.toString());
            if (refreshTimestamps(locRequest)) {
                nextRefresh = NextRefresh.IMMEDIATE;
            }
            if (refreshRequestDates(locRequest)) {
                nextRefresh = NextRefresh.IMMEDIATE;
            }
            return nextRefresh;
        }
        return proceed()
    }, [ contextValue.loc, contextValue.locItems, contextValue.locId, axiosFactory, accounts, contextValue.locRequest, refresh ])

    useEffect(() => {
        if (refreshCounter > 0 && !refreshing) {
            (async function () {
                setRefreshing(true)
                const nextRefresh = await refreshNameTimestamp();
                switch (nextRefresh) {
                    case NextRefresh.STOP:
                        setRefreshCounter(0);
                        setRefreshing(false)
                        break;
                    case NextRefresh.SCHEDULE:
                        setRefreshCounter(refreshCounter - 1)
                        setTimeout(() => setRefreshing(false), REFRESH_INTERVAL, null)
                        break;
                    case NextRefresh.IMMEDIATE:
                        setRefreshCounter(refreshCounter - 1)
                        setRefreshing(false)
                        break;
                }
            })()
        }
    }, [ refreshNameTimestamp, refreshCounter, setRefreshCounter, refreshing, setRefreshing ])


    const publishMetadataFunction = useCallback((item: LocItem) => {
            const signAndSubmit: SignAndSubmit = (setResult, setError) => {
                const callback: SignAndSendCallback = (signedTransaction) => {
                    setResult(signedTransaction)
                };
                return addMetadata({
                    locId: contextValue.locId,
                    api: api!,
                    signerId: item.submitter,
                    item: { name: item.name, value: item.value },
                    callback,
                    errorCallback: setError
                })
            };
            return signAndSubmit;
        }, [ api, contextValue.locId ]
    )

    const addLocItemFunction = useCallback((locItemCreator: () => LocItem) => {
        const locItem = locItemCreator();
        dispatch({ type: 'ADD_ITEM', locItem })
        setRefreshCounter(MAX_REFRESH)
    }, [ setRefreshCounter ])

    const publishFileFunction = useCallback((item: LocItem) => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => {
            const callback: SignAndSendCallback = (signedTransaction) => {
                setResult(signedTransaction)
            };
            return addFile({
                locId: contextValue.locId,
                api: api!,
                signerId: item.submitter,
                    hash: item.value,
                    nature: item.nature || "",
                    callback,
                    errorCallback: setError
                })
            };
            return signAndSubmit;
        }, [ api, contextValue.locId ]
    )

    const publishLinkFunction = useCallback((item: LocItem) => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => {
            const callback: SignAndSendCallback = (signedTransaction) => {
                setResult(signedTransaction)
            };
            return addLink({
                locId: contextValue.locId,
                api: api!,
                signerId: item.submitter,
                target: item.target!,
                nature: item.nature || "",
                callback,
                errorCallback: setError
            })
        };
        return signAndSubmit;
    }, [ api, contextValue.locId ])

    const closeExtrinsicFunction = useCallback(() => {
            const signAndSubmit: SignAndSubmit = (setResult, setError) => {
                const callback: SignAndSendCallback = (signedTransaction) => {
                    setResult(signedTransaction)
                };
                return closeLoc({
                    locId: contextValue.locId,
                    api: api!,
                    signerId: contextValue.loc!.owner,
                    callback,
                    errorCallback: setError
                })
            };
            return signAndSubmit;
        }, [ api, contextValue.locId, contextValue.loc ]
    )

    const closeFunction = useCallback(() => {
            preClose(axiosFactory!(accounts!.current!.address)!, contextValue.locId)
            .then(() => {
                dispatch({ type: 'CLOSE' });
                setRefreshCounter(MAX_REFRESH);
            });
        }, [ axiosFactory, accounts, contextValue.locId, dispatch ]
    )

    const dispatchPublished = (locItem: LocItem) => {
        dispatch({ type: 'UPDATE_ITEM_STATUS', locItem, status: "PUBLISHED" })
        setRefreshCounter(MAX_REFRESH)
    }

    const confirmFileFunction = useCallback(async (locItem: LocItem) => {
            confirmLocFile(axiosFactory!(accounts!.current!.address)!, contextValue.locId, locItem.value)
                .then(() => dispatchPublished(locItem))
        }, [ axiosFactory, accounts, contextValue.locId ]
    )

    const deleteFileFunction = useCallback((item: LocItem) => {
            deleteLocFile(axiosFactory!(accounts!.current!.address)!, contextValue.locId, item.value)
                .then(() => dispatch({ type: 'DELETE_ITEM', locItem: item }));
        }, [ axiosFactory, accounts, contextValue.locId ]
    )

    const confirmLinkFunction = useCallback(async (locItem: LocItem) => {
            confirmLocLink(axiosFactory!(accounts!.current!.address)!, contextValue.locId, locItem.target!)
                .then(() => dispatchPublished(locItem))
        }, [ axiosFactory, accounts, contextValue.locId ]
    )

    const deleteLinkFunction = useCallback((item: LocItem) => {
            deleteLocLink(axiosFactory!(accounts!.current!.address)!, contextValue.locId, item.target!)
                .then(() => dispatch({ type: 'DELETE_ITEM', locItem: item }));
        }, [ axiosFactory, accounts, contextValue.locId ]
    )

    const confirmMetadataFunction = useCallback(async (locItem: LocItem) => {
            confirmLocMetadataItem(axiosFactory!(accounts!.current!.address)!, contextValue.locId, locItem.name)
                .then(() => dispatchPublished(locItem))
        }, [ axiosFactory, accounts, contextValue.locId ]
    )

    const deleteMetadataFunction = useCallback((item: LocItem) => {
            deleteLocMetadataItem(axiosFactory!(accounts!.current!.address)!, contextValue.locId, item.name)
                .then(() => dispatch({ type: 'DELETE_ITEM', locItem: item }));
        }, [ axiosFactory, accounts, contextValue.locId ]
    )

    const voidLocExtrinsicFunction = useCallback((voidInfo: VoidInfo) => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => {
            const callback: SignAndSendCallback = (signedTransaction) => {
                setResult(signedTransaction)
            };
            return voidLoc({
                locId: contextValue.locId,
                api: api!,
                signerId: contextValue.loc!.owner,
                callback,
                errorCallback: setError,
                voidInfo
            })
        };
        return signAndSubmit;
    }, [ api, contextValue.locId, contextValue.loc ])

    const voidLocFunction = useCallback((voidInfo: FullVoidInfo) => {
        preVoid(axiosFactory!(accounts!.current!.address)!, contextValue.locId, voidInfo.reason)
        .then(() => {
            dispatch({ type: 'VOID', voidInfo });
            setRefreshCounter(MAX_REFRESH);
        });
    }, [ axiosFactory, accounts, contextValue.locId, dispatch ])

    const addLinkFunction = useCallback(async (otherLocId: UUID, otherLocDescription: string, nature: string) => {
        await modelAddLink(axiosFactory!(accounts!.current!.address)!, {
            locId: contextValue.locId.toString(),
            target: otherLocId.toString(),
            nature
        })
        addLocItemFunction(() => createDraftLinkedLocItem({
            link: { id: otherLocId, nature },
            otherLocDescription,
            submitter: contextValue.loc!.owner
        }))
    }, [ axiosFactory, accounts, contextValue.loc, contextValue.locId, addLocItemFunction ])

    const addMetadataFunction = useCallback(async (name: string, value: string) => {
        await modelAddMetadata(axiosFactory!(accounts!.current!.address), {
            locId: contextValue.locId.toString(),
            name,
            value
        })
        addLocItemFunction(() => createDraftMetadataLocItem(
            {
                metadataItem: { name, value },
                submitter: contextValue.loc!.owner
            }))
    }, [ axiosFactory, accounts, contextValue.loc, contextValue.locId, addLocItemFunction ])

    const addFileFunction = useCallback(async (name: string, file: File, nature: string) => {
        const { hash } = await modelAddFile(axiosFactory!(accounts!.current!.address)!, {
            file,
            locId: contextValue.locId.toString(),
            fileName: name,
            nature
        })
        addLocItemFunction(
            () => createDraftFileLocItem({
                file: {
                    hash,
                    nature
                },
                submitter: contextValue.loc!.owner,
                name
            }))
    }, [ axiosFactory, accounts, contextValue.loc, contextValue.locId, addLocItemFunction ])

    useEffect(() => {
        if (contextValue.loc && contextValue.loc.owner !== null && contextValue.addMetadata === null) {
            const action: Action = {
                type: 'SET_FUNCTIONS',
                addMetadata: addMetadataFunction,
                addLink: addLinkFunction,
                publishLink: publishLinkFunction,
                publishMetadata: publishMetadataFunction,
                addFile: addFileFunction,
                publishFile: publishFileFunction,
                closeExtrinsic: closeExtrinsicFunction,
                close: closeFunction,
                confirmFile: confirmFileFunction,
                deleteFile: deleteFileFunction,
                confirmLink: confirmLinkFunction,
                deleteLink: deleteLinkFunction,
                confirmMetadata: confirmMetadataFunction,
                deleteMetadata: deleteMetadataFunction,
                voidLoc: voidLocFunction,
                voidLocExtrinsic: voidLocExtrinsicFunction,
            };
            dispatch(action)
        }
    }, [ contextValue.loc, contextValue.addMetadata, addLocItemFunction, publishMetadataFunction,
        publishFileFunction, closeFunction, closeExtrinsicFunction,
        confirmFileFunction, deleteFileFunction, confirmLinkFunction, deleteLinkFunction, confirmMetadataFunction,
        deleteMetadataFunction, dispatch, publishLinkFunction, voidLocFunction, voidLocExtrinsicFunction,
        addLinkFunction, addMetadataFunction, addFileFunction ])

    return (
        <LocContextObject.Provider value={ contextValue }>
            { props.children }
        </LocContextObject.Provider>
    )
}

export function useLocContext() {
    return useContext(LocContextObject)
}

function findFileInLoc(loc: LegalOfficerCase, item:LocFile): ChainFile | undefined {
    return loc.files.find(file => file.hash === item.hash)
}

function findMetadataItemInLoc(loc: LegalOfficerCase, item:LocMetadataItem): MetadataItem | undefined {
    return loc.metadata.find(metadataItem => metadataItem.name === item.name)
}

function findLinkInLoc(loc: LegalOfficerCase, item:LocLink): Link | undefined {
    return loc.links.find(link => link.id.toString() === item.target)
}

function findItemInLocRequest(locRequest: LocRequest, item: LocItem): LocMetadataItem | LocFile | LocLink | undefined {
    if (item.type === 'Document') {
        return locRequest.files.find(file => file.hash === item.value)
    } if (item.type === 'Linked LOC') {
        return locRequest.links.find(link => UUID.fromAnyString(link.target)!.toString() === item.target!.toString())
    } else {
        return locRequest.metadata.find(metadata => metadata.name === item.name)
    }
}

function allItemsOK(items: LocItem[]): boolean {
    return items.find(item => item.status === "PUBLISHED" && item.timestamp === null) === undefined;
}

function requestOK(locRequest: LocRequest): boolean {
    return (locRequest.status !== "CLOSED" || locRequest.closedOn !== undefined)
        && (locRequest.voidInfo === undefined || locRequest.voidInfo.voidedOn !== undefined);
}
