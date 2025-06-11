class Stage {
  static initialize() {
    this.stageElement = document.getElementById("stage");
    this.stageElementWidth = Config.puyoImgWidth * Config.stageCols;
    this.stageElementSideMargin = (window.innerWidth - this.stageElementWidth) / 2.0;
    this.stageElementHeight = Config.puyoImgHeight * Config.stageRows;
    this.stageElement.style.width = `${this.stageElementWidth}px`;
    this.stageElement.style.height = `${this.stageElementHeight}px`;
    this.stageElement.style.left = `${this.stageElementSideMargin}px`;
    this.zenkeshiImage = new Image();
    Game.loadImg('img/zenkeshi.png', this.zenkeshiImage, () => {
      this.zenkeshiImage.width = Config.puyoImgWidth * 6;
      this.zenkeshiImage.style.position = 'absolute';
      this.zenkeshiImage.style.display = 'none';
    });
    this.stageElement.appendChild(Stage.zenkeshiImage);
    this.scoreElement = document.getElementById("score");
    this.scoreElement.style.width = `${this.stageElementWidth}px`;
    this.scoreElement.style.top = `${this.stageElementHeight}px`;
    this.scoreElement.style.left = `${this.stageElementSideMargin}px`;
    this.scoreElement.style.height = `${Config.fontHeight}px`;
    this.nextPuyosElement = document.getElementById("nextPuyos");
    this.nextPuyosElement.style.position = 'absolute';
    this.nextPuyosElement.style.top = '0px';
    this.nextPuyosElement.style.left = `${(window.innerWidth + this.stageElementWidth) / 2.0}px`;
    if (this.stageElementSideMargin > Config.puyoImgWidth) {
      this.nextPuyosWidth = Config.puyoImgWidth;
      this.nextPuyosHeight = Config.puyoImgHeight;
    } else {
      this.nextPuyosWidth = this.stageElementSideMargin;
      this.nextPuyosHeight = (this.nextPuyosWidth / Config.puyoImgWidth) * Config.puyoImgHeight;
    }
    this.serverConnectionElement = document.getElementById("serverConnection");
    this.serverConnectionElement.src = "img/connectServer.jpg";
    this.serverConnectionElementWidth = Config.puyoImgWidth * 3;
    if (this.serverConnectionElementWidth > this.stageElementSideMargin) {
      this.serverConnectionElementWidth = this.stageElementSideMargin;
    }
    this.serverConnectionElementSideMargin = this.stageElementSideMargin - this.serverConnectionElementWidth;
    this.serverConnectionElement.style.width = `${this.serverConnectionElementWidth}px`;
    this.serverConnectionElement.style.position = "absolute";
    this.serverConnectionElement.style.top = "0px";
    this.serverConnectionElement.style.left = `${this.serverConnectionElementSideMargin}px`;
    this.rivalPuyoWidth = this.serverConnectionElementWidth / Config.stageCols;
    this.rivalPuyoHeight = (this.rivalPuyoWidth / Config.puyoImgWidth) * Config.puyoImgHeight;
    this.rivalBoardElement = document.getElementById("rivalBoard");
    this.rivalBoardElementWidth = this.serverConnectionElementWidth;
    this.rivalBoardElementHeight = this.rivalPuyoHeight * Config.stageRows;
    this.rivalBoardElementSideMargin = this.serverConnectionElementSideMargin;
    this.rivalBoardElement.style.position = "absolute";
    this.rivalBoardElement.style.top = `${this.serverConnectionElement.clientHeight}px`;
    this.rivalBoardElement.style.left = `${this.rivalBoardElementSideMargin}px`;
    this.rivalBoardElement.style.width = `${this.rivalBoardElementWidth}px`;
    this.rivalBoardElement.style.height = `${this.rivalBoardElementHeight}px`;
  }
  static start() {
    this.board = [];
    this.hiddenBoard = [];
    this.fallingPuyoList = [];
    this.erasingPuyoInfoList = [];
    this.puyoCount = 0;
    for (let y = 0; y < Config.stageRows; y++) {
      this.board.push([]);
      for (let x = 0; x < Config.stageCols; x++) {
        this.board[y].push(null);
      }
    }
    for (let x = 0; x < Config.stageCols; x++) {
      this.hiddenBoard.push(null);
    }
    while (this.stageElement.firstChild) {
      this.stageElement.removeChild(Stage.stageElement.firstChild);
    }
    while (this.rivalBoardElement.firstChild) {
      this.rivalBoardElement.removeChild(this.rivalBoardElement.firstChild);
    }
    if (Game.onlineBattle) {
      this.rivalBoardElement.style.display = "block";
      this.rivalBoardElement.style.position = "absolute";
      this.rivalBoardElement.style.top = `${this.serverConnectionElement.clientHeight}px`;
      this.rivalBoardElement.style.left = `${this.stageElementSideMargin - this.rivalBoardElementWidth}px`;
    }
  }
  static showOpponentUserBoard(board) {
    while (this.rivalBoardElement.firstChild) {
      this.rivalBoardElement.removeChild(this.rivalBoardElement.firstChild);
    }
    let rivalNameElement = document.createElement("p");
    rivalNameElement.innerHTML = Game.rivalName;
    rivalNameElement.style.position = "absolute";
    rivalNameElement.style.top = "0px";
    rivalNameElement.style.left = "0px";
    this.rivalBoardElement.appendChild(rivalNameElement);
    for (let y = 0; y < Config.stageRows; y++) {
      for (let x = 0; x < Config.stageCols; x++) {
        if (board[y * Config.stageCols + x] != 0) {
          let puyo = PuyoImage.getPuyo(parseInt(board[y * Config.stageCols + x]));
          puyo.style.position = 'absolute';
          puyo.style.top = `${y * this.rivalPuyoHeight}px`;
          puyo.style.left = `${x * this.rivalPuyoWidth}px`;
          puyo.style.width = `${this.rivalPuyoWidth}px`;
          puyo.style.height = `${this.rivalPuyoHeight}px`;
          this.rivalBoardElement.appendChild(puyo);
        }
      }
    }
  }
  static showNextPuyos() {
    while (this.nextPuyosElement.firstChild) {
      this.nextPuyosElement.removeChild(this.nextPuyosElement.firstChild);
    }
    for (let a = 0; a < Config.nextPuyosSetCount; a++) {
      this.nextPuyosElement.appendChild(PuyoImage.nextPuyosSet[a].movablePuyoElement);
      PuyoImage.nextPuyosSet[a].movablePuyoElement.width = this.nextPuyosWidth;
      PuyoImage.nextPuyosSet[a].movablePuyoElement.height = this.nextPuyosHeight;
      PuyoImage.nextPuyosSet[a].movablePuyoElement.style.position = 'sticky';
      PuyoImage.nextPuyosSet[a].movablePuyoElement.style.top = `${(a * 2.5 + 0.5) * this.nextPuyosHeight}px`
      this.nextPuyosElement.appendChild(PuyoImage.nextPuyosSet[a].centerPuyoElement);
      PuyoImage.nextPuyosSet[a].centerPuyoElement.width = this.nextPuyosWidth;
      PuyoImage.nextPuyosSet[a].centerPuyoElement.height = this.nextPuyosHeight;
      PuyoImage.nextPuyosSet[a].centerPuyoElement.style.position = 'sticky';
      PuyoImage.nextPuyosSet[a].centerPuyoElement.style.top = `${(a * 2.5 + 1.5) * this.nextPuyosHeight}px`
    }
    this.nextPuyosElement.style.width = `${this.nextPuyosWidth}px`;
    this.nextPuyosElement.style.height = `${this.nextPuyosHeight * 5.5}px`;
  }
  static setPuyo(x, y, puyo) {
    let puyoImage = PuyoImage.getPuyo(puyo);
    puyoImage.style.left = `${x * Config.puyoImgWidth}px`;
    puyoImage.style.top = `${y * Config.puyoImgHeight}px`;
    this.stageElement.appendChild(puyoImage);
    this.board[y][x] = {puyo: puyo, element: puyoImage};
    this.puyoCount = this.puyoCount + 1;
  }
  static setHiddenPuyo(x, puyo) {
    let puyoImage = PuyoImage.getPuyo(puyo);
    puyoImage.style.left = `${x * Config.puyoImgWidth}px`;
    puyoImage.style.top = `${-1 * Config.puyoImgHeight}px`;
    this.stageElement.appendChild(puyoImage);
    this.hiddenBoard[x] = {puyo: puyo, element: puyoImage};
    this.puyoCount = this.puyoCount + 1;
  }
  static checkFall() {
    this.fallingPuyoList.length = 0;
    let isFalling = false;
    for (let y = Config.stageRows - 2; y >= 0; y--) {
      let line = this.board[y];
      for (let x = 0; x < Config.stageCols; x++) {
        if (!this.board[y][x]) {
          continue;
        }
        if (!this.board[y + 1][x]) {
          let cell = this.board[y][x];
          this.board[y][x] = null;
          let dst = y;
          while (dst + 1 < Config.stageRows && this.board[dst + 1][x] == null) {
            dst = dst + 1;
          }
          this.board[dst][x] = cell;
          this.fallingPuyoList.push({
            element: cell.element,
            position: y * Config.puyoImgHeight,
            destination: dst * Config.puyoImgHeight,
            falling: true
          });
          isFalling = true;
        }
      }
      for (let x = 0; x < Config.stageCols; x++) {
        if (this.hiddenBoard[x]) {
          let dst = 0;
          while (dst < Config.stageRows && !this.board[dst][x]) {
            dst = dst + 1;
          }
          if (dst > 0) {
            this.board[dst - 1][x] = this.hiddenBoard[x];
            this.hiddenBoard[x] = null;
            this.fallingPuyoList.push({
              element: this.board[dst - 1][x].element,
              position: -1 * Config.puyoImgHeight,
              destination: (dst - 1) * Config.puyoImgHeight,
              falling: true
            });
          }
          isFalling = true;
        }
      }
    }
    return isFalling;
  }
  static fall() {
    let isFalling = false;
    for (let fallingPuyo of this.fallingPuyoList) {
      if (!fallingPuyo.falling) {
        continue;
      }
      let position = fallingPuyo.position + Config.freeFallingSpeed;
      if (position >= fallingPuyo.destination) {
        position = fallingPuyo.destination;
        fallingPuyo.falling = false;
      } else {
        isFalling = true;
      }
      fallingPuyo.position = position;
      fallingPuyo.element.style.top = `${position}px`;
    }
    return isFalling;
  }
  static checkErase(startFrame) {
    this.eraseStartFrame = startFrame;
    this.erasingPuyoInfoList.length = 0;
    let erasedPuyoColor = {};
    let sequencePuyoInfoList = [];
    let sequenceOjamaPuyoInfoList = [];
    let isSequenceOjamaPuyo = true;
    let existingPuyoInfoList = [];
    let checkSequentialPuyo = (x, y) => {
      if (!this.board[y][x] || this.board[y][x].puyo < 0) {
        return false;
      }
      let puyo = this.board[y][x].puyo;
      sequencePuyoInfoList.push({x: x, y: y, cell: this.board[y][x]});
      this.board[y][x] = null;
      let direction = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (let a = 0; a < direction.length; a++) {
        let dx = x + direction[a][0];
        let dy = y + direction[a][1];
        if (dx < 0 || dy < 0 || dx >= Config.stageCols || dy >= Config.stageRows) {
          continue;
        }
        if (!this.board[dy][dx]) {
          continue;
        } else if (this.board[dy][dx].puyo < 0) {
          isSequenceOjamaPuyo = true;
          for (let b = 0; b < sequenceOjamaPuyoInfoList.length; b++) {
            if (sequenceOjamaPuyoInfoList[b].x == dx && sequenceOjamaPuyoInfoList[b].y == dy) {
              isSequenceOjamaPuyo = false;
              break;
            }
          }
          if (isSequenceOjamaPuyo) {
            sequenceOjamaPuyoInfoList.push({x: dx, y: dy, cell: this.board[dy][dx]});
          }
          continue;
        } else if (this.board[dy][dx].puyo !== puyo) {
          continue;
        }
        checkSequentialPuyo(dx, dy);
      };
    };
    for (let y = 0; y < Config.stageRows; y++) {
      for (let x = 0; x < Config.stageCols; x++) {
        if (!this.board[y][x] || this.board[y][x].puyo < 0) {
          continue;
        }
        sequencePuyoInfoList.length = 0;
        sequenceOjamaPuyoInfoList.length = 0;
        let puyoColor = this.board[y][x] && this.board[y][x].puyo;
        checkSequentialPuyo(x, y);
        if (sequencePuyoInfoList.length < Config.erasePuyoCount) {
          if (sequencePuyoInfoList.length) {
            existingPuyoInfoList.push(...sequencePuyoInfoList);
          }
        } else {
          this.erasingPuyoInfoList.push(...sequencePuyoInfoList);
          for (let info of sequenceOjamaPuyoInfoList) {
            this.board[info.y][info.x] = null;
            this.erasingPuyoInfoList.push(info);
          }
          erasedPuyoColor[puyoColor] = true;
        }
      }
    }
    this.puyoCount = this.puyoCount - this.erasingPuyoInfoList.length;
    for (let info of existingPuyoInfoList) {
      this.board[info.y][info.x] = info.cell;
    }
    if (this.erasingPuyoInfoList.length) {
      return {piece: this.erasingPuyoInfoList.length, color: Object.keys(erasedPuyoColor).length};
    }
    return null;
  }
  static erasing(frame) {
    let elapsedFrame = frame - this.eraseStartFrame;
    let ratio = elapsedFrame / Config.eraseAnimationDuration;
    if (ratio > 1) {
      for (let info of this.erasingPuyoInfoList) {
        let element = info.cell.element;
        this.stageElement.removeChild(element);
      }
      return false;
    } else if (ratio > 0.75) {
      for (let info of this.erasingPuyoInfoList) {
        let element = info.cell.element;
        element.style.display = 'block';
      }
      return true;
    } else if (ratio > 0.50) {
      for (let info of this.erasingPuyoInfoList) {
        let element = info.cell.element;
        element.style.display = 'none';
      }
      return true;
    } else if (ratio > 0.25) {
      for (let info of this.erasingPuyoInfoList) {
        let element = info.cell.element;
        element.style.display = 'block';
      }
      return true;
    } else {
      for (let info of this.erasingPuyoInfoList) {
        let element = info.cell.element;
        element.style.display = 'none';
      }
      return true;
    }
  }
  static showZenkeshi() {
    this.zenkeshiImage.style.display = 'block';
    this.zenkeshiImage.style.opacity = '1';
    let startTime = Date.now();
    let startTop = Config.puyoImgHeight * Config.stageRows;
    let endTop = Config.puyoImgHeight * Config.stageRows / 3;
    let animation = () => {
      let ratio = Math.min((Date.now() - startTime) / Config.zenkeshiDuration, 1);
      this.zenkeshiImage.style.top = `${(endTop - startTop) * ratio + startTop}px`;
      if (ratio !== 1) {
        requestAnimationFrame(animation);
      }
    };
    animation();
  }
  static hideZenkeshi() {
    let startTime = Date.now();
    let animation = () => {
      let ratio = Math.min((Date.now() - startTime) / Config.zenkeshiDuration, 1);
      this.zenkeshiImage.style.opacity = String(1 - ratio);
      if (ratio !== 1) {
        requestAnimationFrame(animation);
      } else {
        this.zenkeshiImage.style.display = 'none';
      }
    };
    animation();
  }
}

