import { FunctionComponent } from "react";

type Props = {
    width: number
    height: number
}

const FrameRightPanel: FunctionComponent<Props> = ({width, height}) => {
    return (
        <div>Right panel</div>
    )
}

export default FrameRightPanel