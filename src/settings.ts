import { workspace, WorkspaceConfiguration, ConfigurationTarget, Disposable } from "vscode";

//https://github.com/jlandersen/vscode-vsts-build-status/blob/389d6a816d53657d9c505f383371f3393bae3a85/src/settings.ts/
export class YandexMusicSettings {
    private static instance: YandexMusicSettings;
    private _username: string = '';
    private _password: string = '';
    private _rewindTime: number = 15;

    private workspaceSettingsChangedDisposable: Disposable;
    private onDidChangeSettingsHandlers: (() => any)[] = [];

    get username() {
        return this._username;
    }
    get password() {
        return this._password;
    }
    get rewindTime() {
        return this._rewindTime;
    }

    constructor() {
        this.workspaceSettingsChangedDisposable = workspace.onDidChangeConfiguration(() => {
            this.reload();

            for (let handler of this.onDidChangeSettingsHandlers) {
                handler();
            }
        });

        this.reload();
    }

    static getInstance(): YandexMusicSettings {
        return YandexMusicSettings.instance || (YandexMusicSettings.instance = new YandexMusicSettings());
    }

    onDidChangeSettings(handler: () => any): void {
        this.onDidChangeSettingsHandlers.push(handler);
    }

    dispose(): void {
        if (this.workspaceSettingsChangedDisposable) {
            this.workspaceSettingsChangedDisposable.dispose();
        }
    }

    updateUserName(newUserName: string) {
        workspace
            .getConfiguration("yandexMusic.credentials")
            .update("username", newUserName, ConfigurationTarget.Global);
    }

    updatePassword(newPassword: string) {
        workspace
            .getConfiguration("yandexMusic.credentials")
            .update("password", newPassword, ConfigurationTarget.Global);
    }

    private reload() {
        var configuration: WorkspaceConfiguration = workspace.getConfiguration("yandexMusic");

        this._username = configuration.get<string>("credentials.username")?.trim() || '';
        this._password = configuration.get<string>("credentials.password")?.trim() || '';
        this._rewindTime = configuration.get<number>("rewindTime") || 15;
    }
}