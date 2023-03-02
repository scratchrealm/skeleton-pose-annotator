import { SpaAction, SpaData } from "./SpaContext"

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
    else return state
}

export default spaReducer