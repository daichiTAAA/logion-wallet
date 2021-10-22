import { Dropdown } from "react-bootstrap";
import { useState, useCallback } from "react";
import LocLinkExistingDialog from "./LocLinkExistingLocDialog";
import LocCreationDialog from "./LocCreationDialog";
import { useLocContext } from "./LocContext";
import { UUID } from "../../logion-chain/UUID";
import { LocRequest } from "../../common/types/ModelTypes";

export const enum Visible {
    NONE,
    LINK_EXISTING,
    LINK_NEW
}

export interface Props {
    visible?: Visible
}

export default function LocLinkButton(props: Props) {
    const [ visible, setVisible ] = useState<Visible>(props.visible ? props.visible : Visible.NONE);
    const { linkLoc } = useLocContext();

    const linkNewLoc = useCallback((newLocRequest: LocRequest) => {
        if (linkLoc !== null) {
            linkLoc(new UUID(newLocRequest.id), newLocRequest.description)
        }
    }, [ linkLoc ])

    return (
        <>
            <Dropdown>
                <Dropdown.Toggle className="Button">Link this LOC to another LOC</Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={ () => setVisible(Visible.LINK_EXISTING) }>
                        Link to an existing LOC
                    </Dropdown.Item>
                    <Dropdown.Item onClick={ () => setVisible(Visible.LINK_NEW) }>
                        Link to a new LOC
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <LocLinkExistingDialog
                show={ visible === Visible.LINK_EXISTING }
                exit={ () => setVisible(Visible.NONE) }
            />
            <LocCreationDialog
                show={ visible === Visible.LINK_NEW }
                exit={ () => setVisible(Visible.NONE) }
                onSuccess={ linkNewLoc }
            />
        </>
    )
}