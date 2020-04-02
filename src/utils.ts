import * as path from "path";
import { ThemeIcon } from "vscode";

export function getThemeIcon(iconFileName: string): ThemeIcon {
    return {
        dark: path.join(__dirname, "..", "resources", "dark", iconFileName),
        light: path.join(__dirname, "..", "resources", "light", iconFileName),
    };
}

export function getResourceIcon(iconFileName: string): string {
    return path.join(__dirname, "..", "resources", iconFileName);
}
