import { SpaAction, SpaData } from "./SpaContext";

const cleanUpNodeLocations = (data: SpaData, reducer: (state: SpaData, action: SpaAction) => SpaData): SpaData => {
    // VERY IMPORTANT: this function should return original object if nothing has changed
    const {annotation} = data
    let ret = data
    const skeletonNodes = annotation.skeleton.nodes
    const skeletonNodeIds = skeletonNodes.map(sn => (sn.id))
    annotation.frameAnnotations.forEach((frame) => {
        const frameIndex = frame.frameIndex
        frame.instances.forEach((instance, instanceIndex) => {
            const instanceNodeIds = instance.nodeLocations.map(nl => (nl.id))
            for (const nodeId of instanceNodeIds) {
                if (!skeletonNodeIds.includes(nodeId)) {
                    ret = reducer(ret, {type: 'deleteNodeLocation', frameIndex, instanceIndex, nodeId})
                }
            }
            for (const nodeId of skeletonNodeIds) {
                if (!instanceNodeIds.includes(nodeId)) {
                    ret = reducer(ret, {type: 'addNodeLocation', frameIndex, instanceIndex, nodeId})
                }
            }
        })
    })
    return ret
}

export default cleanUpNodeLocations