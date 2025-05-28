class PuyoImage {
  static initialize() {
    this.puyoImages = [];
    for (let i = 0; i < 5; i++) {
      let image = document.getElementById(`puyo_${i + 1}`);
      image.removeAttribute('id');
      image.width = Config.puyoImgWidth;
      image.height = Config.puyoImgHeight;
      image.style.position = 'absolute';
      this.puyoImages[i] = image;
    }
    for (let i = this.puyoImages.length - 1; i >= 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [this.puyoImages[i], this.puyoImages[j]] = [this.puyoImages[j], this.puyoImages[i]];
    }
    this.batankyuImage = document.getElementById('batankyu');
    this.batankyuImage.width = Config.puyoImgWidth * 6;
    this.batankyuImage.style.position = 'absolute';
    this.nextPuyosSet = [];
    for (let a = 0; a < Config.nextPuyosSetCount; a++) {
      this.nextPuyosSet.push({});
      this.nextPuyosSet[a].movablePuyo = Math.floor(Math.random() * Config.puyoColors) + 1;
      this.nextPuyosSet[a].movablePuyoElement = this.getPuyo(this.nextPuyosSet[a].movablePuyo);
      this.nextPuyosSet[a].centerPuyo = Math.floor(Math.random() * Config.puyoColors) + 1;
      this.nextPuyosSet[a].centerPuyoElement = this.getPuyo(this.nextPuyosSet[a].centerPuyo);
    }
  }
  static getNextPuyos() {
    let nextPuyos = this.nextPuyosSet.shift();
    this.nextPuyosSet.push({});
    this.nextPuyosSet[Config.nextPuyosSetCount - 1].movablePuyo = Math.floor(Math.random() * Config.puyoColors) + 1;
    this.nextPuyosSet[Config.nextPuyosSetCount - 1].movablePuyoElement = this.getPuyo(this.nextPuyosSet[Config.nextPuyosSetCount - 1].movablePuyo);
    this.nextPuyosSet[Config.nextPuyosSetCount - 1].centerPuyo = Math.floor(Math.random() * Config.puyoColors) + 1;
    this.nextPuyosSet[Config.nextPuyosSetCount - 1].centerPuyoElement = this.getPuyo(this.nextPuyosSet[Config.nextPuyosSetCount - 1].centerPuyo);
    Stage.showNextPuyos();
    return nextPuyos;
  }
  static getPuyo(index) {
    return this.puyoImages[index - 1].cloneNode();
  }
  static prepareBatankyu(frame) {
    this.gameOverFrame = frame;
    Stage.stageElement.appendChild(this.batankyuImage);
    this.batankyuImage.style.top = -this.batankyuImage.height + 'px';
  }
  static batankyu(frame) {
    let ratio = (frame - this.gameOverFrame) / Config.gameOverFrame;
    let x = Math.cos(Math.PI / 2 + ratio * Math.PI * 2 * 10) * Config.puyoImgWidth;
    let y = Math.cos(Math.PI + ratio * Math.PI * 2) * Config.puyoImgHeight * Config.stageRows / 4 + Config.puyoImgHeight * Config.stageRows / 2;
    this.batankyuImage.style.left = x + 'px';
    this.batankyuImage.style.top = y + 'px';
  }
}
