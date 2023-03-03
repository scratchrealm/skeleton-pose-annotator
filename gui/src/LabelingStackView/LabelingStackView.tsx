import { FunctionComponent, useContext, useEffect } from "react";
import SpaContext, { SpaFrameImage } from "../SpaContext/SpaContext";
import { LabelingStackViewData } from "./LabelingStackViewData";
import LabelingStackWidget from "./LabelingStackWidget";
import loadMjpeg from "./loadMjpeg";

type Props = {
    data: LabelingStackViewData
    width: number
    height: number
}

const LabelingStackView: FunctionComponent<Props> = ({data, width, height}) => {
    const {spaDispatch} = useContext(SpaContext)
    useEffect(() => {
        spaDispatch({type: 'setFrameDimensions', width: data.width, height: data.height})
        spaDispatch({type: 'setNumFrames', numFrames: data.numFrames})
    }, [data.width, data.height, data.numFrames, spaDispatch])
    useEffect(() => {
        loadMjpeg(data.mjpegUri).then(x => {
            const frameImages: SpaFrameImage[] = x.map(a => ({
                data: a
            }))
            spaDispatch({type: 'setFrameImages', images: frameImages})
        })
    }, [spaDispatch, data.mjpegUri])
    return (
        <LabelingStackWidget
            width={width}
            height={height}
        />
    )

}

export default LabelingStackView