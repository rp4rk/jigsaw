// Classes
class PuzzleBoard {
  // Construct the puzzle
  constructor({board, tray, rows, columns, image}) {
    this.board = $(board);
    this.tray = $(tray);
    this.rows = rows;
    this.columns = columns;
    this.slots = [];
    this.pieces = [];
    
    // Promise for image load
    let imageLoad = new Promise(
      (resolve, reject) => {
        // Get image statistics
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
  
  // Get total slots
  getSlotCount() {
    return this.columns*this.rows;
  }
  
  // Create slots and pieces
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
        // Create Divs
        let slot = $(`<div data-id="${id}" class="puzzle-slot slot-${j}-${i}"></div>`);
        let piece = $(`<div data-id="${id}" class="puzzle-piece animate-zoom"></div>`);
        this.board.append(slot);
        this.tray.append(piece);
        var elWidth = this.board.width()/this.columns;
        var elHeight = this.board.height()/this.rows;
        
        // Add to slots
        this.slots.push(
          new PuzzleSlot({
            id: id,
            element: slot,
            width: elWidth,
            height: elHeight,
          })
        );      
        
        // Add to pieces
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
    
    // Shuffle the tray when we're done
    this.shuffleTray();
  }
  
  // Shuffle the tray
  shuffleTray() {
    this.tray.find('.puzzle-piece').sort(function(){
      return Math.random() - 0.5;
    }).detach().appendTo(this.tray);
  }
  
  // Check all the pieces to see if they match
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

// PuzzlePiece object, attached to each piece
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
        
    // Enable drag and drop functionality, flag matches
    $(this.element).draggable({
      snap: ".puzzle-slot",
      snapMode: "inner",
      stop: function(event, ui) {
        let id = $(this).attr('data-id');
        let matching = $(`div[data-id=${id}]`);
        let elem1Rect = matching[0].getBoundingClientRect();
        let elem2Rect = matching[1].getBoundingClientRect();
        let margin = 20;
        
        // TODO: make less ugly
        if (elem1Rect.top >= elem2Rect.top-margin 
            && elem1Rect.top <= elem2Rect.top+margin
            && elem1Rect.left >= elem2Rect.left-margin 
            && elem1Rect.left <= elem2Rect.left+margin) {
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
    var isMatch = match => {
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

// Bootstrap
$(document).ready(() => {  
  let mainPuzzle = new PuzzleBoard({
   board: '.puzzle-board',
   tray: '.tray',
   rows: 2,
   columns: 2,
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