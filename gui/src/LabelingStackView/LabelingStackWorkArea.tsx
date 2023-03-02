import { FunctionComponent, useMemo } from "react";
import useSpa from "../SpaContext/useSpa";
import FrameAnnotationCanvas from "./FrameAnnotationCanvas/FrameAnnotationCanvas";
import FrameImageCanvas from "./FrameImageCanvas/FrameImageCanvas";
import FrameRightPanel from "./FrameRightPanel/FrameRightPanel";
import useWheelZoom from "./useWheelZoom";

type Props = {
    width: number
    height: number
}

export type AffineTransform = {
    forward: number[][]
    inverse: number[][]
}

const bottomBarHeight = 40

const LabelingStackWorkArea: FunctionComponent<Props> = ({width, height}) => {
    const {frameWidth, frameHeight, frameImages, currentFrameIndex, annotation} = useSpa()
    const height2 = height - bottomBarHeight
	const rightPanelWidth = Math.min(200, width / 2)
	const width2 = width - rightPanelWidth
	const W = (frameWidth || 0) * height2 < (frameHeight || 0) * width2 ? (frameWidth || 0) * height2 / (frameHeight || 1) : width2
	const H = (frameWidth || 0) * height2 < (frameHeight || 0) * width2 ? height2 : (frameHeight || 0) * width2 / (frameWidth || 1)
	const scale =useMemo(() => ([W / (frameWidth || 1), H / (frameHeight || 1)] as [number, number]), [W, H, frameWidth, frameHeight])
	const rect = useMemo(() => ({
		x: (width2 - W)  / 2,
		y: (height2 - H) / 2,
		w: W,
		h: H
	}), [W, H, width2, height2])
	const {affineTransform, handleWheel} = useWheelZoom(rect.x, rect.y, rect.w, rect.h)

    const jpeg = frameImages[currentFrameIndex] ? frameImages[currentFrameIndex].data : undefined

    const frameAnnotation = useMemo(() => {
        const aa = annotation.frameAnnotations.filter(x => (x.frameIndex === currentFrameIndex))[0]
        return aa ? aa : undefined
    }, [annotation.frameAnnotations, currentFrameIndex])

    return (
        <div className="LabelingStackWorkArea" style={{position: 'absolute', width, height}} onWheel={handleWheel}>
            <div style={{position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h}}>
                {
                    jpeg && (
                        <FrameImageCanvas
                            width={rect.w}
                            height={rect.h}
                            affineTransform={affineTransform}
                            jpeg={jpeg}
                        />
                    )
                }
                {
                    frameAnnotation && (
                        <FrameAnnotationCanvas
                            width={rect.w}
                            height={rect.h}
                            scale={scale}
                            affineTransform={affineTransform}
                            frameAnnotation={frameAnnotation}
                        />
                    )
                }
            </div>
            <div style={{position: 'absolute', left: width - rightPanelWidth, width: rightPanelWidth}}>
                <FrameRightPanel
                    width={rightPanelWidth}
                    height={height}
                />
            </div>
		</div>
    )
}

export default LabelingStackWorkArea