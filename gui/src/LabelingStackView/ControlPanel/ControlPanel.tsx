import { FunctionComponent, useCallback, useMemo, useState } from "react";
import ControlPanelBottomArea from "./ControlPanelBottomArea";
import './ControlPanel.css'
import useSpa from "../../SpaContext/useSpa";
import ControlPanelSkeletonWidget from "./ControlPanelSkeletonWidget";

type Props = {
    width: number
    height: number
}

export type Command = 'save-to-github' | 'save-snapshot' | 'export-as-json' | 'prev' | 'next' | 'first' | 'last'

type SaveState = {
	savedObjectJson?: string
	savedUri?: string
}

const ControlPanel: FunctionComponent<Props> = ({width, height}) => {
    const margin = 10
	const spacing = 20
	const bottomHeight = Math.min(220, (height - 2 * margin - spacing) * 2 / 3)
	const topHeight = (height - 2 * margin - spacing) - bottomHeight

    const [errorString, setErrorString] = useState<string>('')

	const {setCurrentFrameIndex, incrementCurrentFrameIndex, numFrames, currentFrameIndex} = useSpa()

    const handleCommand = useCallback((command: Command) => {
		if (numFrames === undefined) return
        if (command === 'first') setCurrentFrameIndex(0)
        else if (command === 'last') setCurrentFrameIndex(numFrames - 1)
        else if (command === 'prev') incrementCurrentFrameIndex(-1)
        else if (command === 'next') incrementCurrentFrameIndex(1)
    }, [setCurrentFrameIndex, incrementCurrentFrameIndex, numFrames])

    const [saving, setSaving] = useState<boolean>(false)

	const [saveState, setSaveState] = useState<SaveState>({})
	const dirty = useMemo(() => {
		// if ((uri === saveState.savedUri) && (JSONStringifyDeterministic(object || {}) === saveState.savedObjectJson)) {
		// 	return false
		// }
		// return true
        return false
	}, [])

    const hasGithubUri = false

    return (
		<div
			className="ControlPanel"
			style={{position: 'absolute', width, height}}
		>
			<div style={{position: 'absolute', left: margin, top: margin, width: width - 2 * margin, height: topHeight}}>
				<ControlPanelSkeletonWidget width={width - 2 * margin} height={topHeight} />
			</div>
			<div style={{position: 'absolute', left: margin, top: margin + topHeight + spacing, width: width - 2 * margin, height: bottomHeight}}>
				<ControlPanelBottomArea width={width - 2 * margin} height={bottomHeight} onCommand={handleCommand} errorString={errorString} saving={saving} dirty={dirty} hasGithubUri={hasGithubUri} label={`frame ${currentFrameIndex}`} />
			</div>
		</div>
	)
}

export default ControlPanel