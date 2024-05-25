class Board {
    constructor () {

        this.boardArr = new Array(64).fill(0) // an array of 64, 0s
        
        this.init()
    }

    // Assigning pieces to starting squares
    init() {
    //    this.boardArr[0] = 'bR'
    //    this.boardArr[1] = 'bN'
    //    this.boardArr[2] = 'bB'
    //    this.boardArr[3] = 'bQ'
    //    this.boardArr[4] = 'bK'
    //    this.boardArr[5] = 'bB'
    //    this.boardArr[6] = 'bN'
    //    this.boardArr[7] = 'bR'
    //    this.boardArr[8] = 'bP'
    //    this.boardArr[9] = 'bP'
    //    this.boardArr[10] = 'bP'
    //    this.boardArr[11] = 'bP'
    //    this.boardArr[12] = 'bP'
    //    this.boardArr[13] = 'bP'
    //    this.boardArr[14] = 'bP'
    //    this.boardArr[15] = 'bP'

    //    this.boardArr[48] = 'wP'
    //    this.boardArr[49] = 'wP'
    //    this.boardArr[50] = 'wP'
    //    this.boardArr[51] = 'wP'
    //    this.boardArr[52] = 'wP'
    //    this.boardArr[53] = 'wP'
    //    this.boardArr[54] = 'wP'
    //    this.boardArr[55] = 'wP'
    //    this.boardArr[56] = 'wR'
    //    this.boardArr[57] = 'wN'
    //    this.boardArr[58] = 'wB'
    //    this.boardArr[59] = 'wQ'
    //    this.boardArr[60] = 'wK'
    //    this.boardArr[61] = 'wB'
    //    this.boardArr[62] = 'wN'
    //    this.boardArr[63] = 'wR'

    this.boardArr[30] = 'bK'
    this.boardArr[25] = 'wK'
    this.boardArr[7] = 'bB'
    this.boardArr[0] = 'wB'
    this.boardArr[54] = 'bN'
    this.boardArr[11] = 'wN'
    this.boardArr[27] = 'bR'
    this.boardArr[28] = 'bQ'
    this.boardArr[51] = 'bP'
    this.boardArr[49] = 'wP'
    }
}

board = new Board()
