# [Yandex Music Extension](https://marketplace.visualstudio.com/items?itemName=acherkashin.yandex-music-extension)

![Visual Studio Code loves Yandex Music](images/vs-loves-yandex-music.png)

Extension allows you enjoy listening to YandexMusic right in your favorite code editor.

## Requirements

To use this extension you should have Yandex Music account.

## Extension Settings

This extension contributes the following settings:

- `yandexMusic.credentials.username` - Yandex Music user name
- `yandexMusic.credentials.password` - Yandex Music password
- `yandexMusic.rewindTime` - Rewind time (optional, by default is 15s)

```json
{
    "yandexMusic.credentials.username": "example@yandex.ru",
    "yandexMusic.credentials.password": "12345",
    "yandexMusic.rewindTime": 15
}
```

## Keyboard Shortcuts

- `Shift + Alt + P` - Play/pause track
- `Shift + Alt + N` - Play next track
- `Shift + Alt + B` - Play previous track
- `Shift + Alt + Y`, `Shift + Alt + M` - Open Yandex Music extension bar

## Contributing

You can open an issue on a GitHub page or contact me at cherkalexander@gmail.com with any additional questions or feedback.

## Known issues

- Only Windows is currently supported 🙄
- ...

## Support
You can subscribe to [the author's telegram channel](https://t.me/cherkashindev) to support and motivate the author.

## Running locally

1. Ensure you have locally installed `nodejs` and `npm`.
2. Ensure you have locally installed `yarn` as it is used as package manager for this project.
3. Run `yarn install` in your terminal;
4. Open Visual Studio Code and press `F5`.
