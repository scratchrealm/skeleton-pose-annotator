import { FunctionComponent } from "react";
import TabWidget from "../../components/TabWidget/TabWidget";
import SkeletonEdgesWidget from "./SkeletonEdgesWidget";
import SkeletonNodesWidget from "./SkeletonNodesWidget";

type Props ={
	width: number
	height: number
}

const tabs = [
	{label: 'Nodes', closeable: false},
	{label: 'Edges', closeable: false}
]

const ControlPanelSkeletonWidget: FunctionComponent<Props> = ({width, height}) => {
	const titleHeight = 30
	return (
		<div>
			<p>SKELETON</p>
			<div style={{position: 'absolute', width, height: height - titleHeight, top: titleHeight}}>
				<TabWidget
					tabs={tabs}
					width={width}
					height={height - titleHeight}
				>
					<SkeletonNodesWidget width={0} height={0}/>
					<SkeletonEdgesWidget width={0} height={0}/>
				</TabWidget>
			</div>
		</div>
	)
}

export default ControlPanelSkeletonWidget
