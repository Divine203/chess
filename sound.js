class Audio_ {
    constructor() {
        this.soundPath = './sound/';
        this.sound = {
            capture: { file: new Audio(`${this.soundPath}capture.mp3`), volume: 1 },
            move: { file: new Audio(`${this.soundPath}move-self.mp3`), volume: 1 },
            check: { file: new Audio(`${this.soundPath}move-check.mp3`), volume: 1 },
            castle: { file: new Audio(`${this.soundPath}castle.mp3`), volume: 1 },
            notify: { file: new Audio(`${this.soundPath}notify.mp3`), volume: 1 }
        };
    }

    playAudio(audioFile) {
        if (!audioFile?.file) return;

        const file = audioFile.file;
        file.volume = Math.max(0, Math.min(1, Number(audioFile.volume) || 0));
        file.currentTime = 0;

        const playback = file.play();
        if (playback?.catch) playback.catch(() => {});
    }
}

let audio = new Audio_();
