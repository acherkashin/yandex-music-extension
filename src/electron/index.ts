const { ipcRenderer } = require('electron');

var window: any;
var Audio: any;

let audio = new Audio();

window.onload = () => {
    ipcRenderer.on('playAudio', (event, ...args) => {
        if (audio) {
            audio.src = args[0];
        } else {
            audio = new Audio(args[0]);
        }
        
        audio.play();

        // console.log(args);
    });
};
