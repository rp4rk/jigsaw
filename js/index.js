'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Using ES6 would usually assume the target JS engine supports it.
 * This project uses Babel to transpile from ES6 -> ES5
 * A class based approach lends itself to easy configuration and multiple instances.
 */

var PuzzleBoard = function () {
  function PuzzleBoard(_ref) {
    var _this = this;

    var board = _ref.board;
    var tray = _ref.tray;
    var rows = _ref.rows;
    var columns = _ref.columns;
    var image = _ref.image;

    _classCallCheck(this, PuzzleBoard);

    this.board = $(board);
    this.boardSelector = board;
    this.tray = $(tray);
    this.rows = rows;
    this.columns = columns;
    this.slots = [];
    this.pieces = [];

    // Promise for image load
    var imageLoad = new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        image = {
          src: image,
          height: img.height,
          width: img.width
        };
        resolve(image);
      };
      img.src = image;
    });

    imageLoad.then(function (val) {
      _this.image = val;
      _this.board.width(_this.image.width + 'px');
      _this.board.height(_this.image.height + 'px');
      _this.initPuzzle();
    });
  }

  /**
   * Functionally identical to iterating over a 2 dimensional array
   * This project uses Babel to transpile from ES6 -> ES5
   */

  _createClass(PuzzleBoard, [{
    key: 'initPuzzle',
    value: function initPuzzle() {
      var i = undefined;
      var j = undefined;
      var id = 0;
      for (i = 0; i < this.rows; i++) {
        if (i !== 0) id++;
        for (j = 0; j < this.columns; j++) {
          if (j !== 0) id++;

          var slot = $('<div data-id="' + id + '" class="puzzle-slot slot-' + j + '-' + i + '"></div>');
          var piece = $('<div data-id="' + id + '" class="puzzle-piece animate-zoom"></div>');
          this.board.append(slot);
          this.tray.append(piece);
          var elWidth = this.board.width() / this.columns;
          var elHeight = this.board.height() / this.rows;

          // Add to board slot array
          this.slots.push(new PuzzleSlot({
            id: id,
            element: slot,
            width: elWidth,
            height: elHeight
          }));

          // Add to board pieces array
          this.pieces.push(new PuzzlePiece({
            id: id,
            element: piece,
            width: elWidth,
            height: elHeight,
            image: this.image.src,
            offsetx: -elWidth * j,
            offsety: -elHeight * i,
            board: this
          }));
        }
      }

      // Shuffle the tray when we're done initializing
      this.shuffleTray();
    }
  }, {
    key: 'shuffleTray',
    value: function shuffleTray() {
      this.tray.find('.puzzle-piece').sort(function () {
        return Math.random() - 0.5;
      }).detach().appendTo(this.tray);
    }

    /**
     * Check all pieces to see if they match
     * This is called from the 'drop' event of each piece
     * Each individual puzzle piece will flag itself as matching if dropped correctly
     * This means we don't need to check all the pieces constantly.
     */

  }, {
    key: 'checkAll',
    value: function checkAll() {
      var checkPieces = this.pieces.filter(function (piece) {
        return piece.isMatching == false;
      });

      // We've won!
      if (checkPieces.length === 0) {
        $('html, body').animate({ scrollLeft: $(".winner").offset().left }, 300);
        $('button').attr("disabled", true);
      }
    }
  }]);

  return PuzzleBoard;
}();

// PuzzleSlot object, attached to each slot

var PuzzleSlot = function () {
  function PuzzleSlot(_ref2) {
    var id = _ref2.id;
    var element = _ref2.element;
    var width = _ref2.width;
    var height = _ref2.height;

    _classCallCheck(this, PuzzleSlot);

    this.id = id;
    this.element = element;
    this.width = width;
    this.height = height;
    this.setSlotSize();
  }

  // Set the slot size

  _createClass(PuzzleSlot, [{
    key: 'setSlotSize',
    value: function setSlotSize() {
      this.element.outerWidth(this.width + 'px');
      this.element.outerHeight(this.height + 'px');
    }
  }]);

  return PuzzleSlot;
}();

/**
 * Each puzzle piece uses a background-image offset and fixed size to simulate being sliced
 * A piece detects which slot it is snapped to by comparing boundaries, with a small give to allow for minor inaccuracies
 * This saves manual slicing or using libraries such as imagemagick on a server to automate slicing.
 * It also means the same image can be a variety of difficulties, just by increasing row and column count.
 * It would also allow for SVG masking for a 'jigsaw' style if needed.
 * '.draggable' is provided by jQuery UI
 */

var PuzzlePiece = function () {
  function PuzzlePiece(_ref3) {
    var _this2 = this;

    var id = _ref3.id;
    var element = _ref3.element;
    var width = _ref3.width;
    var height = _ref3.height;
    var image = _ref3.image;
    var offsetx = _ref3.offsetx;
    var offsety = _ref3.offsety;
    var board = _ref3.board;

    _classCallCheck(this, PuzzlePiece);

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
    var boardSelector = this.board.boardSelector;
    $(this.element).draggable({
      snap: ".puzzle-slot",
      snapMode: "inner",
      stop: function stop(event, ui) {
        var id = $(this).attr('data-id');
        var piece = $(this);
        var slot = $(boardSelector + ' div[data-id=' + id + ']');
        var pieceRect = piece[0].getBoundingClientRect();
        var slotRect = slot[0].getBoundingClientRect();
        var margin = 20;

        if (pieceRect.top >= slotRect.top - margin && pieceRect.top <= slotRect.top + margin && pieceRect.left >= slotRect.left - margin && pieceRect.left <= slotRect.left + margin) {
          isMatch(true);
        } else {
          isMatch(false);
        }
      }
    }).mousedown(function (e) {
      $(this).css({
        "position": "absolute"
      }).removeClass('animate-zoom');
    }).mouseleave(function (e) {
      $(this).addClass('animate-zoom');
    });

    // Called when a match is found
    var isMatch = function isMatch(match) {
      _this2.isMatching = match;
      _this2.board.checkAll();
    };

    // Set size and background
    this.setPieceSize();
    this.setBackground();
  }

  // Set the piece size

  _createClass(PuzzlePiece, [{
    key: 'setPieceSize',
    value: function setPieceSize() {
      this.element.outerWidth(this.width + 'px');
      this.element.outerHeight(this.height + 'px');
    }

    // Set the background image and offset

  }, {
    key: 'setBackground',
    value: function setBackground() {
      this.element.css({
        "background-image": 'url(\'' + this.image + '\')',
        "background-position": this.offsetx + 'px ' + this.offsety + 'px'
      });
    }
  }]);

  return PuzzlePiece;
}();

/**
 * Bootstrap the puzzle and UI buttons
 * The class-based approach allows for easy configurability and multiple instances
 * For example, an array of JSON objects could be used to easily create x puzzles.
 */

$(document).ready(function () {
  var mainPuzzle = new PuzzleBoard({
    board: '.puzzle-board',
    tray: '.tray',
    rows: 3,
    columns: 3,
    image: "http://lorempixel.com/500/500/"
  });

  $('.btnPlay').click(function (e) {
    $('html, body').animate({ scrollLeft: $(".puzzle").offset().left }, 300);
  });

  $('.btnHowTo').click(function (e) {
    $('html, body').animate({ scrollLeft: 0 }, 300);
  });
});

// Fix scroll
$(window).on('beforeunload', function () {
  $('html, body').animate({ scrollLeft: 0 }, 0);
});