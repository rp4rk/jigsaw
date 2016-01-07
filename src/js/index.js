/**
 * Using ES6 would usually assume the target JS engine supports it.
 * This project uses Babel to transpile from ES6 -> ES5
 * A class based approach lends itself to easy configuration and multiple instances.
 */
class PuzzleBoard {
  constructor({board, tray, rows, columns, image}) {
    this.board = $(board);
    this.boardSelector = board;
    this.tray = $(tray);
    this.rows = rows;
    this.columns = columns;
    this.slots = [];
    this.pieces = [];

    // Promise for image load
    let imageLoad = new Promise(
      (resolve, reject) => {
        let img = new Image();
        img.onload = () => {
          image = {
            src: image,
            height: img.height,
            width: img.width
          }
          resolve(image);
        };
        img.src = image;
      }
    );

    imageLoad.then(
      val => {
        this.image = val;
        this.board.width(`${this.image.width}px`);
        this.board.height(`${this.image.height}px`);
        this.initPuzzle();
      }
    )
  }

  /**
   * Functionally identical to iterating over a 2 dimensional array
   * This project uses Babel to transpile from ES6 -> ES5
   */
  initPuzzle() {
    let i;
    let j;
    let id = 0;
    for (i=0; i<this.rows; i++) {
      if (i !== 0)
          id++;
      for (j=0; j<this.columns; j++) {
        if (j !== 0)
          id++;

        let slot = $(`<div data-id="${id}" class="puzzle-slot slot-${j}-${i}"></div>`);
        let piece = $(`<div data-id="${id}" class="puzzle-piece animate-zoom"></div>`);
        this.board.append(slot);
        this.tray.append(piece);
        let elWidth = this.board.width()/this.columns;
        let elHeight = this.board.height()/this.rows;

        // Add to board slot array
        this.slots.push(
          new PuzzleSlot({
            id: id,
            element: slot,
            width: elWidth,
            height: elHeight,
          })
        );

        // Add to board pieces array
        this.pieces.push(
          new PuzzlePiece({
            id: id,
            element: piece,
            width: elWidth,
            height: elHeight,
            image: this.image.src,
            offsetx: -elWidth*j,
            offsety: -elHeight*i,
            board: this
          })
        );
      }
    }

    // Shuffle the tray when we're done initializing
    this.shuffleTray();
  }

  shuffleTray() {
    this.tray.find('.puzzle-piece').sort(function(){
      return Math.random() - 0.5;
    }).detach().appendTo(this.tray);
  }

  /**
   * Check all pieces to see if they match
   * This is called from the 'drop' event of each piece
   * Each individual puzzle piece will flag itself as matching if dropped correctly
   * This means we don't need to check all the pieces constantly.
   */
  checkAll() {
    let checkPieces = this.pieces.filter(piece => {
      return piece.isMatching == false;
    });

    // We've won!
    if (checkPieces.length === 0) {
      $('html, body').animate({scrollLeft: $(".winner").offset().left }, 300);
      $('button').attr("disabled", true);
    }
  }
}

// PuzzleSlot object, attached to each slot
class PuzzleSlot {
  constructor({id, element, width, height}) {
    this.id = id;
    this.element = element;
    this.width = width;
    this.height = height;
    this.setSlotSize();
  }

  // Set the slot size
  setSlotSize() {
    this.element.outerWidth(`${this.width}px`);
    this.element.outerHeight(`${this.height}px`);
  }
}

/**
 * Each puzzle piece uses a background-image offset and fixed size to simulate being sliced
 * A piece detects which slot it is snapped to by comparing boundaries, with a small give to allow for minor inaccuracies
 * This saves manual slicing or using libraries such as imagemagick on a server to automate slicing.
 * It also means the same image can be a variety of difficulties, just by increasing row and column count.
 * It would also allow for SVG masking for a 'jigsaw' style if needed.
 * '.draggable' is provided by jQuery UI
 */
class PuzzlePiece {
  constructor({id, element, width, height, image, offsetx, offsety, board}) {
    this.id = id;
    this.element = element;
    this.width = width;
    this.height = height;
    this.image = image;
    this.offsetx = offsetx;
    this.offsety = offsety;
    this.board = board;
    this.isMatching = false;

    /**
     * Enable drag and drop functionality, flag matches.
     * We can ensure only this puzzle's pieces and slots are being matched by checking the tray.
     */
    let boardSelector = this.board.boardSelector;
    $(this.element).draggable({
      snap: ".puzzle-slot",
      snapMode: "inner",
      stop: function(event, ui) {
        let id = $(this).attr('data-id');
        let piece = $(this);
        let slot = $(`${boardSelector} div[data-id=${id}]`);
        let pieceRect = piece[0].getBoundingClientRect();
        let slotRect = slot[0].getBoundingClientRect();
        let margin = 20;

        if (pieceRect.top >= slotRect.top-margin
            && pieceRect.top <= slotRect.top+margin
            && pieceRect.left >= slotRect.left-margin
            && pieceRect.left <= slotRect.left+margin) {
          isMatch(true)
        } else {
          isMatch(false)
        }
      }
    }).mousedown(function(e) {
      $(this)
        .css({
          "position" : "absolute"
        })
        .removeClass('animate-zoom');
    }).mouseleave(function(e) {
      $(this)
        .addClass('animate-zoom');
    });

    // Called when a match is found
    let isMatch = match => {
      this.isMatching = match;
      this.board.checkAll();
    };

    // Set size and background
    this.setPieceSize();
    this.setBackground();
  }

  // Set the piece size
  setPieceSize() {
    this.element.outerWidth(`${this.width}px`);
    this.element.outerHeight(`${this.height}px`);
  }

  // Set the background image and offset
  setBackground() {
    this.element.css({
      "background-image": `url('${this.image}')`,
      "background-position": `${this.offsetx}px ${this.offsety}px`
    });
  }
}

/**
 * Bootstrap the puzzle and UI buttons
 * The class-based approach allows for easy configurability and multiple instances
 * For example, an array of JSON objects could be used to easily create x puzzles.
 */
$(document).ready(() => {
  let mainPuzzle = new PuzzleBoard({
   board: '.puzzle-board',
   tray: '.tray',
   rows: 3,
   columns: 3,
   image: "http://lorempixel.com/500/500/"
  });

  $('.btnPlay').click(e => {
    $('html, body').animate({scrollLeft: $(".puzzle").offset().left }, 300);
  });

  $('.btnHowTo').click(e => {
    $('html, body').animate({scrollLeft: 0 }, 300);
  })

});

// Fix scroll
$(window).on('beforeunload', function() {
    $('html, body').animate({scrollLeft: 0 }, 0);
});
