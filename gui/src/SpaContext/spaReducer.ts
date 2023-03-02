import cleanUpNodeLocations from "./cleanUpNodeLocations"
import { SpaAction, SpaData, SpaFrameAnnotation, SpaFrameAnnotationInstance, SpaNodeLocation } from "./SpaContext"

const spaReducer = (state: SpaData, action: SpaAction): SpaData => {
    if (action.type === 'setCurrentFrameIndex') {
        return {
            ...state,
            currentFrameIndex: action.index
        }
    }
    else if (action.type === 'incrementCurrentFrameIndex') {
        return {
            ...state,
            currentFrameIndex: Math.min((state.numFrames || 1) - 1, Math.max(0, state.currentFrameIndex + action.offset))
        }
    }
    else if (action.type === 'setFrameDimensions') {
        return {
            ...state,
            frameWidth: action.width,
            frameHeight: action.height
        }
    }
    else if (action.type === 'setNumFrames') {
        return {
            ...state,
            numFrames: action.numFrames
        }
    }
    else if (action.type === 'setFrameImages') {
        return {
            ...state,
            frameImages: action.images
        }
    }
    else if (action.type === 'addSkeletonNode') {
        return {
            ...state,
            annotation: {
                ...state.annotation,
                skeleton: {
                    ...state.annotation.skeleton,
                    nodes: state.annotation.skeleton.nodes.find(e => (e.id === action.id)) ? state.annotation.skeleton.nodes : [...state.annotation.skeleton.nodes, {id: action.id}]
                }
            }
        }
    }
    else if (action.type === 'deleteSkeletonNode') {
        return {
            ...state,
            annotation: {
                ...state.annotation,
                skeleton: {
                    ...state.annotation.skeleton,
                    nodes: state.annotation.skeleton.nodes.filter(e => (e.id !== action.id))
                }
            }
        }
    }
    else if (action.type === 'addSkeletonEdge') {
        return {
            ...state,
            annotation: {
                ...state.annotation,
                skeleton: {
                    ...state.annotation.skeleton,
                    edges: state.annotation.skeleton.edges.find(e => (e.id1 === action.id1 && e.id2 === action.id2)) ? state.annotation.skeleton.edges : [...state.annotation.skeleton.edges, {id1: action.id1, id2: action.id2}]
                }
            }
        }
    }
    else if (action.type === 'deleteSkeletonEdge') {
        return {
            ...state,
            annotation: {
                ...state.annotation,
                skeleton: {
                    ...state.annotation.skeleton,
                    edges: state.annotation.skeleton.edges.filter(e => (!(e.id1 === action.id1 && e.id2 === action.id2)))
                }
            }
        }
    }
    else if (action.type === 'moveNodeLocation') {
        return {
            ...state,
            annotation: {
                ...state.annotation,
                frameAnnotations: updateFrameAnnotation(state.annotation.frameAnnotations, action.frameIndex, (fa: SpaFrameAnnotation): SpaFrameAnnotation => ({
                    ...fa,
                    instances: updateFrameAnnotationInstance(fa.instances, action.instanceIndex, (fai: SpaFrameAnnotationInstance): SpaFrameAnnotationInstance => ({
                        ...fai,
                        nodeLocations: updateNodeLocation(fai.nodeLocations, action.nodeId, (nl: SpaNodeLocation): SpaNodeLocation => ({
                            ...nl,
                            x: action.x,
                            y: action.y
                        }))
                    }))
                }))
            }
        }
    }
    else if (action.type === 'addInstance') {
        return {
            ...state,
            annotation: {
                ...state.annotation,
                frameAnnotations: updateFrameAnnotation(state.annotation.frameAnnotations, action.frameIndex, (fa) => ({
                    ...fa,
                    instances: [...fa.instances, {nodeLocations: []}]
                }))
            }
        }
    }
    else if (action.type === 'deleteInstance') {
        return {
            ...state,
            annotation: {
                ...state.annotation,
                frameAnnotations: updateFrameAnnotation(state.annotation.frameAnnotations, action.frameIndex, (fa) => ({
                    ...fa,
                    instances: fa.instances.filter((x, ii) => (ii !== action.instanceIndex))
                }))
            }
        }
    }
    else if (action.type === 'cleanUpNodeLocations') {
        return cleanUpNodeLocations(state, spaReducer)
    }
    else if (action.type === 'addNodeLocation') {
        const frameWidth = state.frameWidth || 100
        const frameHeight = state.frameHeight || 100
        return {
            ...state,
            annotation: {
                ...state.annotation,
                frameAnnotations: updateFrameAnnotation(state.annotation.frameAnnotations, action.frameIndex, (fa: SpaFrameAnnotation): SpaFrameAnnotation => ({
                    ...fa,
                    instances: updateFrameAnnotationInstance(fa.instances, action.instanceIndex, (fai: SpaFrameAnnotationInstance): SpaFrameAnnotationInstance => ({
                        ...fai,
                        nodeLocations: [...fai.nodeLocations, {id: action.nodeId, x: Math.floor(Math.random() * frameWidth), y: Math.floor(Math.random() * frameHeight)}]
                    }))
                }))
            }
        }
    }
    else if (action.type === 'deleteNodeLocation') {
        return {
            ...state,
            annotation: {
                ...state.annotation,
                frameAnnotations: updateFrameAnnotation(state.annotation.frameAnnotations, action.frameIndex, (fa: SpaFrameAnnotation): SpaFrameAnnotation => ({
                    ...fa,
                    instances: updateFrameAnnotationInstance(fa.instances, action.instanceIndex, (fai: SpaFrameAnnotationInstance): SpaFrameAnnotationInstance => ({
                        ...fai,
                        nodeLocations: fai.nodeLocations.filter(x => (x.id !== action.nodeId))
                    }))
                }))
            }
        }
    }
    else return state
}

function updateFrameAnnotation(x: SpaFrameAnnotation[], i: number, f: (a: SpaFrameAnnotation) => SpaFrameAnnotation) {
    if (!x.find(a => (a.frameIndex === i))) {
        return [...x, f({frameIndex: i, instances: []})]
    }
    return x.map(a => (
        a.frameIndex === i ? f(a) : a
    ))
}

function updateFrameAnnotationInstance(x: SpaFrameAnnotationInstance[], i: number, f: (a: SpaFrameAnnotationInstance) => SpaFrameAnnotationInstance) {
    const y : SpaFrameAnnotationInstance[]= [...x]
    while (i >= y.length) {
        y.push({nodeLocations: []})
    }
    y[i] = f(y[i])
    return y
}

function updateNodeLocation(x: SpaNodeLocation[], id: string, f: (a: SpaNodeLocation) => SpaNodeLocation) {
    if (!x.find(a => (a.id === id))) {
        return [...x, f({id, x: 0, y: 0})]
    }
    return x.map(a => (
        a.id === id ? f(a) : a
    ))
}

export default spaReducer