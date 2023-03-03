import { FunctionComponent } from "react";
import LabelingStackView from "./LabelingStackView/LabelingStackView";
import { ViewData } from "./ViewData";

type Props = {
    data: ViewData
    width: number
    height: number
}

const View: FunctionComponent<Props> = ({data, width, height}) => {
    if (data.type === 'spa.LabelingStack') {
        return <LabelingStackView data={data} width={width} height={height} />
    }
    else return <div>Unexpected view type</div>
}

export default View