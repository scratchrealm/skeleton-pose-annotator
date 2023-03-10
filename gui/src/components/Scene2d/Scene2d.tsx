import { randomAlphaString } from "@figurl/core-utils";
import React, { FunctionComponent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AffineTransform, applyAffineTransform, applyAffineTransformInv, createAffineTransform, identityAffineTransform, inverseAffineTransform, multAffineTransforms } from "../../LabelingStackView/AffineTransform";
import { dragSelectReducer } from "./drag-select";
import { BaseCanvas, pointInRect, RectangularRegion, Vec4 } from "./figurl-canvas";

// properties common to all Scene2dObject types
type Scene2dObjectCommon = {
	objectId: string // a unique ID for the object
	clickable?: boolean // the object is clickable
	draggable?: boolean // the object is mouse draggable
	selected?: boolean // the object is selected (affects appearance)
}

// Line object
type Scene2dLineObject = Scene2dObjectCommon & {
	type: 'line'
	x: number, y: number, // initial point
	dx: number, dy: number // terminal point is (x+dx, y+dy)
	attributes: {
		color: string // line color
		dash?: number[] // for example [4, 3] gives a dash that looks like ____   ____   ____   ____
		width?: number // line width
	}
	selectedAttributes?: { // optional attributes for when the line is selected - otherwise defaults apply
		color: string
		dash?: number[]
		width?: number
	}
}

// Marker object
type Scene2dMarkerObject = Scene2dObjectCommon & {
	type: 'marker'
	x: number, y: number // center of the marker
	textLabel?: string
	attributes: {
		fillColor?: string // fill color
		lineColor?: string // line color
		shape?: 'circle' | 'square' // marker shape
		radius?: number // marker radius
	}
	selectedAttributes?: { // optional attributes for when the marker is selected - otherwise defaults apply
		fillColor?: string
		lineColor?: string
		shape?: 'circle' | 'square'
		radius?: number
	}
}

// Connector object (connecting two markers with a line)
type Scene2dConnectorObject = Scene2dObjectCommon & {
	type: 'connector',
	objectId1: string, objectId2: string, // object IDs for the two markers to connect
	attributes: {
		color: string // line color
		dash?: number[] // line dash
		width?: number // line width
	}
}

type Scene2dRectangleObject = Scene2dObjectCommon & {
	type: 'rectangle',
	objectId: string,
	x: number,
	y: number,
	w: number,
	h: number,
	attributes: {
		color: string // line color
		dash?: number[] // for example [4, 3] gives a dash that looks like ____   ____   ____   ____
		width?: number // line width
	}
}

// Scene2d object type
export type Scene2dObject =
	Scene2dLineObject |
	Scene2dMarkerObject |
	Scene2dConnectorObject |
	Scene2dRectangleObject

type Props ={
	width: number
	height: number
	objects: Scene2dObject[] // list of objects in the scene
	controlGroups?: (string[])[]

	// an object has been clicked
	onClickObject?: (objectId: string, e: React.MouseEvent) => void

	// an object has been dragged to a new position (only fires on mouse release)
	onDragObject?: (objectId: string, newPoint: {x: number, y: number}, e: React.MouseEvent) => void

	// objects have been selected by dragging a selection rect and releasing
	onSelectObjects?: (objectIds: string[], e: React.MouseEvent | undefined) => void

	onSelectRect?: (r: {x: number, y: number, w: number, h: number}) => void

	// the canvas has been clicked, but not on a clickable object
	onClick?: (p: {x: number, y: number}, e: React.MouseEvent) => void

	onRotateAroundObject?: (objectId: string, degrees: number) => void

	affineTransform?: AffineTransform // mapping from pixel space to scaled image coord space
	setAffineTransform?: (a: AffineTransform) => void
}

const emptyDrawData = {}

// The default radius for a marker object
const defaultMarkerRadius = 6

// The default width of a line or connector object
const defaultLineWidth = 1.1

