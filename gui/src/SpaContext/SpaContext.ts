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
    nodeLocations: SpaNodeLocation[]
}

export type SpaFrameAnnotation = {
    frameIndex: number
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
    type: 'addSkeletonNode'
    id: string
} | {
    type: 'deleteSkeletonNode'
    id: string
} | {
    type: 'addSkeletonEdge'
    id1: string
    id2: string
} | {
    type: 'deleteSkeletonEdge'
    id1: string
    id2: string
} | {
    type: 'moveNodeLocation'
    frameIndex: number
    instanceIndex: number
    nodeId: string
    x: number
    y: number
} | {
    type: 'rotateInstanceAroundNode'
    frameIndex: number
    instanceIndex: number
    nodeId: string
    degrees: number
} | {
    type: 'addInstance'
    frameIndex: number
} | {
    type: 'deleteInstance'
    frameIndex: number
    instanceIndex: number
} | {
    type: 'cleanUpNodeLocations'
} | {
    type: 'deleteNodeLocation'
    frameIndex: number
    instanceIndex: number
    nodeId: string
} | {
    type: 'addNodeLocation'
    frameIndex: number
    instanceIndex: number
    nodeId: string
} | {
    type: 'setAnnotation'
    annotation: SpaAnnotation
} | {
    type: 'setSkeleton',
    skeleton: SpaSkeleton
}

export const initialSpaData: SpaData = {
    currentFrameIndex: 0,
    frameWidth: undefined,
    frameHeight: undefined,
    numFrames: undefined,
    annotation: {
        skeleton: {
            nodes: [],
            edges: []
        },
        frameAnnotations: [
        ]
    },
    frameImages: []
}

const SpaContext = React.createContext<{ spaData: SpaData, spaDispatch: (a: SpaAction) => void }>({
    spaData: initialSpaData,
    spaDispatch: () => { }
})

export default SpaContext