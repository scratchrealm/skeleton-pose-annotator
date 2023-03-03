import { isOneOf } from "@figurl/core-utils"
import { LabelingStackViewData, isLabelingStackViewData } from "./LabelingStackView/LabelingStackViewData"

export type ViewData = LabelingStackViewData

export const isViewData = (x: any): x is ViewData => (
    isOneOf([
        isLabelingStackViewData
    ])(x)
)