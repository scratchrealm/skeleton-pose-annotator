import { Add, Delete } from "@mui/icons-material";
import { Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow, ThemeProvider } from "@mui/material";
import { FunctionComponent, useCallback } from "react";
import useSpa from "../../SpaContext/useSpa";
import { tableTheme } from "./themes";

type Props ={
	width: number
	height: number
}

const SkeletonNodesWidget: FunctionComponent<Props> = ({width, height}) => {
	const {annotation, deleteSkeletonNode, addSkeletonNode} = useSpa()
	const {skeleton} = annotation

    const handleAddNode = useCallback(() => {
        const id = prompt('Add skeleton node with ID')
        if (!id) return
        addSkeletonNode(id)
    }, [addSkeletonNode])

	return (
		<div style={{position: 'absolute', width, height, overflowY: 'auto'}}>
            <div>
                <IconButton onClick={handleAddNode} size="small" sx={{paddingBottom: 0}}><Add /></IconButton>
            </div>
            <ThemeProvider theme={tableTheme}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell><span style={{fontWeight: 'bold'}}>Node</span></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            skeleton.nodes.map(node => (
                                <TableRow key={node.id}>
                                    <TableCell><IconButton onClick={() => {deleteSkeletonNode(node.id)}}><Delete /></IconButton></TableCell>
                                    <TableCell>{node.id}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </ThemeProvider>
		</div>
	)
}

export default SkeletonNodesWidget
