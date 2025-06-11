class Game {
  static initialize() {
    this.mode = 'start';
    this.serverURL = '/sega-puyo/server.php';
    this.userName = 'PuyoPuyo Master';
    this.userCode = '';
    this.onlineBattle = false;
    this.waitingServerResponse = false;
    this.frame = 0;
    this.attack = 0;
    this.beforeAttack = 0;
    this.beforeFetchAttack = 0;
    this.damage = 0;
    this.damageNext = 0;
    this.absorbedDamage = 0;
    this.beforeFetchDamage = 0;
    this.penalty = 0;
    this.combinationCount = 0;
    this.imgQueue = [];
    this.imgQueueActive = false;
    PuyoImage.initialize();
    Stage.initialize();
    Stage.opponentUserBoardElement.style.display = "none";
    Stage.serverConnectionElement.addEventListener("click", () => this.serverConnection());
    Player.initialize();
    Score.initialize();
    this.youWinImageElement = document.getElementById("youWin");
    this.loop();
  }
  static loadImg(src, element, onload=()=>{}) {
    if (src != null && element != null) {
      this.imgQueue.push({src: src, element: element, onload: onload});
    }
    if (this.imgQueueActive == false) {
      let data = this.imgQueue.shift();
      if (data) {
        this.imgQueueActive = true;
        data.element.addEventListener('load', () => {
          this.imgQueueActive = false;
          data.onload();
        });
        data.element.src = data.src;
        console.log(`Load Image: ${data.src}`);
      }
    }
    if (this.imgQueue.length > 0) {
      setTimeout(() => this.loadImg(null, null), Config.loadImgInterval);
    }
  }
  static serverConnection(mode='start', isEditSettings=true) {
    if (this.imgQueue.length > 0) {
      return false;
    }
    this.attack = 0;
    this.beforeAttack = 0;
    this.beforeFetchAttack = 0;
    this.mode = mode;
    if (!this.onlineBattle) {
      if (isEditSettings) {
        let serverURL = prompt("Enter Server URL", this.serverURL);
        if (serverURL) {
          this.serverURL = serverURL;
        }
      }
      if (this.serverURL) {
        this.onlineBattle = true;
        this.userCode = "";
        if (isEditSettings) {
          let userName = prompt("Enter User Name", this.userName);
          if (userName) {
            this.userName = userName;
          }
        }
        this.opponentReady = false;
        Stage.serverConnectionElement.src = "img/disconnectServer.jpg";
      }
      this.fetchClientData(true);
    } else {
      this.onlineBattle = false;
      this.damage = 0;
      this.damageNext = 0;
      this.absorbedDamage = 0;
      Stage.serverConnectionElement.src = "img/connectServer.jpg";
      Stage.opponentUserBoardElement.style.display = "none";
      this.fetchClientData(true, true);
    }
    return true;
  }
  static fetchClientData(force=false, giveup=false) {
    let data = new FormData();
    if (!this.waitingServerResponse || force) {
      this.waitingServerResponse = true;
      data.append("userName", this.userName);
      data.append("userCode", this.userCode);
      data.append("attack", this.attack);
      data.append("beforeFetchAttack", this.beforeFetchAttack);
      data.append("beforeFetchDamage", this.beforeFetchDamage);
      data.append("puyosCount", this.puyosCount);
      let myBoard = [];
      for (let y = 0; y < Config.stageRows; y++) {
        for (let x = 0; x < Config.stageCols; x++) {
          if (Stage.board[y][x]) {
            myBoard.push(Stage.board[y][x].puyo);
          } else {
            myBoard.push(0);
          }
        }
      }
      data.append("myBoard", myBoard);
      if (this.mode == "batankyu" || giveup) {
        data.append("batankyu", 1);
      } else {
        data.append("batankyu", 0);
      } 
      this.beforeFetchAttack = this.attack;
      fetch(this.serverURL, {method: 'POST', body: data}).then(data => data.text()).then(data => {
        data = JSON.parse(data);
        this.userCode = data.userCode;
        this.attack = this.beforeFetchAttack = data.afterFetchAttack + (this.attack - this.beforeFetchAttack);
        this.opponentUserName = data.opponentUserName;
        this.opponentUserCode = data.opponentUserCode;
        this.opponentUserBatankyu = data.opponentUserBatankyu;
        this.damageNext = data.damage;
        this.absorbedDamage = this.absorbedDamage + data.absorbedDamage;
        if (data.opponentUserBoard) {
          Stage.showOpponentUserBoard(data.opponentUserBoard.split(','));
        }
        if (this.opponentUserCode) {
          this.opponentReady = true;
        }
        this.waitingServerResponse = false;
      });
    }
  }
  static loop() {
    Player.gamepadEvent();
    if (!this.onlineBattle && Player.keyStatus.esc) {
      PuyoImage.pauseImage.style.display = "block";
      requestAnimationFrame(() => this.loop());
      return false;
    } else {
      PuyoImage.pauseImage.style.display = "none";
    }
    if (!this.onlineBattle && Player.keyStatus.s) {
      this.serverConnection('start', false);
    }
    if (this.onlineBattle) {
      this.fetchClientData();
      if (!this.opponentReady) {
        PuyoImage.nowLoadingImage.style.display = "block";
        requestAnimationFrame(() => this.loop());
        return false;
      } else if (this.opponentUserBatankyu) {
        if (!Player.keyStatus.space) {
          this.youWinImageElement.style.display = "block";
          requestAnimationFrame(() => this.loop());
          return false;
        } else {
          this.serverConnection();
        }
      } else {
        PuyoImage.nowLoadingImage.style.display = "none";
      }
    }
    if (this.mode == 'start') {
      if (this.imgQueue.length > 0) {
        PuyoImage.nowLoadingImage.style.display = "block";
      } else if (this.onlineBattle == false || this.opponentReady == true) {
        PuyoImage.nowLoadingImage.style.display = "none";
        this.puyosCount = 0;
        this.attack = 0;
        this.beforeAttack = 0;
        this.beforeFetchAttack = 0;
        this.damage = 0;
        this.damageNext = 0;
        this.absorbedDamage = 0;
        this.beforeFetchDamage = 0;
        this.penalty = 0;
        this.combinationCount = 0;
        this.mode = 'checkFall';
        PuyoImage.start();
        Stage.start();
        Score.start();
      }
      this.youWinImageElement.style.display = "none";
    } else if (this.mode == 'checkFall') {
      if (Stage.checkFall()) {
        this.mode = 'fall'
      } else {
        this.mode = 'checkErase';
      }
    } else if (this.mode == 'fall') {
      if (!Stage.fall()) {
        this.mode = 'checkErase';
      }
    } else if (this.mode == 'checkErase') {
      let eraseInfo = Stage.checkErase(this.frame);
      if (eraseInfo) {
        this.mode = 'erasing';
        Score.beforeAttack = Score.score;
        this.combinationCount = this.combinationCount + 1;
        Score.calculateScore(this.combinationCount, eraseInfo.piece, eraseInfo.color);
        Stage.hideZenkeshi();
      } else {
        if (Stage.puyoCount === 0 && this.combinationCount > 0) {
          Stage.showZenkeshi();
          Score.addScore(Config.zenkeshiScore);
        }
        this.addAttack = Math.floor((Score.score - this.beforeAttack) / Config.penaltyUnit);
        this.beforeAttack = Score.score;
        if (this.addAttack > this.penalty) {
          this.addAttack = this.addAttack - this.penalty;
          this.penalty = 0;
        } else {
          this.penalty = this.penalty - this.addAttack;
          this.addAttack = 0;
        }
        this.attack = this.attack + this.addAttack;
        this.combinationCount = 0;
        this.mode = 'penalty'; // 'newPuyo';
      }
    } else if(this.mode == 'erasing') {
      if (!Stage.erasing(this.frame)) {
        this.mode = 'checkFall';
      }
    } else if (this.mode == 'newPuyo') {
      if (!Player.createNewPuyo()) {
        this.mode = 'gameOver';
      } else {
        this.mode = 'playing';
        this.puyosCount = this.puyosCount + 1; 
      }
    } else if (this.mode == 'playing') {
      this.mode = Player.playing(this.frame);
    } else if (this.mode == 'moving') {
      if (!Player.moving(this.frame)) {
        this.mode = 'playing';
      }
    } else if (this.mode == 'rotating') {
      if (!Player.rotating(this.frame)) {
        this.mode = 'playing';
      }
    } else if (this.mode == 'fix') {
      Player.fix();
      this.mode = 'checkFall';
    } else if (this.mode == 'penalty') {
      if (this.penalty > 0) {
        this.hiddenPuyoCount = 0;
        for (let x = 0; x < Config.stageCols && this.penalty > 0; x++) {
          if (Stage.hiddenBoard[x] == null) {
            if (Math.floor(Math.random() * 2) == 1) {
              Stage.setHiddenPuyo(x, -1);
              this.penalty = this.penalty - 1;
            }
          } else {
            this.hiddenPuyoCount = this.hiddenPuyoCount + 1;
          }
        }
        if (this.hiddenPuyoCount == Config.stageCols) {
          this.mode = 'newPuyo';
        } else {
          this.mode = 'checkFall';
        }
      } else {
        this.mode = 'newPuyo';
      }
      this.penalty = this.penalty + ((this.damageNext - this.absorbedDamage) - this.damage);
      this.damage = this.damageNext;
    } else if (this.mode == 'gameOver') {
      PuyoImage.prepareBatankyu(this.frame);
      this.mode = 'batankyu';
    } else if (this.mode == 'batankyu') {
      if (this.onlineBattle) {
        this.serverConnection('batankyu');
      }
      PuyoImage.batankyu(this.frame);
      if (Player.keyStatus.space) {
        this.mode = "start";
      }
    }
    this.frame = this.frame + 1;
    requestAnimationFrame(() => this.loop());
  }
}
