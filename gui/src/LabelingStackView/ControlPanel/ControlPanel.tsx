import { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import ControlPanelBottomArea from "./ControlPanelBottomArea";
import './ControlPanel.css'
import useSpa from "../../SpaContext/useSpa";
import ControlPanelSkeletonWidget from "./ControlPanelSkeletonWidget";
import { getFileData, storeFileData, storeGithubFileData, useUrlState } from "@figurl/interface";
import { JSONStringifyDeterministic } from "@figurl/interface/dist/viewInterface/kacheryTypes";
import ControlPanelFramesWidget from "./ControlPanelFramesWidget";

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
	const bottomHeight = Math.min(190, (height - 2 * margin - spacing * 2) * 2 / 3)	
	const topHeight = ((height - 2 * margin - spacing * 2) - bottomHeight) / 2
	const middleHeight = topHeight

	const {urlState, updateUrlState} = useUrlState()
	const {annotation, setAnnotation} = useSpa()

	const annotationUri: string | undefined = urlState.annotation || undefined

    const [errorString, setErrorString] = useState<string>('')

	const {setCurrentFrameIndex, incrementCurrentFrameIndex, numFrames, currentFrameIndex} = useSpa()

	const exportAsJson = useCallback(() => {
		if (!annotation) return
		const x = JSONStringifyDeterministic(annotation)
		downloadTextFile('annotation.json', x)
	}, [annotation])

	const saveSnapshot = useCallback(() => {
		if (!annotation) return
		const x = JSONStringifyDeterministic(annotation)
		setSaving(true)
		setErrorString('')
		;(async () => {
			try {
				const uri = await storeFileData(x)
				updateUrlState({annotation: uri})
				setSaveState({
					savedObjectJson: x,
					savedUri: uri
				})
			}
			catch(err: any) {
				setErrorString(`Problem saving file data: ${err.message}`)
				setSaving(false)
			}
			finally {
				setSaving(false)
			}
		})()
	}, [annotation, updateUrlState])

	const saveToGithub = useCallback(() => {
		if (!annotation) return
		if (!annotationUri) return
		if (!annotationUri.startsWith('gh://')) return
		const x = JSONStringifyDeterministic(annotation)
		setSaving(true)
		setErrorString('')
		;(async () => {
			try {
				await storeGithubFileData({fileData: x, uri: annotationUri})
				setSaveState({
					savedObjectJson: x,
					savedUri: annotationUri
				})
			}
			catch(err: any) {
				setErrorString(`Problem saving file data: ${err.message}`)
				setSaving(false)
			}
			finally {
				setSaving(false)
			}
		})()
	}, [annotation, annotationUri])

	const {initialUrlState} = useUrlState()
    const initialAnnotationUri: string | undefined = initialUrlState.annotation
    useEffect(() => {
        if (!initialAnnotationUri) return
        getFileData(initialAnnotationUri, () => {}, {responseType: 'json'}).then(x => {
			setAnnotation(x)
			setSaveState({
				savedObjectJson: JSONStringifyDeterministic(x),
				savedUri: initialAnnotationUri
			})
		}).catch(err => {
			setErrorString(err.message)
		})
    }, [initialAnnotationUri, setAnnotation])

    const handleCommand = useCallback((command: Command) => {
		if (numFrames === undefined) return
        if (command === 'first') setCurrentFrameIndex(0)
        else if (command === 'last') setCurrentFrameIndex(numFrames - 1)
        else if (command === 'prev') incrementCurrentFrameIndex(-1)
        else if (command === 'next') incrementCurrentFrameIndex(1)
		else if (command === 'export-as-json') exportAsJson()
		else if (command === 'save-snapshot') saveSnapshot()
		else if (command === 'save-to-github') saveToGithub()
    }, [setCurrentFrameIndex, incrementCurrentFrameIndex, numFrames, exportAsJson, saveSnapshot, saveToGithub])

    const [saving, setSaving] = useState<boolean>(false)

	const [saveState, setSaveState] = useState<SaveState>({})
	const dirty = useMemo(() => {
		if ((annotationUri === saveState.savedUri) && (JSONStringifyDeterministic(annotation || {}) === saveState.savedObjectJson)) {
			return false
		}
		return true
	}, [annotationUri, annotation, saveState])

    const hasGithubUri = annotationUri?.startsWith('gh://') || false

    return (
		<div
			className="ControlPanel"
			style={{position: 'absolute', width, height}}
		>
			<div style={{position: 'absolute', left: margin, top: margin, width: width - 2 * margin, height: topHeight}}>
				<ControlPanelSkeletonWidget width={width - 2 * margin} height={topHeight} />
			</div>
			<div style={{position: 'absolute', left: margin, top: margin + topHeight + spacing, width: width - 2 * margin, height: middleHeight}}>
				<ControlPanelFramesWidget width={width - 2 * margin} height={topHeight} />
			</div>
			<div style={{position: 'absolute', left: margin, top: margin + topHeight + spacing + middleHeight + spacing, width: width - 2 * margin, height: bottomHeight}}>
				<ControlPanelBottomArea width={width - 2 * margin} height={bottomHeight} onCommand={handleCommand} errorString={errorString} saving={saving} dirty={dirty} hasGithubUri={hasGithubUri} label={`frame ${currentFrameIndex}`} />
			</div>
		</div>
	)
}

// Thanks: https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
function downloadTextFile(filename: string, text: string) {
	const element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
  
	element.style.display = 'none';
	document.body.appendChild(element);
  
	element.click();
  
	document.body.removeChild(element);
}

export default ControlPanel