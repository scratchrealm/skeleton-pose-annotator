import { Add, AddCircle, Delete } from "@mui/icons-material";
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow, ThemeProvider } from "@mui/material";
import { FunctionComponent, useCallback, useMemo } from "react";
import { instanceColorForIndex } from "../../instanceColorList";
import useSpa from "../../SpaContext/useSpa";
import { tableTheme } from "../ControlPanel/themes";

type Props ={
	width: number
	height: number
}

const InstancesWidget: FunctionComponent<Props> = ({width, height}) => {
    const {currentFrameIndex, annotation, deleteInstance, addInstance} = useSpa()

    const handleAddInstance = useCallback(() => {
        addInstance(currentFrameIndex)
    }, [addInstance, currentFrameIndex])

    const instanceIndices = useMemo(() => (
        ((annotation.frameAnnotations[currentFrameIndex] || {}).instances || []).map((instance, ii) => (ii))
    ), [annotation.frameAnnotations, currentFrameIndex])

	return (
		<div style={{position: 'absolute', width, height, overflowY: 'auto'}}>
            <div>
                <IconButton onClick={handleAddInstance} size="small" sx={{paddingBottom: 0}}><AddCircle /></IconButton>
            </div>
            <ThemeProvider theme={tableTheme}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell><span style={{fontWeight: 'bold'}}>Instance</span></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            instanceIndices.map(ii => (
                                <TableRow key={ii}>
                                    <TableCell><IconButton onClick={() => {deleteInstance(currentFrameIndex, ii)}}><Delete /></IconButton></TableCell>
                                    <TableCell><span style={{color: instanceColorForIndex(ii)}}>Instance {ii}</span></TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </ThemeProvider>
		</div>
	)
}

export default InstancesWidget
