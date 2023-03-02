import { getFigureData, startListeningToParent } from "@figurl/interface";
import { FunctionComponent, useEffect, useMemo, useReducer, useState } from "react";
import SpaContext, { initialSpaData } from "./SpaContext/SpaContext";
import spaReducer from "./SpaContext/spaReducer";
import useWindowDimensions from "./useWindowDimensions";
import View from "./View";
import { isViewData } from "./ViewData";

const urlSearchParams = new URLSearchParams(window.location.search)
const queryParams = Object.fromEntries(urlSearchParams.entries())

const MainWindow: FunctionComponent = () => {
    const {data, errorMessage} = useData()
    const {width, height} = useWindowDimensions()

    const [spaData, spaDispatch] = useReducer(spaReducer, initialSpaData)
    const spaContextValue = useMemo(() => ({spaData, spaDispatch}), [spaData, spaDispatch])

    if (errorMessage) {
        const style0 = { color: 'red' }
        return <div style={style0}>{errorMessage}</div>
    }

    if (!data) {
        return <div>Waiting for data</div>
    }
    console.info(data)
    if (!isViewData(data)) {
        return <div>Invalid view data</div>
    }
    return (
        <SpaContext.Provider value={spaContextValue}>
            <View data={data} width={width} height={height} />
        </SpaContext.Provider>
    )
}

const useData = () => {
    const [data, setData] = useState<any>()
    const [errorMessage, setErrorMessage] = useState<string>()

    useEffect(() => {
        if (queryParams.figureId) {
            getFigureData().then((data: any) => {
                if (!data) {
                    setErrorMessage(`No data returned by getFigureData()`)
                    return
                }
                setData(data)
            }).catch((err: any) => {
                setErrorMessage(`Error getting figure data`)
                console.error(`Error getting figure data`, err)
            })
        }
        else {
            setData({})
        }
    }, [])

    return {data, errorMessage}
}

if (queryParams.figureId) {
    startListeningToParent()
}

export default MainWindow