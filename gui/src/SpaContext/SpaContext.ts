import React from "react"

export type SpaSkeletonNode = {
    id: string
}

export type SpaSkeletonEdge = {
    id1: string
    id2: string
}

export type SpaSkeleton = {
    nodes: SpaSkeletonNode[]
    edges: SpaSkeletonEdge[]
}

export type SpaNodeLocation = {
    id: string
    x: number
    y: number
}

export type SpaFrameAnnotationInstance = {
    nodes: SpaNodeLocation[]
}

export type SpaFrameAnnotation = {
    instances: SpaFrameAnnotationInstance[]
}

export type SpaAnnotation = {
    skeleton: SpaSkeleton
    frameAnnotations: SpaFrameAnnotation[]
}

export type SpaFrameImage = {
    data: ArrayBuffer
}

export type SpaData = {
    currentFrameIndex: number
    frameWidth: number | undefined
    frameHeight: number | undefined
    numFrames: number | undefined
    annotation: SpaAnnotation
    frameImages: SpaFrameImage[]
}

export type SpaAction = {
    type: 'setCurrentFrameIndex'
    index: number
} | {
    type: 'incrementCurrentFrameIndex'
    offset: number
} | {
    type: 'setFrameDimensions'
    width: number
    height: number
} | {
    type: 'setNumFrames'
    numFrames: number
} | {
    type: 'setFrameImages'
    images: SpaFrameImage[]
} | {
    type: 'addSkeletonNode',
    id: string
} | {
    type: 'deleteSkeletonNode',
    id: string
} | {
    type: 'addSkeletonEdge',
    id1: string
    id2: string
} | {
    type: 'deleteSkeletonEdge',
    id1: string
    id2: string
}

export const initialSpaData: SpaData = {
    currentFrameIndex: 0,
    frameWidth: undefined,
    frameHeight: undefined,
    numFrames: undefined,
    annotation: {
        skeleton: {
            nodes: [{id: 'head'}, {id: 'thorax'}],
            edges: []
        },
        frameAnnotations: []
    },
    frameImages: []
}

const SpaContext = React.createContext<{ spaData: SpaData, spaDispatch: (a: SpaAction) => void }>({
    spaData: initialSpaData,
    spaDispatch: () => { }
})

export default SpaContext