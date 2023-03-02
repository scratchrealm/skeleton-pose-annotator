import { useCallback, useContext } from "react"
import SpaContext from "./SpaContext"

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
    
    return {
        ...spaData,
        setCurrentFrameIndex,
        incrementCurrentFrameIndex,
        addSkeletonNode,
        deleteSkeletonNode,
        addSkeletonEdge,
        deleteSkeletonEdge
    }
}

export default useSpa