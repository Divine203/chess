const cvs = document.querySelector('canvas');
const ctx = cvs.getContext('2d');

let pieces;
let board;

const sprite = new Image();
sprite.src = './assets/chess_pieces.png';

const pawnsThatHaveMovedPastOnce = []; // [boardIndex...];
let whiteDangerSqrs = [];
let blackDangerSqrs = [];

let isWhiteRightCastleLegal = true;
let isWhiteLeftCastleLegal = true;
let isBlackRightCastleLegal = true;
let isBlackLeftCastleLegal = true;