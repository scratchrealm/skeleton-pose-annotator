import { ThemeProvider } from "@emotion/react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { FunctionComponent, useMemo } from "react";
import Hyperlink from "../../components/Hyperlink";
import { SpaFrameAnnotation } from "../../SpaContext/SpaContext";
import useSpa from "../../SpaContext/useSpa";
import {tableTheme} from "../ControlPanel/themes"

type Props ={
	width: number
	height: number
}

const ControlPanelFramesWidget: FunctionComponent<Props> = ({width, height}) => {
	const {annotation, setCurrentFrameIndex, numFrames, currentFrameIndex} = useSpa()
	const {frameAnnotations} = annotation
	const titleHeight = 30
	const frameIndices = useMemo(() => {
		if (!numFrames) return []
		const ret: number[] = []
		for (let i = 0; i < numFrames; i++) {
			ret.push(i)
		}
		return ret
	}, [numFrames])
	const frameAnnotationsByFrameIndex = useMemo(() => {
		const ret: {[i: number]: SpaFrameAnnotation} = {}
		frameAnnotations.forEach(f => {
			ret[f.frameIndex] = f
		}, [])
		return ret
	}, [frameAnnotations])
	return (
		<ThemeProvider theme={tableTheme}>
			<p>FRAMES</p>
			<div style={{position: 'absolute', width, height: height - titleHeight, top: titleHeight, overflowY: 'auto'}}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Frame</TableCell>
							<TableCell># instances</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{
							frameIndices.map((ii) => {
								const style0 = ii === currentFrameIndex ? {background: '#eecccc'} : {}
								return (
									<TableRow key={ii}>
										<TableCell style={style0}><Hyperlink onClick={() => setCurrentFrameIndex(ii)}>Frame {ii}</Hyperlink></TableCell>
										<TableCell style={style0}>{frameAnnotationsByFrameIndex[ii] ? frameAnnotationsByFrameIndex[ii].instances.length : ""}</TableCell>
									</TableRow>
								)
							})
						}
					</TableBody>
				</Table>
			</div>
		</ThemeProvider>
	)
}

export default ControlPanelFramesWidget
