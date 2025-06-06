class Player {
  static initialize () {
    this.keyStatus = {right: false, left: false, up: false, down: false, space: false, esc: false, x: false, z: false};
    document.addEventListener('keydown', this.keyDownEvent);
    document.addEventListener('keyup', this.keyUpEvent);
    this.touchPoint = {sx: 0, sy: 0, ex: 0, ey: 0};
    document.addEventListener('touchstart', this.touchStartEvent);
    document.addEventListener('touchmove', this.touchMoveEvent);
    document.addEventListener('touchend', this.touchEndEvent);
  }
  static keyDownEvent(e) {
    e.preventDefault();
    if (e.code == 'ArrowLeft') {
      Player.keyStatus.left = true;
    } else if (e.code == "ArrowUp") {
      Player.keyStatus.up = true;
    } else if (e.code == "ArrowRight") {
      Player.keyStatus.right = true;
    } else if (e.code == "ArrowDown") {
      Player.keyStatus.down = true;
    } else if (e.code == "Space") {
      Player.keyStatus.space = true;
    } else if (e.code == "Escape") {
      Player.keyStatus.esc = true;
    } else if (e.code == "KeyX") {
      Player.keyStatus.x = true;
    } else if (e.code == "KeyZ") {
      Player.keyStatus.z = true;
    }
    return false;
  }
  static keyUpEvent(e) {
    e.preventDefault();
    if (e.code == "ArrowLeft") {
      Player.keyStatus.left = false;
    } else if (e.code == "ArrowUp") {
      Player.keyStatus.up = false;
    } else if (e.code == "ArrowRight") {
      Player.keyStatus.right = false;
    } else if (e.code == "ArrowDown") {
      Player.keyStatus.down = false;
    } else if (e.code == "Space") {
      Player.keyStatus.space = false;
    } else if (e.code == "Escape") {
      Player.keyStatus.esc = false;
    } else if (e.code == "KeyX") {
      Player.keyStatus.x = false;
    } else if (e.code == "KeyZ") {
      Player.keyStatus.z = false;
    }
    return false;
  }
  static touchStartEvent(e) {
    Player.touchPoint.sx = e.touches[0].clientX;
    Player.touchPoint.sy = e.touches[0].clientY;
  }
  static touchMoveEvent(e) {
    let dx = e.touches[0].clientX - Player.touchPoint.sx;
    let dy = e.touches[0].clientY - Player.touchPoint.sy;
    let absdx = Math.abs(dx);
    let absdy = Math.abs(dy);
    if (absdx > 20 || absdy > 20) {
      Player.touchPoint.ex = e.touches[0].clientX
      Player.touchPoint.ey = e.touches[0].clientY
      let horizonDirection = Player.touchPoint.ex - Player.touchPoint.sx;
      let verticalDirection = Player.touchPoint.ey - Player.touchPoint.sy;
      if (Math.abs(horizonDirection) < Math.abs(verticalDirection)) {
        if (verticalDirection < 0) {
          Player.keyStatus = {right: false, left: false, up: true, down: false, space: false, esc: false, x: false, z: false};
        } else {
          Player.keyStatus = {right: false, left: false, up: false, down: true, space: false, esc: false, x: false, z: false};
        }
      } else {
        if (horizonDirection < 0) {
          Player.keyStatus = {right: false, left: true, up: false, down: false, space: false, esc: false, x: false, z: false};
        } else {
          Player.keyStatus = {right: true, left: false, up: false, down: false, space: false, esc: false, x: false, z: false};
        }
      }
      Player.touchPoint.sx = Player.touchPoint.ex;
      Player.touchPoint.sy = Player.touchPoint.ey;
    }
  }
  static touchEndEvent(e) {
    Player.keyStatus = {right: false, left: false, up: false, down: false, space: false, esc: false, x: false, z: false};
  }
  static gamepadEvent(e=null) {
    let gamepads = navigator.getGamepads();
    for (let a = 0; a < gamepads.length; a++) {
      if (gamepads[a]) {
        if (gamepads[a].axes[Config.gamepad.leftStick.x] > 0.5) {
          Player.keyStatus.right = true;
          Player.keyStatus.left = false;
        } else if (gamepads[a].axes[Config.gamepad.leftStick.x] < -0.5) {
          Player.keyStatus.right = false;
          Player.keyStatus.left = true;
        } else {
          Player.keyStatus.right = false;
          Player.keyStatus.left = false;
        }
        if (gamepads[a].axes[Config.gamepad.leftStick.y] > 0.5) {
          Player.keyStatus.up = false;
          Player.keyStatus.down = true;
        } else if (gamepads[a].axes[Config.gamepad.leftStick.y] < -0.5) {
          Player.keyStatus.up = true;
          Player.keyStatus.down = false;
        } else {
          Player.keyStatus.up = false;
          Player.keyStatus.down = false;
        }
        if (gamepads[a].buttons[Config.gamepad.buttonA].pressed) {
          Player.keyStatus.x = true;
        } else {
          Player.keyStatus.x = false;
        }
        if (gamepads[a].buttons[Config.gamepad.buttonB].pressed) {
          Player.keyStatus.z = true;
        } else {
          Player.keyStatus.z = false;
        }
      }
    }
  }
  static createNewPuyo () {
    if (Stage.board[0][2]) {
      return false;
    }
    let nextPuyosSet = PuyoImage.getNextPuyos();
    this.centerPuyo = nextPuyosSet.centerPuyo;
    this.centerPuyoElement = nextPuyosSet.centerPuyoElement;
    this.centerPuyoElement.width = Config.puyoImgWidth;
    this.centerPuyoElement.height = Config.puyoImgHeight;
    this.centerPuyoElement.style.position = 'absolute';
    Stage.stageElement.appendChild(this.centerPuyoElement);
    this.movablePuyo = nextPuyosSet.movablePuyo;
    this.movablePuyoElement = nextPuyosSet.movablePuyoElement;
    this.movablePuyoElement.width = Config.puyoImgWidth;
    this.movablePuyoElement.height = Config.puyoImgHeight;
    this.movablePuyoElement.style.position = 'absolute';
    Stage.stageElement.appendChild(this.movablePuyoElement);
    this.puyoStatus = {x: 2, y: -1, left: 2 * Config.puyoImgWidth, top: -1 * Config.puyoImgHeight, dx: 0, dy: -1, rotation: 90};
    this.groundFrame = 0;
    this.setPuyoPosition();
    return true;
  }
  static setPuyoPosition() {
    this.centerPuyoElement.style.left = `${this.puyoStatus.left}px`;
    this.centerPuyoElement.style.top = `${this.puyoStatus.top}px`;
    let x = this.puyoStatus.left + Math.cos(this.puyoStatus.rotation * Math.PI / 180) * Config.puyoImgWidth;
    let y = this.puyoStatus.top - Math.sin(this.puyoStatus.rotation * Math.PI / 180) * Config.puyoImgHeight;
    this.movablePuyoElement.style.left = `${x}px`;
    this.movablePuyoElement.style.top = `${y}px`;
  }
  static falling(isDownPressed) {
    let isBlocked = false;
    let x = this.puyoStatus.x;
    let y = this.puyoStatus.y;
    let dx = this.puyoStatus.dx;
    let dy = this.puyoStatus.dy;
    if (y + 1 < 0 || y + 1 >= Config.stageRows) {
      isBlocked = true;
    } else if (Stage.board[y + 1][x]) {
      isBlocked = true;
    } else if (y + dy + 1 >= 0 && (y + dy + 1 >= Config.stageRows || Stage.board[y + dy + 1][x + dx])) {
      isBlocked = true;
    }
    if (!isBlocked) {
      this.puyoStatus.top += Config.playerFallingSpeed;
      if (isDownPressed) {
        this.puyoStatus.top += Config.playerDownSpeed;
      }
      if (Math.floor(this.puyoStatus.top / Config.puyoImgHeight) != y) {
        if (isDownPressed) {
          Score.addScore(1);
        }
        y = this.puyoStatus.y = y + 1;
        if (y + 1 >= Config.stageRows) {
          isBlocked = true;
        } else if (Stage.board[y + 1][x]) {
          isBlocked = true;
        } else if (y + dy + 1 >= 0 && (y + dy + 1 >= Config.stageRows || Stage.board[y + dy + 1][x + dx])) {
          isBlocked = true;
        }
        if (!isBlocked) {
          this.groundFrame = 0;
        } else {
          this.puyoStatus.top = y * Config.puyoImgHeight;
          this.groundFrame = 1;
        }
      } else {
        this.groundFrame = 0;
      }
      return false;
    }
    if (this.groundFrame == 0) {
      this.groundFrame = 1;
    } else {
      this.groundFrame = this.groundFrame + 1;
      if (this.groundFrame > Config.playerGroundFrame) {
        return true;
      }
    }
    return false;
  }
  static playing(frame) {
    let nextMode = 'playing';
    if (this.falling(this.keyStatus.down)) {
      this.setPuyoPosition();
      nextMode = 'fix';
    }
    this.setPuyoPosition();
    if (this.keyStatus.right || this.keyStatus.left) {
      let cx = (this.keyStatus.right) ? 1 : -1;
      let x = this.puyoStatus.x;
      let y = this.puyoStatus.y;
      let mx = x + this.puyoStatus.dx;
      let my = y + this.puyoStatus.dy;
      let canMove = true;
      if (y >= 0 && (x + cx < 0 || x + cx >= Config.stageCols || Stage.board[y][x + cx])) {
        canMove = false;
      }
      if (my >= 0 && (mx + cx < 0 || mx + cx >= Config.stageCols || Stage.board[my][mx + cx])) {
        canMove = false;
      }
      if (this.groundFrame === 0) {
        if (y + 1 >= 0 && (x + cx < 0 || x + cx >= Config.stageCols || Stage.board[y + 1][x + cx])) {
          canMove = false;
        }
        if (my + 1 >= 0 && (mx + cx < 0 || mx + cx >= Config.stageCols || Stage.board[my + 1][mx + cx])) {
          canMove = false;
        }
      }
      if (canMove) {
        this.actionStartFrame = frame;
        this.moveSource = x * Config.puyoImgWidth;
        this.moveDestination = (x + cx) * Config.puyoImgWidth;
        this.puyoStatus.x = this.puyoStatus.x + cx;
        nextMode = 'moving';
      }
    }
    if (this.keyStatus.up || this.keyStatus.x || this.keyStatus.z) {
      let dx = (this.keyStatus.up)? 1 : (this.keyStatus.x)? -1 : (this.keyStatus.z)? 1 : -1;
      let x = this.puyoStatus.x;
      let y = this.puyoStatus.y;
      let mx = this.puyoStatus.x + this.puyoStatus.dx;
      let my = this.puyoStatus.y + this.puyoStatus.dy;
      let rotation = this.puyoStatus.rotation;
      let canRotate = true
      let canSwap = false;
      let cx = 0;
      let cy = 0;
      if (rotation === 0) {
        if (y + 2 >= Config.stageRows || Stage.board[y + 2][x]) {
          cy = -1;
        } else if (y + 2 >= Config.stageRows || x - dx < 0 || x - dx >= Config.stageCols || Stage.board[y + 2][x - dx]) {
          cy = -1;
        }
      } else if (rotation === 90) {
        if (x - dx < 0 || x - dx >= Config.stageCols || y + 1 >= Config.stageRows || Stage.board[y + 1][x - dx]) {
          if (y + 1 >= Config.stageRows || x + dx < 0 || x + dx >= Config.stageCols || Stage.board[y + 1][x + dx]) {
            canRotate = false;
          } else {
            cx = dx;
          }
        }
        canSwap = true;
      } else if (rotation === 180) {
        if (y + 2 >= Config.stageRows || Stage.board[y + 2][x]) {
          cy = -1;
        } else if (y + 2 >= Config.stageRows || x - dx < 0 || x - dx >= Config.stageCols || Stage.board[y + 2][x - dx]) {
          cy = -1;
        }
      } else if (rotation === 270) {
        if (x + dx < 0 || x + dx >= Config.stageCols || y + 1 >= Config.stageRows || Stage.board[y + 1][x + dx]) {
          if (x - dx < 0 || x - dx >= Config.stageCols || y + 1 >= Config.stageRows || Stage.board[y + 1][x - dx]) {
            canRotate = false;
          } else {
            cx = -dx;
          }
        }
        canSwap = true;
      }
      if (canRotate) {
        if (cy === -1) {
          if (this.groundFrame > 0) {
            this.puyoStatus.y = this.puyoStatus.y - 1;
            this.groundFrame = 0;
          }
          this.puyoStatus.top = this.puyoStatus.y * Config.puyoImgHeight;
        }
        this.actionStartFrame = frame;
        this.rotateDegree = 90.0 * dx;
        this.rotateBeforeLeft = x * Config.puyoImgWidth;
        this.rotateAfterLeft = (x + cx) * Config.puyoImgWidth;
        this.rotateFromRotation = this.puyoStatus.rotation;
        this.puyoStatus.x = this.puyoStatus.x + cx;
        let distRotation = (this.puyoStatus.rotation + this.rotateDegree + 360) % 360;
        let dCombi = [[1, 0], [0, -1], [-1, 0], [0, 1]][Math.floor(distRotation / 90)];
        this.puyoStatus.dx = dCombi[0];
        this.puyoStatus.dy = dCombi[1];
        nextMode = 'rotating';
      } else if (canSwap) {
        if (this.groundFrame > 0) {
          this.puyoStatus.y = this.puyoStatus.y - 1;
          this.groundFrame = 0;
        }
        this.puyoStatus.top = this.puyoStatus.y * Config.puyoImgHeight;
        this.actionStartFrame = frame;
        this.rotateDegree = 180;
        this.rotateBeforeLeft = x * Config.puyoImgWidth;
        this.rotateAfterLeft = x * Config.puyoImgWidth;
        this.rotateFromRotation = this.puyoStatus.rotation;
        this.puyoStatus.dx = 0;
        if (this.rotateFromRotation == 90) {
          this.puyoStatus.dy = 1;
        } else {
          this.puyoStatus.dy = -1;
        }
        nextMode = 'rotating';
      }
    }
    return nextMode;
  }
  static moving(frame) {
    this.falling();
    let ratio = Math.min(1, (frame - this.actionStartFrame) / Config.playerMoveFrame);
    this.puyoStatus.left = ratio * (this.moveDestination - this.moveSource) + this.moveSource;
    this.setPuyoPosition();
    if (ratio === 1) {
      return false;
    }
    return true;
  }
  static rotating(frame) {
    this.falling();
    let ratio = Math.min(1, (frame - this.actionStartFrame) / Config.playerRotateFrame);
    this.puyoStatus.left = (this.rotateAfterLeft - this.rotateBeforeLeft) * ratio + this.rotateBeforeLeft;
    this.puyoStatus.rotation = this.rotateFromRotation + ratio * this.rotateDegree;
    this.setPuyoPosition();
    if (ratio === 1) {
      this.puyoStatus.rotation = (this.rotateFromRotation + this.rotateDegree + 360) % 360;
      return false;
    }
    return true;
  }
  static fix() {
    if (this.puyoStatus.y >= 0) {
      Stage.setPuyo(this.puyoStatus.x, this.puyoStatus.y, this.centerPuyo);
    } else {
      Stage.setHiddenPuyo(this.puyoStatus.x, this.centerPuyo);
    }
    if (this.puyoStatus.y + this.puyoStatus.dy >= 0) {
      Stage.setPuyo(this.puyoStatus.x + this.puyoStatus.dx, this.puyoStatus.y + this.puyoStatus.dy, this.movablePuyo);
    } else {
      Stage.setHiddenPuyo(this.puyoStatus.x + this.puyoStatus.dx, this.movablePuyo);
    }
    Stage.stageElement.removeChild(this.centerPuyoElement);
    Stage.stageElement.removeChild(this.movablePuyoElement);
    this.centerPuyoElement = null;
    this.movablePuyoElement = null;
  }
}

