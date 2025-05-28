class Stage {
  static initialize() {
    this.stageElement = document.getElementById("stage");
    this.stageElement.style.width = `${Config.puyoImgWidth * Config.stageCols}px`;
    this.stageElement.style.height = `${Config.puyoImgHeight * Config.stageRows}px`;
    this.stageElement.style.backgroundColor = Config.stageBackgroundColor;
    this.zenkeshiImage = new Image();
    Game.loadImg('img/zenkeshi.png', this.zenkeshiImage, () => {
      this.zenkeshiImage.width = Config.puyoImgWidth * 6;
      this.zenkeshiImage.style.position = 'absolute';
      this.zenkeshiImage.style.display = 'none';
    });
    this.stageElement.appendChild(Stage.zenkeshiImage);
    this.scoreElement = document.getElementById("score");
    this.scoreElement.style.backgroundColor = Config.scoreBackgroundColor;
    this.scoreElement.style.top = `${Config.puyoImgHeight * Config.stageRows}px`;
    this.scoreElement.style.width = `${Config.puyoImgWidth * Config.stageCols}px`;
    this.scoreElement.style.height = `${Config.fontHeight}px`;
    this.nextPuyosElement = document.getElementById("nextPuyos");
    this.nextPuyosElement.style.position = 'absolute';
    this.nextPuyosElement.style.top = '0px';
    this.nextPuyosElement.style.left = `${(document.body.clientWidth + (Config.puyoImgWidth * Config.stageCols)) / 2}px`
    this.board = [];
    this.hiddenBoard = [];
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
  }
  static showNextPuyos() {
    while (this.nextPuyosElement.firstChild) {
      this.nextPuyosElement.removeChild(this.nextPuyosElement.firstChild);
    }
    for (let a = 0; a < Config.nextPuyosSetCount; a++) {
      this.nextPuyosElement.appendChild(PuyoImage.nextPuyosSet[a].movablePuyoElement);
      PuyoImage.nextPuyosSet[a].movablePuyoElement.style.position = 'fixed';
      PuyoImage.nextPuyosSet[a].movablePuyoElement.style.top = `${(a * 3 + 0) * Config.puyoImgHeight}px`
      this.nextPuyosElement.appendChild(PuyoImage.nextPuyosSet[a].centerPuyoElement);
      PuyoImage.nextPuyosSet[a].centerPuyoElement.style.position = 'fixed';
      PuyoImage.nextPuyosSet[a].centerPuyoElement.style.top = `${(a * 3 + 1) * Config.puyoImgHeight}px`
    }
  }
  static setPuyo(x, y, puyo) {
    let puyoImage = PuyoImage.getPuyo(puyo);
    puyoImage.style.left = `${x * Config.puyoImgWidth}px`;
    puyoImage.style.top = `${y * Config.puyoImgHeight}px`;
    this.stageElement.appendChild(puyoImage);
    this.board[y][x] = {puyo: puyo, element: puyoImage};
  }
  static setHiddenPuyo(x, puyo) {
    let puyoImage = PuyoImage.getPuyo(puyo);
    puyoImage.style.left = `${x * Config.puyoImgWidth}px`;
    puyoImage.style.top = `${-1 * Config.puyoImgHeight}px`;
    this.stageElement.appendChild(puyoImage);
    this.hiddenBoard[x] = {puyo: puyo, element: puyoImage};
  }
  static checkFall() {
    this.fallingPuyoList.length = 0;
    let isFalling = false;
    for (let y = Config.stageRows - 2; y >= 0; y--) {
      let line = this.board[y];
      for (let x = 0; x < line.length; x++) {
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
          while (dst < Config.stageRows && this.board[dst][x] == null) {
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
    let existingPuyoInfoList = [];
    let checkSequentialPuyo = (x, y) => {
      let orig = this.board[y][x];
      if (!orig) {
        return;
      }
      let puyo = this.board[y][x].puyo;
      sequencePuyoInfoList.push({x: x, y: y, cell: this.board[y][x]});
      this.board[y][x] = null;
      let direction = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (let i = 0; i < direction.length; i++) {
        let dx = x + direction[i][0];
        let dy = y + direction[i][1];
        if (dx < 0 || dy < 0 || dx >= Config.stageCols || dy >= Config.stageRows) {
          continue;
        }
        let cell = this.board[dy][dx];
        if (!cell || cell.puyo !== puyo) {
          continue;
        }
        checkSequentialPuyo(dx, dy);
      };
    };
    for (let y = 0; y < Config.stageRows; y++) {
      for (let x = 0; x < Config.stageCols; x++) {
        sequencePuyoInfoList.length = 0;
        let puyoColor = this.board[y][x] && this.board[y][x].puyo;
        checkSequentialPuyo(x, y);
        if (sequencePuyoInfoList.length == 0 || sequencePuyoInfoList.length < Config.erasePuyoCount) {
          if (sequencePuyoInfoList.length) {
            existingPuyoInfoList.push(...sequencePuyoInfoList);
          }
        } else {
          this.erasingPuyoInfoList.push(...sequencePuyoInfoList);
          erasedPuyoColor[puyoColor] = true;
        }
      }
    }
    this.puyoCount -= this.erasingPuyoInfoList.length;
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
Stage.fallingPuyoList = [];
Stage.erasingPuyoInfoList = [];

