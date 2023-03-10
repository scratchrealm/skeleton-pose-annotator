import { FunctionComponent, useEffect, useRef } from "react";
import { AffineTransform } from "../AffineTransform";


type Props = {
    jpeg: ArrayBuffer
    affineTransform?: AffineTransform
    width: number
    height: number
}

const FrameImageCanvas: FunctionComponent<Props> = ({jpeg, affineTransform, width, height}) => {
    const canvasRef = useRef<any>(null)
    useEffect(() => {
        let canceled = false
		const ctxt: CanvasRenderingContext2D | undefined = canvasRef.current?.getContext('2d')
		if (!ctxt) return

        // ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height)
        const b64 = arrayBufferToBase64(jpeg)
        const dataUrl = `data:image/jpeg;base64,${b64}`
        
        const img = new Image()
        img.onload = () => {
            if (canceled) return

            ctxt.fillStyle = '#333311' // do this so we can see background if affine transform exposes it
            ctxt.fillRect(0, 0, width, height)

            // important to apply the affine transform in the synchronous part
            ctxt.save()
            if (affineTransform) {
                const ff = affineTransform.forward
                ctxt.transform(ff[0][0], ff[1][0], ff[0][1], ff[1][1], ff[0][2], ff[1][2])
            }
            ctxt.drawImage(img, 0, 0, width, height)
            ctxt.restore()
            //////
        }
        img.src = dataUrl
        return () => {canceled = true}
	}, [jpeg, affineTransform, width, height])
    return (
        <div style={{position: 'absolute', width, height, overflow: 'hidden'}}>
			<canvas
				ref={canvasRef}
				width={width}
				height={height}
			/>
		</div>
    )
}

function arrayBufferToBase64( buffer: ArrayBuffer ) {
    let binary = '';
    const bytes = new Uint8Array( buffer );
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

export default FrameImageCanvas