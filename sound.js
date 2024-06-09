class Audio_ {
    constructor() {
        this.soundPath = './sound/'

        this.sound = {
            capture: {
                file: new Audio(`${this.soundPath}capture.mp3`),
                volume: 1
            },
            move: {
                file: new Audio(`${this.soundPath}move-self.mp3`),
                volume: 1
            },
            check: {
                file: new Audio(`${this.soundPath}move-check.mp3`),
                volume: 1
            },
            castle: {
                file: new Audio(`${this.soundPath}castle.mp3`),
                volume: 1
            },
            notify: {
                file: new Audio(`${this.soundPath}notify.mp3`),
                volume: 1
            }
        }
    }

    playAudio = (audio_file) => {
        audio_file.file.volume = audio_file.volume
        audio_file.file.play();
        if (!audio_file.file.ended || !audio_file.file.paused) {
            audio_file.file.currentTime = 0;
            audio_file.file.play();
        }
    }
}

let audio = new Audio_();

