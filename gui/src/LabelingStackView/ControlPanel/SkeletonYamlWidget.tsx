import { IconButton, TextField } from "@mui/material";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import useSpa from "../../SpaContext/useSpa";
import YAML from 'js-yaml'
import { Cancel, Edit, Save } from "@mui/icons-material";
import { SpaSkeleton } from "../../SpaContext/SpaContext";

type Props ={
	width: number
	height: number
}

const SkeletonYamlWidget: FunctionComponent<Props> = ({width, height}) => {
	const {annotation, setSkeleton} = useSpa()
	const {skeleton} = annotation
    const [editing, setEditing] = useState(false)
    const [internalValue, setInternalValue] = useState<string>()

    useEffect(() => {
        setInternalValue(YAML.dump(skeleton))
    }, [skeleton])

    const handleSave = useCallback(() => {
        if (!internalValue) return
        const newSkeleton = YAML.load(internalValue)
        setSkeleton(newSkeleton as any as SpaSkeleton)
        setEditing(false)
    }, [setSkeleton, internalValue])

	return (
		<div style={{position: 'absolute', width, height, overflowY: 'auto'}}>
            {
                !editing && <IconButton onClick={() => setEditing(v => !v)}><Edit /></IconButton>
            }
            {
                editing && <IconButton onClick={handleSave}><Save /></IconButton>
            }
            {
                editing && <IconButton onClick={() => setEditing(false)}><Cancel /></IconButton>
            }
            <TextField
                value={internalValue}
                onChange={e => {setInternalValue(e.target.value)}}
                multiline={true}
                fullWidth={true}
                disabled={!editing}
                minRows={20}
            />
		</div>
	)
}

export default SkeletonYamlWidget
