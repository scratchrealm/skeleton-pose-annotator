import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Scene2d, useScene2dObjects } from "../../components/Scene2d";
import { instanceColorForIndex } from "../../instanceColorList";
import { SpaFrameAnnotation, SpaNodeLocation } from "../../SpaContext/SpaContext";
import useSpa from "../../SpaContext/useSpa";
import { AffineTransform } from "../AffineTransform";


type Props = {
    frameAnnotation: SpaFrameAnnotation
    affineTransform?: AffineTransform
    scale: [number, number]
    width: number
    height: number
}

const FrameAnnotationCanvas: FunctionComponent<Props> = ({frameAnnotation, affineTransform, width, height, scale}) => {
    const {moveNodeLocation, rotateInstanceAroundNode, annotation, frameWidth, frameHeight} = useSpa()
    const {objects, clearObjects, addObject} = useScene2dObjects()
    const markerRadius = width > 800 ? 6 : 4
    useEffect(() => {
        clearObjects()
        if (!frameWidth) return
        if (!frameHeight) return
        for (let instanceIndex = 0; instanceIndex < frameAnnotation.instances.length; instanceIndex++) {
            const instance = frameAnnotation.instances[instanceIndex]
            const instanceColor = instanceColorForIndex(instanceIndex)
            for (const n of annotation.skeleton.nodes) {
                const nl = instance.nodeLocations.find(x => (x.id === n.id))
                if (nl) {
                    addObject({
                        type: 'marker',
                        objectId: `n:${instanceIndex}:${n.id}`,
                        x: nl.x * scale[0],
                        y: nl.y * scale[1],
                        attributes: {lineColor: instanceColor, fillColor: lighten(instanceColor), radius: markerRadius}, draggable: true,
                        textLabel: n.id
                    })
                }
            }
            for (const e of annotation.skeleton.edges) {
                addObject({type: 'connector', objectId: `e:${instanceIndex}:${e.id1}:${e.id2}`, objectId1: `n:${instanceIndex}:${e.id1}`, objectId2: `n:${instanceIndex}:${e.id2}`, attributes: {color: 'orange'}})
            }
        }
    }, [clearObjects, addObject, frameAnnotation.instances, scale, annotation.skeleton, frameWidth, frameHeight, markerRadius])
    const handleDragObject = useCallback((objectId: string, newPoint: {x: number, y: number}) => {
        const aa = objectId.split(':')
        if (aa[0] === 'n') {
            const instanceIndex = parseInt(aa[1])
            const nodeId = aa[2]
            moveNodeLocation({frameIndex: frameAnnotation.frameIndex, instanceIndex, nodeId, x: newPoint.x / scale[0], y: newPoint.y / scale[1]})
        }
    }, [moveNodeLocation, frameAnnotation.frameIndex, scale])
    const controlGroups = useMemo(() => {
        const ret: (string[])[] = []
        frameAnnotation.instances.forEach((instance, instanceId) => {
            ret.push(instance.nodeLocations.map(nl => (`n:${instanceId}:${nl.id}`)))
        })
        return ret
    }, [frameAnnotation.instances])
    const handleRotateAroundObject = useCallback((objectId: string, degrees: number) => {
        const aa = objectId.split(':')
        if (aa[0] === 'n') {
            const instanceIndex = parseInt(aa[1])
            const nodeId = aa[2]
            rotateInstanceAroundNode({frameIndex: frameAnnotation.frameIndex, instanceIndex, nodeId, degrees})
        }
    }, [frameAnnotation.frameIndex, rotateInstanceAroundNode])
    return (
        <Scene2d
            width={width}
            height={height}
            affineTransform={affineTransform}
            objects={objects}
            onDragObject={handleDragObject}
            controlGroups={controlGroups}
            onRotateAroundObject={handleRotateAroundObject}
        />
    )
}

function lighten(c: string) {
    return adjustColor(c, 60)
}

function adjustColor(color: string, incr: number) {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);

    R = Math.max(0, Math.min(255, R + incr))
    G = Math.max(0, Math.min(255, G + incr))
    B = Math.max(0, Math.min(255, B + incr))

    const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}


export default FrameAnnotationCanvas