// The state of dragging an object
type DraggingObjectState = {
	object?: Scene2dMarkerObject | null // object being dragged - null means we are dragging, but not an object
	newPoint?: {x: number, y: number} // new object location
}

// An action to dispatch on the dragging object state
type DraggingObjectAction = {
	type: 'start' // start dragging
	object: Scene2dMarkerObject | null
	point: {x: number, y: number}
} | {
	type: 'end' // stop dragging
} | {
	type: 'move' // move the object to a new location (affects newPoint)
	point: {x: number, y: number}
}

const draggingObjectReducer = (s: DraggingObjectState, a: DraggingObjectAction): DraggingObjectState => {
	if (a.type === 'start') {
		// start dragging an object
		return {...s, object: a.object, newPoint: a.point}
	}
	else if (a.type === 'end') {
		// stop dragging an object
		return {...s, object: undefined}
	}
	else if (a.type === 'move') {
		// drag move an object
		return {...s, newPoint: a.point}
	}
	else return s
}

const Scene2d: FunctionComponent<Props> = ({width, height, objects, onClickObject, onDragObject, onSelectObjects, onSelectRect, onClick, onRotateAroundObject, affineTransform, setAffineTransform, controlGroups}) => {
	// The drag state (the dragSelectReducer is more generic and is defined elsewhere)
	const [dragState, dragStateDispatch] = useReducer(dragSelectReducer, {})

	// The dragging object state (tracks which object is being dragged and where)
	const [draggingObject, draggingObjectDispatch] = useReducer(draggingObjectReducer, {})

	// The select rect when dragging a rect for selection, not dragging an object
	const [activeSelectRect, setActiveSelectRect] = useState<Vec4 | undefined>()

	// The active mouse event, for purpose of passing to the event handlers (ctrlKey, shiftKey, etc)
	const [activeMouseEvent, setActiveMouseEvent] = useState<React.MouseEvent | undefined>()

	// handle a rect has been selected
	const handleSelectRect = useCallback((r: Vec4, e: React.MouseEvent | undefined) => {
		const rr = {xmin: r[0], ymin: r[1], xmax: r[0] + r[2], ymax: r[1] + r[3]}
		// find the IDs of all markers that are inside the select rect
		const objectIds = objects.filter(o => {
			if (o.type === 'marker') {
				if (pointInRect([o.x, o.y], rr)) {
					return true
				}
			}
			return false
		}).map(o => (o.objectId))
		// call the event handler
		onSelectObjects && onSelectObjects(objectIds, e)
		onSelectRect && onSelectRect({x: rr.xmin, y: rr.ymin, w: rr.xmax - rr.xmin, h: rr.ymax - rr.ymin})
	}, [objects, onSelectObjects, onSelectRect])

	useEffect(() => {
		// dragState, activeSelectRect, or dragging object has changed
		if ((dragState.isActive) && (dragState.dragAnchor)) {
			// We are dragging
			if (draggingObject.object === undefined) {
				// we are not dragging an object (including null object - null means dragging but not an object)

				// find a draggable marker object at the drag anchor.
				// If found, dispatch a dragging object start action for this object
				// Otherwise, if not found, dispatch a start action for the null object
				const p = dragState.dragAnchor
				let found = false
				for (let i = objects.length - 1; i >= 0; i--) {
					const o = objects[i]
					if ((o.draggable) && (o.type === 'marker')) {
						if (pointInObject(o, {x: p[0], y: p[1]})) {
							draggingObjectDispatch({type: 'start', object: o, point: {x: p[0], y: p[1]}})
							found = true
							break
						}
					}
				}
				if (!found) {
					draggingObjectDispatch({type: 'start', object: null, point: {x: 0, y: 0}})
				}
				///////////////////////////////////////////////////////////////////////////
			}
			else {
				// we are dragging an object (including null - null means dragging but not an object)
				const p = dragState.dragPosition
				if (p) {
					// report moved the dragging object
					draggingObjectDispatch({type: 'move', point: {x: p[0], y: p[1]}})
				}
				if (draggingObject.object === null) {
					// if we are dragging, but not an object, then set the active select rect
					if (dragState.altKey) {
						setActiveSelectRect(dragState.dragRect)
					}
				}
			}
		}
		else {
			// we are not dragging
			if (draggingObject.object !== undefined) {
				// but we were dragging before, so let's dispatch the end event
				draggingObjectDispatch({type: 'end'})
			}
			if (activeSelectRect) {
				// we had an active select rect, so let's call the select rect event handler
				handleSelectRect(activeSelectRect, activeMouseEvent)
				// and set the active select rect to undefined
				setActiveSelectRect(undefined)
			}
		}
	}, [dragState, activeSelectRect, activeMouseEvent, handleSelectRect, draggingObject.object, objects])

	const zoomScaleFactor = useMemo(() => {
		if (!affineTransform) return 1
		const ff = affineTransform.forward
		return 1 / Math.sqrt(ff[0][0] * ff[1][1] - ff[0][1] * ff[1][0])
	}, [affineTransform])

	const getObjectIdsInControlGroup = useMemo(() => (
		(objectId: string) => {
			const aa = (controlGroups || []).find(g => (g.includes(objectId)))
			return aa ? aa : [objectId]
		}
	), [controlGroups])

	const [hoveredObjectId, setHoveredObjectId] = useState<string | undefined>()

	const labelOffsetDirections = useMemo(() => {
		const ret: {[objecttId: string]: {x: number, y: number}} = {}
		for (const cg of (controlGroups || [])) {
			const objectsInCG: Scene2dMarkerObject[] = []
			for (const o of objects) {
				if (o.type === 'marker') {
					if (cg.includes(o.objectId)) {
						objectsInCG.push(o)
					}
				}
			}
			if (objectsInCG.length > 0) {
				const centroid = {
					x: computeMean(objectsInCG.map(o => (o.x))),
					y: computeMean(objectsInCG.map(o => (o.y)))
				}
				for (const o of objectsInCG) {
					const dir = {x: o.x - centroid.x, y: o.y - centroid.y}
					const norm = Math.sqrt(dir.x * dir.x + dir.y * dir.y)
					if (norm) {
						dir.x /= norm
						dir.y /= norm
						ret[o.objectId] = dir
					}
				}
			}
		}
		return ret
	}, [controlGroups, objects])

	// paint all the objects on the canvas
	const paint = useCallback((ctxt: CanvasRenderingContext2D, props: any) => {
		ctxt.clearRect(0, 0, width, height)
		ctxt.save()
		if (affineTransform) {
			const ff = affineTransform.forward
			ctxt.transform(ff[0][0], ff[1][0], ff[0][1], ff[1][1], ff[0][2], ff[1][2])
		}
		const objectsById: {[id: string]: Scene2dObject} = {}
		for (const o of objects) objectsById[o.objectId] = o
		if ((!draggingObject.object) && (dragState.isActive) && (dragState.dragRect) && (activeSelectRect)) {
			const rect = activeSelectRect
			ctxt.fillStyle = defaultDragStyle
            ctxt.fillRect(rect[0], rect[1], rect[2], rect[3])
		}
		const draggingDelta = draggingObject && draggingObject.newPoint && draggingObject.object ? (
			{x: draggingObject.newPoint.x - draggingObject.object.x, y: draggingObject.newPoint.y - draggingObject.object.y}
		) : {x: 0, y: 0}
		const draggingObjectIds = draggingObject && draggingObject.object ? (
			dragState.altKey ? getObjectIdsInControlGroup(draggingObject.object.objectId) : [draggingObject.object.objectId]
		): []
		const paintObject = (o: Scene2dObject) => {
			if ((o.type === 'line') || (o.type === 'marker')) {
				// draw a line or marker
				let pp = {x: o.x, y: o.y}
				if (draggingObjectIds.includes(o.objectId)) {
					// use the new location if dragging
					pp = {x: o.x + draggingDelta.x, y: o.y + draggingDelta.y}
				}

				if (o.type === 'line') {
					// draw a line
					const attributes = !o.selected ? o.attributes : o.selectedAttributes || {...o.attributes, color: 'yellow', width: (o.attributes.width || defaultLineWidth) * 1.5}
					ctxt.lineWidth = (attributes.width || defaultLineWidth) * zoomScaleFactor
					if (attributes.dash) ctxt.setLineDash(attributes.dash)
					ctxt.strokeStyle = attributes.color || 'black'
					ctxt.beginPath()
					ctxt.moveTo(pp.x, pp.y)
					ctxt.lineTo(pp.x + o.dx, pp.y + o.dy)
					ctxt.stroke()
					ctxt.setLineDash([])
				}
				else if (o.type === 'marker') {
					// draw a marker
					const attributes = !o.selected ? o.attributes : o.selectedAttributes || {...o.attributes, fillColor: 'orange', radius: (o.attributes.radius || defaultMarkerRadius) * 1.5}
					let radius = (attributes.radius || defaultMarkerRadius)
					// radius *= Math.sqrt(zoomScaleFactor) // not sure how exactly to scale
					radius *= zoomScaleFactor // not sure how exactly to scale
					const shape = o.attributes.shape || 'circle'
					ctxt.lineWidth = defaultLineWidth
					ctxt.fillStyle = attributes.fillColor || 'black'
					ctxt.strokeStyle = attributes.lineColor || 'black'

					if ((o.objectId === hoveredObjectId) || (o.objectId === draggingObject.object?.objectId)) {
						ctxt.strokeStyle = 'yellow'
						ctxt.fillStyle = 'yellow'
					}

					ctxt.beginPath()
					if (shape === 'circle') {
						ctxt.ellipse(pp.x, pp.y, radius, radius, 0, 0, 2 * Math.PI)
					}
					else if (shape === 'square') {
						ctxt.rect(pp.x - radius, pp.y - radius, radius * 2, radius * 2)
					}
					attributes.fillColor && ctxt.fill()
					attributes.lineColor && ctxt.stroke()

					if (o.textLabel) {
						const labelOffsetDirection = labelOffsetDirections[o.objectId] || {x: 1, y: 0}
						let fontSize = 12
						fontSize *= Math.sqrt(zoomScaleFactor) // not sure how best to scale here
						ctxt.fillStyle = '#55ccaa'
						ctxt.font = `bold ${fontSize}px Arial` // scaling font size properly is tricky business - sqrt() seems to work well
						setTextAlignBasedOnLabelOffsetDirection(ctxt, labelOffsetDirection)
						ctxt.fillText(o.textLabel, pp.x + (radius * zoomScaleFactor + 2) * labelOffsetDirection.x, pp.y + (radius * zoomScaleFactor + 2) * labelOffsetDirection.y)
					}
				}
			}
			else if (o.type === 'rectangle') {
				const pp00 = {x: o.x, y: o.y}
				const pp11 = {x: o.x + o.w, y: o.y + o.h}

				const attributes = o.attributes
				ctxt.lineWidth = (attributes.width || defaultLineWidth) * zoomScaleFactor
				if (attributes.dash) ctxt.setLineDash(attributes.dash)
				ctxt.strokeStyle = attributes.color || 'black'
				ctxt.beginPath()
				ctxt.moveTo(pp00.x, pp00.y)
				ctxt.lineTo(pp11.x, pp00.y)
				ctxt.lineTo(pp11.x, pp11.y)
				ctxt.lineTo(pp00.x, pp11.y)
				ctxt.lineTo(pp00.x, pp00.y)
				ctxt.stroke()
				ctxt.setLineDash([])
			}
			else if (o.type === 'connector') {
				// draw a connector
				const obj1 = objectsById[o.objectId1]
				const obj2 = objectsById[o.objectId2]
				if ((obj1) && (obj2) && (obj1.type === 'marker') && (obj2.type === 'marker')) {

					let pp1 = {x: obj1.x, y: obj1.y}
					if (draggingObjectIds.includes(obj1.objectId)) {
						// use the new location if dragging
						pp1 = {x: obj1.x + draggingDelta.x, y: obj1.y + draggingDelta.y}
					}

					let pp2 = {x: obj2.x, y: obj2.y}
					if (draggingObjectIds.includes(obj2.objectId)) {
						// use the new location if dragging
						pp2 = {x: obj2.x + draggingDelta.x, y: obj2.y + draggingDelta.y}
					}

					const attributes = o.attributes
					if (attributes.dash) ctxt.setLineDash(attributes.dash)
					ctxt.lineWidth = (attributes.width || defaultLineWidth) * zoomScaleFactor
					ctxt.strokeStyle = attributes.color || 'black'
					ctxt.beginPath()
					ctxt.moveTo(pp1.x, pp1.y)
					ctxt.lineTo(pp2.x, pp2.y)
					ctxt.stroke()
					ctxt.setLineDash([])
				}
			}
		}
		// paint all the objects in order
        objects.forEach(object => {
			paintObject(object)
		})
		ctxt.restore()
    }, [objects, width, height, draggingObject, dragState.isActive, dragState.dragRect, affineTransform, zoomScaleFactor, getObjectIdsInControlGroup, dragState.altKey, activeSelectRect, hoveredObjectId, labelOffsetDirections])

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const p0 = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
		const p = affineTransform ? applyAffineTransformInv(affineTransform, p0) : p0
		// communicate the mouse down action to the drag state

		let isDraggingObject = false
		for (let i = objects.length - 1; i >= 0; i--) {
			const o = objects[i]
			if ((o.draggable) && (o.type === 'marker')) {
				if (pointInObject(o, p)) {
					isDraggingObject = true
					break
				}
			}
		}

        dragStateDispatch({type: 'DRAG_MOUSE_DOWN', point: [p.x, p.y], altKey: e.altKey, extraAnchorData: {affineTransform, point: p0, isDraggingObject}})
    }, [affineTransform, objects])
	const handleMouseUp = useCallback((e: React.MouseEvent) => {
		const boundingRect = e.currentTarget.getBoundingClientRect()
		const p0 = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
		const p = affineTransform ? applyAffineTransformInv(affineTransform, p0) : p0
		if (!dragState.isActive) {
			// if we are not dragging, and have released the mouse button
			// then let's call the object cclick handler if we find a clickable object
			// at this position
			let found = false
			for (let i = objects.length - 1; i >= 0; i--) {
				const o = objects[i]
				if (o.clickable) {
					if (pointInObject(o, p)) {
						found = true
						onClickObject && onClickObject(o.objectId, e)
						break
					}
				}
			}
			if (!found) {
				// if we didn't find a clickable object
				// then we call the click handler
				if (!draggingObject.object) {
					onClick && onClick(p, e)
				}
			}
		}
		if ((draggingObject.newPoint) && (draggingObject.object)) {
			// we have released the mouse button, and we were dragging an object
			// so let's call the drag object handler
			const draggingDelta = {
				x: draggingObject.newPoint.x - draggingObject.object.x,
				y: draggingObject.newPoint.y - draggingObject.object.y
			}
			const objIds = dragState.altKey ? getObjectIdsInControlGroup(draggingObject.object.objectId) : [draggingObject.object.objectId]
			objIds.forEach(objId => {
				const oo = objects.find(o => (o.objectId === objId))
				if ((oo) && (oo.type === 'marker')) {
					onDragObject && onDragObject(objId, {x: oo.x + draggingDelta.x, y: oo.y + draggingDelta.y}, e)
				}
			})
		}
		// set the active mouse event for purpose of passing this to event handlers
		setActiveMouseEvent(e)
		// communicate the mouse up action to the drag state
		dragStateDispatch({type: 'DRAG_MOUSE_UP', point: [p.x, p.y]})
    }, [dragState.isActive, dragState.altKey, objects, onClickObject, onClick, draggingObject.newPoint, draggingObject.object, onDragObject, affineTransform, getObjectIdsInControlGroup])
	const adjustTransformToStayWithinBounds = useMemo(() => (
		(transform: AffineTransform) => {
			let newTransform = transform
			// adjust the transform so we stay within bounds
			const test1 = applyAffineTransform(newTransform, {x: 0, y: 0})
			const test2 = applyAffineTransform(newTransform, {x: width, y: height})
			if (test2.x < width) {
				const adj = createAffineTransform([
					[1, 0, -test2.x + width],
					[0, 1, 0]
				])
				newTransform = multAffineTransforms(adj, newTransform)
			}
			if (test1.x > 0) {
				const adj = createAffineTransform([
					[1, 0, -test1.x + 0],
					[0, 1, 0]
				])
				newTransform = multAffineTransforms(adj, newTransform)
			}
			if (test2.y < height) {
				const adj = createAffineTransform([
					[1, 0, 0],
					[0, 1, -test2.y + height]
				])
				newTransform = multAffineTransforms(adj, newTransform)
			}
			if (test1.y > 0) {
				const adj = createAffineTransform([
					[1, 0, 0],
					[0, 1, -test1.y + 0]
				])
				newTransform = multAffineTransforms(adj, newTransform)
			}
			return newTransform
		}
	), [width, height])
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const p0 = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
		const p = affineTransform ? applyAffineTransformInv(affineTransform, p0) : p0

		let hoveredId: string | undefined = undefined
		for (let i = objects.length - 1; i >= 0; i--) {
			const o = objects[i]
			if ((o.draggable) && (o.type === 'marker')) {
				if (pointInObject(o, p)) {
					hoveredId = o.objectId
					break
				}
			}
		}
		setHoveredObjectId(hoveredId)

		if ((dragState.dragAnchor) && (dragState.extraAnchorData) && (!dragState.altKey) && (setAffineTransform)) {
			const {affineTransform: anchorAffineTransform, point: anchorPoint, isDraggingObject} = dragState.extraAnchorData
			if (!isDraggingObject) {
				const delta = {
					x: p0.x - anchorPoint.x,
					y: p0.y - anchorPoint.y
				}
				const X = createAffineTransform([
					[1, 0, delta.x],
					[0, 1, delta.y]
				])
				let newTransform = multAffineTransforms(X, anchorAffineTransform)

				newTransform = adjustTransformToStayWithinBounds(newTransform)
				setAffineTransform(newTransform)
			}
		}

		// communicate the mouse move action to the drag state
		dragStateDispatch({type: 'DRAG_MOUSE_MOVE', point: [p.x, p.y]})
    }, [affineTransform, dragState.altKey, dragState.dragAnchor, dragState.extraAnchorData, setAffineTransform, objects, adjustTransformToStayWithinBounds])
    const handleMouseLeave = useCallback((e: React.MouseEvent) => {
		// communicate the mouse leave action to the drag state
		dragStateDispatch({type: 'DRAG_MOUSE_LEAVE'})
    }, [])

	const lastWheelEventTimestamp = useRef<number>(0)
	const handleZoomWheel = useCallback((e: React.WheelEvent) => {
		if (!affineTransform) return
		if (!setAffineTransform) return

		const x = 0
		const y = 0

		// limiting the frequency of wheel events
        // this is important because if we are using trackpad
        // we get excessive frequency of wheel events
        // which makes it difficult to control the zoom
        const elapsedSinceLastWheelEvent = Date.now() - lastWheelEventTimestamp.current
        if (elapsedSinceLastWheelEvent < 100) return
        lastWheelEventTimestamp.current = Date.now()

        const boundingRect = e.currentTarget.getBoundingClientRect()
        const point = {x: e.clientX - boundingRect.x - x, y: e.clientY - boundingRect.y - y}
        const deltaY = e.deltaY
        const scaleFactor = 1.5
        let X = createAffineTransform([
            [scaleFactor, 0, (1 - scaleFactor) * point.x],
            [0, scaleFactor, (1 - scaleFactor) * point.y]
        ])
        if (deltaY > 0) X = inverseAffineTransform(X)
        let newTransform = multAffineTransforms(
            X,
            affineTransform
        )
        // test to see if we should snap back to identity
        const p00 = applyAffineTransform(newTransform, {x: x, y: y})
        const p11 = applyAffineTransform(newTransform, {x: x + width, y: y + height})
        if ((p11.x - p00.x < width) && (p11.y - p00.y < height)) {
            newTransform = identityAffineTransform
        }
        // if ((x <= p00.x) && (p00.x < x + width) && (y <= p00.y) && (p00.y < y + height)) {
        //     if ((x <= p11.x) && (p11.x < x + width) && (y <= p11.y) && (p11.y < y + height)) {
        //         newTransform = identityAffineTransform
        //     }
        // }

		newTransform = adjustTransformToStayWithinBounds(newTransform)
        setAffineTransform(newTransform)
        return false
	}, [affineTransform, height, setAffineTransform, width, adjustTransformToStayWithinBounds])
	const handleWheel = useCallback((e: React.WheelEvent) => {
		if ((e.altKey) && (onRotateAroundObject)) {
			const boundingRect = e.currentTarget.getBoundingClientRect()
			const p0 = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
			const p = affineTransform ? applyAffineTransformInv(affineTransform, p0) : p0
			objects.forEach(o => {
				if ((o.type === 'marker')) {
					if (pointInObject(o, p)) {
						onRotateAroundObject(o.objectId, e.deltaY > 0 ? 15 : -15)
					}
				}
			})
		}
		if (!e.altKey) {
			handleZoomWheel(e)
		}
	}, [affineTransform, objects, onRotateAroundObject, handleZoomWheel])

	return (
		<div
            style={{width, height, position: 'relative'}}
            onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
			onWheel={handleWheel}
        >
			<BaseCanvas
				width={width}
				height={height}
				draw={paint}
				drawData={emptyDrawData}
			/>
		</div>
	)
}

