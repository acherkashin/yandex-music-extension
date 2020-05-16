import { workspace, WorkspaceConfiguration, ConfigurationTarget, Disposable, Memento, UriHandler } from "vscode";
import { InitConfig } from "./yandexApi/yandexMusicApi";

//https://github.com/jlandersen/vscode-vsts-build-status/blob/389d6a816d53657d9c505f383371f3393bae3a85/src/settings.ts/
export class YandexMusicSettings {
    private static _instance: YandexMusicSettings;
    private state: Memento;
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

    get userId(): number | undefined {
        return this.state.get('uid');
    }
    set userId(userId: number | undefined) {
        this.state.update('uid', userId);
    }

    get accessToken(): string | undefined {
        return this.state.get('access_token');
    }
    set accessToken(value: string | undefined) {
        this.state.update('access_token', value);
    }

    get authConfig(): InitConfig {
        return {
            username: this.username,
            password: this.password,
            access_token: this.accessToken,
            uid: this.userId,
        };
    }

    constructor(state: Memento) {
        this.state = state;

        this.workspaceSettingsChangedDisposable = workspace.onDidChangeConfiguration(() => {
            this.reload();

            for (let handler of this.onDidChangeSettingsHandlers) {
                handler();
            }
        });

        this.reload();
    }

    static init(state: Memento) {
        YandexMusicSettings._instance = new YandexMusicSettings(state);
    }

    static get instance(): YandexMusicSettings {
        return YandexMusicSettings._instance;
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

    isAuthValid(): boolean {
        return !!this.username && !!this.password;
    }

    private reload() {
        var configuration: WorkspaceConfiguration = workspace.getConfiguration("yandexMusic");

        this._username = configuration.get<string>("credentials.username")?.trim() || '';
        this._password = configuration.get<string>("credentials.password")?.trim() || '';
        this._rewindTime = configuration.get<number>("rewindTime") || 15;
    }
}