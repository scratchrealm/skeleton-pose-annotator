import { FunctionComponent } from "react";
import InstancesWidget from "./InstancesWidget";

type Props = {
    width: number
    height: number
}

const FrameRightPanel: FunctionComponent<Props> = ({width, height}) => {
    return (
        <InstancesWidget
            width={width}
            height={height}
        />
    )
}

export default FrameRightPanel