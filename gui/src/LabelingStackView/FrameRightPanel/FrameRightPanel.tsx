import { FunctionComponent } from "react";
import InstancesWidget from "./InstancesWidget";

type Props = {
    width: number
    height: number
}

const FrameRightPanel: FunctionComponent<Props> = ({width, height}) => {
    return (
        <div>
            <div style={{position: 'absolute', width, height: 30, top: 0, padding: 10}}>
                <a href="https://github.com/scratchrealm/skeleton-pose-annotator" target={"_blank"} rel="noreferrer">README</a>
            </div>
            <div style={{position: 'absolute', width, height: height - 30, top: 30}}>
                <InstancesWidget
                    width={width}
                    height={height - 30}
                />
            </div>
        </div>
    )
}

export default FrameRightPanel