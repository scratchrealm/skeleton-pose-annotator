import { Delete } from "@mui/icons-material";
import { Button, IconButton, Table, TableBody, TableCell, TableRow, ThemeProvider } from "@mui/material";
import { FunctionComponent, useCallback } from "react";
import useSpa from "../../SpaContext/useSpa";
import { tableTheme } from "./themes";

type Props ={
	width: number
	height: number
}

const SkeletonEdgesWidget: FunctionComponent<Props> = ({width, height}) => {
	const {annotation, deleteSkeletonEdge, addSkeletonEdge} = useSpa()
	const {skeleton} = annotation

    const handleAddEdge = useCallback(() => {
        const id1 = prompt('Add skeleton edge. Node ID 1:')
        if (!id1) return
        const id2 = prompt('Add skeleton edge. Node ID 2:')
        if (!id2) return
        addSkeletonEdge(id1, id2)
    }, [addSkeletonEdge])

	return (
		<div style={{position: 'absolute', width, height, overflowY: 'auto'}}>
            <div>
                <Button onClick={handleAddEdge}>Add edge</Button>
            </div>
            <ThemeProvider theme={tableTheme}>
                <Table>
                    <TableBody>
                        {
                            skeleton.edges.map(edge => (
                                <TableRow key={`${edge.id1}/${edge.id2}`}>
                                    <TableCell><IconButton onClick={() => {deleteSkeletonEdge(edge.id1, edge.id2)}}><Delete /></IconButton></TableCell>
                                    <TableCell>{edge.id1}</TableCell>
                                    <TableCell>{edge.id2}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </ThemeProvider>
		</div>
	)
}

export default SkeletonEdgesWidget
