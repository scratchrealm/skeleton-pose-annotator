import { FunctionComponent, useMemo, useState } from "react";
import Splitter from "../components/Splitter";
import LabelingStackWorkArea from "./LabelingStackWorkArea";
import ControlPanel from "./ControlPanel/ControlPanel";


type Props = {
    width: number
    height: number
}

export type AffineTransform = {
    forward: number[][]
    inverse: number[][]
}

const LabelingStackWidget: FunctionComponent<Props> = ({width, height}) => {

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={Math.min(350, width / 2)}
        >
            <ControlPanel
                width={0}
                height={0}
            />
            <LabelingStackWorkArea
                width={0}
                height={0}
            />
		</Splitter>
    )
}

export default LabelingStackWidget