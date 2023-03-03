import { useCallback, useContext, useMemo } from "react"
import SpaContext, { SpaAnnotation, SpaSkeleton } from "./SpaContext"

const useSpa = () => {
    const {spaData, spaDispatch} = useContext(SpaContext)

    const setCurrentFrameIndex = useCallback((index: number) => {
        spaDispatch({type: 'setCurrentFrameIndex', index})
    }, [spaDispatch])

    const incrementCurrentFrameIndex = useCallback((offset: number) => {
        spaDispatch({type: 'incrementCurrentFrameIndex', offset})
    }, [spaDispatch])

    const addSkeletonNode = useCallback((id: string) => {
        spaDispatch({type: 'addSkeletonNode', id})
    }, [spaDispatch])

    const deleteSkeletonNode = useCallback((id: string) => {
        spaDispatch({type: 'deleteSkeletonNode', id})
    }, [spaDispatch])

    const addSkeletonEdge = useCallback((id1: string, id2: string) => {
        spaDispatch({type: 'addSkeletonEdge', id1, id2})
    }, [spaDispatch])

    const deleteSkeletonEdge = useCallback((id1: string, id2: string) => {
        spaDispatch({type: 'deleteSkeletonEdge', id1, id2})
    }, [spaDispatch])

    const moveNodeLocation = useCallback((o: {frameIndex: number, instanceIndex: number, nodeId: string, x: number, y: number}) => {
        spaDispatch({type: 'moveNodeLocation', ...o})
    }, [spaDispatch])

    const addInstance = useCallback((frameIndex: number) => {
        spaDispatch({type: 'addInstance', frameIndex})
    }, [spaDispatch])

    const deleteInstance = useCallback((frameIndex: number, instanceIndex: number) => {
        spaDispatch({type: 'deleteInstance', frameIndex, instanceIndex})
    }, [spaDispatch])

    const rotateInstanceAroundNode = useCallback((o: {frameIndex: number, instanceIndex: number, nodeId: string, degrees: number}) => {
        spaDispatch({type: 'rotateInstanceAroundNode', ...o})
    }, [spaDispatch])

    const setAnnotation = useCallback((annotation: SpaAnnotation) => {
        spaDispatch({type: 'setAnnotation', annotation})
    }, [spaDispatch])

    const setSkeleton = useCallback((skeleton: SpaSkeleton) => {
        spaDispatch({type: 'setSkeleton', skeleton})
    }, [spaDispatch])

    const currentFrameAnnotation = useMemo(() => {
        const aa = spaData.annotation.frameAnnotations.filter(x => (x.frameIndex === spaData.currentFrameIndex))[0]
        return aa ? aa : undefined
    }, [spaData.annotation.frameAnnotations, spaData.currentFrameIndex])
    
    return {
        ...spaData,
        currentFrameAnnotation,
        setCurrentFrameIndex,
        incrementCurrentFrameIndex,
        addSkeletonNode,
        deleteSkeletonNode,
        addSkeletonEdge,
        deleteSkeletonEdge,
        moveNodeLocation,
        addInstance,
        deleteInstance,
        rotateInstanceAroundNode,
        setAnnotation,
        setSkeleton
    }
}

export default useSpa