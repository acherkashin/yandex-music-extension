import * as path from "path";

export function getThemeIcon(iconFileName: string) {
    return {
        dark: path.join(__dirname, "..", "resources", "dark", iconFileName),
        light: path.join(__dirname, "..", "resources", "light", iconFileName),
    };
}
