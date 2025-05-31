class Game {
  static initialize() {
    this.mode = 'start';
    this.serverURL = '/sega-puyo/server.php';
    this.userName = '[]';
    this.userCode = '';
    this.onlineBattle = false;
    this.waitingServerResponse = false;
    this.frame = 0;
    this.combinationCount = 0;
    this.imgQueue = [];
    this.imgQueueActive = false;
    PuyoImage.initialize();
    Stage.initialize();
    Stage.opponentUserBoardElement.style.display = "none";
    Stage.changeServerConnectionElement.addEventListener("click", () => this.changeServerConnection());
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
  static changeServerConnection(mode='start') {
    this.mode = mode;
    if (!this.onlineBattle) {
      let serverURL = prompt("Enter Server URL", this.serverURL);
      if (serverURL) {
        this.onlineBattle = true;
        this.serverURL = serverURL;
        this.userCode = "";
        this.userName = prompt("Enter User Name", this.userName);
        this.opponentReady = false;
        Stage.changeServerConnectionElement.src = "img/disconnectServer.jpg";
      }
      this.fetchClientData(true);
    } else {
      this.onlineBattle = false;
      Stage.changeServerConnectionElement.src = "img/connectServer.jpg";
      Stage.opponentUserBoardElement.style.display = "none";
      this.fetchClientData(true, true);
    }
  }
  static fetchClientData(force=false, giveup=false) {
    let data = new FormData();
    if (!this.waitingServerResponse || force) {
      this.waitingServerResponse = true;
      data.append("userName", this.userName);
      data.append("userCode", this.userCode);
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
      fetch(this.serverURL, {method: 'POST', body: data}).then(data => data.text()).then(data => {
        data = JSON.parse(data);
        this.userCode = data.userCode;
        this.opponentUserName = data.opponentUserName;
        this.opponentUserCode = data.opponentUserCode;
        this.opponentUserBatankyu = data.opponentUserBatankyu;
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
    if (!this.onlineBattle && Player.keyStatus.esc) {
      PuyoImage.pauseImage.style.display = "block";
      requestAnimationFrame(() => this.loop());
      return false;
    } else {
      PuyoImage.pauseImage.style.display = "none";
    }
    if (this.onlineBattle) {
      this.fetchClientData();
      if (!this.opponentReady) {
        PuyoImage.pauseImage.style.display = "block";
        requestAnimationFrame(() => this.loop());
        return false;
      } else if (this.opponentUserBatankyu) {
        if (!Player.keyStatus.space) {
          this.youWinImageElement.style.display = "block";
          requestAnimationFrame(() => this.loop());
          return false;
        } else {
          this.changeServerConnection();
        }
      } else {
        PuyoImage.pauseImage.style.display = "none";
      }
    }
    if (this.mode == 'start') {
      if (this.imgQueue.length > 0) {
        PuyoImage.nowLoadingImage.style.display = "block";
      } else if (this.onlineBattle == false || this.opponentReady == true) {
        PuyoImage.nowLoadingImage.style.display = "none";
        this.mode = 'checkFall';
        this.puyosCount = 0;
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
        this.combinationCount++;
        Score.calculateScore(this.combinationCount, eraseInfo.piece, eraseInfo.color);
        Stage.hideZenkeshi();
      } else {
        if (Stage.puyoCount === 0 && this.combinationCount > 0) {
          Stage.showZenkeshi();
          Score.addScore(3600);
        }
        this.combinationCount = 0;
        this.mode = 'newPuyo'
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
      this.mode = 'checkFall'
    } else if (this.mode == 'gameOver') {
      PuyoImage.prepareBatankyu(this.frame);
      this.mode = 'batankyu';
    } else if (this.mode == 'batankyu') {
      if (this.onlineBattle) {
        this.changeServerConnection('batankyu');
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
