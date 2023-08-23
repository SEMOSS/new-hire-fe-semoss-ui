import { useMemo } from "react";
import {
    createTheme,
    ThemeProvider as MuiThemeProvider,
    CssBaseline,
} from "@mui/material";
import deepmerge from "deepmerge";

import { lightTheme, CustomThemeOptions } from "../../theme";

export interface ThemeProviderProps {
    /** Apply the css reset */
    reset?: boolean;

    /** Theme to pass into the provider */
    theme?: CustomThemeOptions;

    /** children to be rendered */
    children?: React.ReactNode;
}

export const ThemeProvider = (props: ThemeProviderProps) => {
    const { reset = true, children, theme = {} } = props;

    // if the override any options and merge it with the default theme
    const t = useMemo(() => {
        // extendTheme to get added properties to theme
        const b = deepmerge(lightTheme, theme);
        console.log(b);
        return createTheme(deepmerge(lightTheme, theme));
    }, [theme]);

    return (
        <MuiThemeProvider theme={t}>
            {reset && <CssBaseline />}
            {children}
        </MuiThemeProvider>
    );
};
