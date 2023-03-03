import { createTheme } from "@mui/material";

export const tableTheme = createTheme({
	components: {
		MuiTableCell: {
			styleOverrides: {
				root: {padding: 2}
			}
		},
		MuiIconButton: {
			styleOverrides: {
				root: {padding: 0}
			}
		}
	}
});