function setTextAlignBasedOnLabelOffsetDirection(canvas: CanvasRenderingContext2D, direction: {x: number, y: number}) {
	if (direction.x > 0.5) {
		canvas.textAlign = 'left'
	}
	else if (direction.x < -0.5) {
		canvas.textAlign = 'right'
	}
	else {
		canvas.textAlign = 'center'
	}
	if (direction.y > 0.5) {
		canvas.textBaseline = 'top'
	}
	else if (direction.y < -0.5) {
		canvas.textBaseline = 'bottom'
	}
	else {
		canvas.textBaseline = 'middle'
	}
}

const defaultDragStyle = 'rgba(196, 196, 196, 0.5)'

// check whether a point is contained in a scene2d object
const pointInObject = (o: Scene2dObject, p: {x: number, y: number}) => {
	if (o.type === 'marker') {
		const r = o.attributes.radius || defaultMarkerRadius
		const R: RectangularRegion = {xmin: o.x - r, ymin: o.y - r, xmax: o.x + r, ymax: o.y + r}
		return pointInRect([p.x, p.y], R)
	}
	else return false
}

function computeMean(x: number[]) {
	let ret = x.reduce((prev, v) => (prev + v), 0)
	if (x.length > 0) ret /= x.length
	return ret
}

export const createObjectId = () => (randomAlphaString(10))

export default Scene2d