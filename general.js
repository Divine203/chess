const cvs = document.querySelector('canvas')
const ctx = cvs.getContext('2d')

let pieces;
let board;

const sprite = new Image()
sprite.src = './assets/chess_pieces.png'