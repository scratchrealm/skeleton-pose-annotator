import { isEqualTo, isNumber, isString, optional, validateObject } from "@figurl/core-utils"

export type LabelingStackViewData = {
    type: 'spa.LabelingStack'
    width: number
    height: number
    numFrames: number
    mjpegUri: string
    annotationsUri?: string
}

export const isLabelingStackViewData = (x: any): x is LabelingStackViewData => {
    return validateObject(x, {
        type: isEqualTo('spa.LabelingStack'),
        width: isNumber,
        height: isNumber,
        numFrames: isNumber,
        mjpegUri: isString,
        annotationsUri: optional(isString)
    })
}