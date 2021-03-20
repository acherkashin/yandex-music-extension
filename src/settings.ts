import { workspace, WorkspaceConfiguration, Disposable, ConfigurationChangeEvent, SecretStorage, ExtensionContext, window, commands } from "vscode";
import { showLoginBox, showPasswordBox } from "./inputs";
import { YandexMusicApi } from "./yandexApi/yandexMusicApi";

export type YandexMusicSettingsChangedCallback = (e: ConfigurationChangeEvent) => void;

export interface IYandexMusicAuthData {
    userId: number;
    token: string;
    userName: string;
}

//https://github.com/jlandersen/vscode-vsts-build-status/blob/389d6a816d53657d9c505f383371f3393bae3a85/src/settings.ts/
export class YandexMusicSettings {
    private _yandexMusicKey = 'yandex-music-key';
    private static _instance: YandexMusicSettings;
    private api: YandexMusicApi;
    private storage: SecretStorage;
    private _rewindTime: number = 15;

    private workspaceSettingsChangedDisposable: Disposable;
    private onDidChangeSettingsHandlers: YandexMusicSettingsChangedCallback[] = [];

    get rewindTime() {
        return this._rewindTime;
    }

    async getAuthData() {
        var authDataString = await this.storage.get(this._yandexMusicKey);
        if (authDataString != null) {
            return JSON.parse(authDataString) as IYandexMusicAuthData;
        }
    }

    constructor(storage: SecretStorage, api: YandexMusicApi) {
        this.storage = storage;
        this.api = api;

        this.workspaceSettingsChangedDisposable = workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration("yandexMusic.rewindTime")) {
                this.invalidateRewindTime();

                for (const handler of this.onDidChangeSettingsHandlers) {
                    handler(e);
                }
            }
        });

        this.invalidateRewindTime();
    }

    static init(context: ExtensionContext, api: YandexMusicApi) {
        YandexMusicSettings._instance = new YandexMusicSettings(context.secrets, api);
    }

    static get instance(): YandexMusicSettings {
        return YandexMusicSettings._instance;
    }

    onDidChangeSettings(handler: YandexMusicSettingsChangedCallback): void {
        this.onDidChangeSettingsHandlers.push(handler);
    }

    dispose(): void {
        if (this.workspaceSettingsChangedDisposable) {
            this.workspaceSettingsChangedDisposable.dispose();
        }
    }

    async signIn() {
        const userName = await showLoginBox();
        if (!userName) {
            return;
        }

        const password = await showPasswordBox();
        if (!password) {
            return;
        }
        try {
            const responce = await this.api.authenticate({ username: userName, password });
            const authData: IYandexMusicAuthData = {
                userId: responce.data.uid,
                token: responce.data.access_token,
                userName
            };
            this.storage.store(this._yandexMusicKey, JSON.stringify(authData));
    
        } catch (e) {
            window
                .showErrorMessage("Не удалось войти в Yandex аккаунт. Проверьте правильность логина и пароля.", "Изменить логин и пароль")
                .then((a) => {
                    if(a) {
                        commands.executeCommand("yandexMusic.signIn");
                    }
                });
            console.error(e);
        }
    }

    async signOut() {
        await this.storage.delete(this._yandexMusicKey);
    }

    private invalidateRewindTime() {
        var configuration: WorkspaceConfiguration = workspace.getConfiguration("yandexMusic");
        this._rewindTime = configuration.get<number>("rewindTime") || 15;
    }
}