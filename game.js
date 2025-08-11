import { isDebug, getUserState, updateUserState, UserState} from './network.js';

function animateBackground(id) {
  const bgCanvas = document.getElementById(id);
  const bgCtx = bgCanvas.getContext('2d');

  function resizeBGCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  resizeBGCanvas();
  window.addEventListener('resize', resizeBGCanvas);

  const bgStars = Array.from({ length: 120 }).map(() => ({
    x: Math.random() * bgCanvas.width,
    y: Math.random() * bgCanvas.height,
    radius: Math.random() * 2 + 1,
    speed: Math.random() * 1.5 + 0.5,
  }));

  function animateStars() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    bgCtx.fillStyle = 'white';

    bgStars.forEach(star => {
      bgCtx.beginPath();
      bgCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      bgCtx.fill();

      star.y += star.speed;
      if (star.y > bgCanvas.height) {
        star.y = 0;
        star.x = Math.random() * bgCanvas.width;
      }
    });

    requestAnimationFrame(animateStars);
  }

  animateStars();
}

function showContent(user_state, language, initData) {
  const playSpan = document.getElementById("play_nav_item");
  const tasksSpan = document.getElementById("tasks_nav_item");
  const leadersSpan = document.getElementById("leaders_nav_item");
  const cashoutSpan = document.getElementById("cash_out_nav_item");
  const casinoSpan = document.getElementById("casino_nav_item");

  playSpan.textContent = user_state.bottombar.playItem.title;
  tasksSpan.textContent = user_state.bottombar.tasksItem.title;
  leadersSpan.textContent = user_state.bottombar.leadersItem.title;
  cashoutSpan.textContent = user_state.bottombar.withdrawItem.title;
  casinoSpan.textContent = user_state.bottombar.funaItem.title;

  document.getElementById('progress').style.display = 'none';
  document.getElementById('error-content').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';
  
  animateBackground("content-background-stars");
  
  animateText(0.0, user_state.balance.value, "usdt-text", "", user_state.balance.precision)
  animateText(0.0, user_state.reward.coefficient, "coefficient-text", " X")
      
  const coefficientBtn = document.getElementById("coefficient-menu-item");
  if (user_state.reward.coefficient >= user_state.reward.maxCoefficient) {
    coefficientBtn.classList.add("gold");
  }
  
  const usdtBtn = document.getElementById("usdt-menu-item");
  coefficientBtn.addEventListener('click', () => {
    document.getElementById("earn-nav-item").click();
  });
  usdtBtn.addEventListener('click', () => {
    document.getElementById("withdraw-nav-item").click();
  });

  const casinoBtn = document.getElementById("casino-menu-item");
    casinoBtn.addEventListener('click', () => {
        document.getElementById("casino-nav-item").click();
    });
    document.getElementById("casino-text").textContent = user_state.funaPage.balance;

const RAD = Math.PI / 180;
const scrn = document.getElementById("canvas");
const sctx = scrn.getContext("2d");
scrn.tabIndex = 1;

scrn.addEventListener("click", () => {
  switch (state.curr) {
    case state.getReady:
      state.curr = state.Play;
      // SFX.start.play();
      break;
    case state.Play:
      bird.flap();
      break;
    case state.gameOver:
      state.curr = state.getReady;
      bird.speed = 0;
      bird.y = 100;
      pipe.pipes = [];
      pipe.pipesMap.clear();
      pipe.pipe_id=0;
      reward.rewards = [];
      UI.score.curr = 0;
      UI.score.coefficient = 1;
      UI.uploadState = true;
      // SFX.played = false;
      break;
  }
});

scrn.onkeydown = function keyDown(e) {
  if (e.keyCode == 32 || e.keyCode == 87 || e.keyCode == 38) {
    // Space Key or W key or arrow up
    switch (state.curr) {
      case state.getReady:
        state.curr = state.Play;
        // SFX.start.play();
        break;
      case state.Play:
        bird.flap();
        break;
      case state.gameOver:
        state.curr = state.getReady;
        bird.speed = 0;
        bird.y = 100;
        pipe.pipes = [];
        pipe.pipesMap.clear();
        pipe.pipe_id=0;
        reward.rewards = [];
        UI.score.curr = 0;
        UI.score.coefficient = 1;
        UI.uploadState = true;
        // SFX.played = false;
        break;
    }
  }
};

let frames = 0;
let dx = 2;
const state = {
  curr: 0,
  getReady: 0,
  Play: 1,
  gameOver: 2,
};
// const SFX = {
//   start: new Audio(),
//   flap: new Audio(),
//   score: new Audio(),
//   hit: new Audio(),
//   die: new Audio(),
//   played: false,
// };
const gnd = {
  sprite: new Image(),
  x: 0,
  y: 0,
  draw: function () {
    this.y = scrn.height - this.sprite.height;
    let count = Math.ceil(scrn.width / this.sprite.width) + 1;
    if (count != Infinity) {
      for (let i = 0; i < count; i++) {
        sctx.drawImage(this.sprite, this.x + i * this.sprite.width, this.y);
      }
    } else {
      // skip count is Infinite
    }
  },
  update: function () {
    if (state.curr != state.Play) return;
    this.x -= dx;
    if (this.x <= -this.sprite.width) {
      this.x = 0;
    }
  },
};
const bg = {
  sprite: new Image(),
  x: 0,
  y: 0,
  draw: function () {
    y = parseFloat(scrn.height - this.sprite.height);
    sctx.drawImage(this.sprite, this.x, y);
  },
};

const pipe = {
  top: { sprite: new Image() },
  bot: { sprite: new Image() },
  gap: 85,
  moved: true,
  pipes: [],
  pipesMap: new Map(),
  pipe_id: 0,
  draw: function () {
    for (let i = 0; i < this.pipes.length; i++) {
      let p = this.pipes[i];
      sctx.drawImage(this.top.sprite, p.x, p.y);
      sctx.drawImage(
        this.bot.sprite,
        p.x,
        p.y + parseFloat(this.top.sprite.height) + this.gap
      );
    }
  },
  update: function () {
    if (state.curr != state.Play) return;
    if (frames % 100 == 0) {
      let x = parseFloat(scrn.width);
      this.pipes.push({
        id: this.pipe_id++,
        x: x,
        y: -210 * Math.min(Math.random() + 1, 1.8),
      });
    }
    this.pipes.forEach((pipe) => {
      pipe.x -= dx;
    });

    if (this.pipes.length && this.pipes[0].x < -this.top.sprite.width) {
      this.pipes.shift();
      this.moved = true;
    }
  },
};
const bird = {
  animations: [
    { sprite: new Image() },
    { sprite: new Image() },
    { sprite: new Image() },
    { sprite: new Image() },
  ],
  rotatation: 0,
  x: 50,
  y: 100,
  speed: 0,
  gravity: 0.125,
  thrust: 3.6,
  frame: 0,
  draw: function () {
    let h = this.animations[this.frame].sprite.height;
    let w = this.animations[this.frame].sprite.width;
    sctx.save();
    sctx.translate(this.x, this.y);
    sctx.rotate(this.rotatation * RAD);
    sctx.drawImage(this.animations[this.frame].sprite, -w / 2, -h / 2);
    sctx.restore();
  },
  update: function () {
    let r = parseFloat(this.animations[0].sprite.width) / 2;
    switch (state.curr) {
      case state.getReady:
        this.rotatation = 0;
        this.y += frames % 10 == 0 ? Math.sin(frames * RAD) : 0;
        this.frame += frames % 10 == 0 ? 1 : 0;
        break;
      case state.Play:
        this.frame += frames % 5 == 0 ? 1 : 0;
        this.y += this.speed;
        this.setRotation();
        this.speed += this.gravity;
        if (this.y + r >= gnd.y || this.collisioned()) {
          state.curr = state.gameOver;
        }

        break;
      case state.gameOver:
        this.frame = 1;
        if (this.y + r < gnd.y) {
          this.y += this.speed;
          this.setRotation();
          this.speed += this.gravity * 2;
        } else {
          this.speed = 0;
          this.y = gnd.y - r;
          this.rotatation = 90;
          // if (!SFX.played) {
          //   SFX.die.play();
          //   SFX.played = true;
          // }
        }

        break;
    }
    this.frame = this.frame % this.animations.length;
  },
  flap: function () {
    if (this.y > 0) {
      // SFX.flap.play();
      this.speed = -this.thrust;
    }
  },
  setRotation: function () {
    if (this.speed <= 0) {
      this.rotatation = Math.max(-25, (-25 * this.speed) / (-1 * this.thrust));
    } else if (this.speed > 0) {
      this.rotatation = Math.min(90, (90 * this.speed) / (this.thrust * 2));
    }
  },
  collisioned: function () {
    if (!pipe.pipes.length) return;
    let bird = this.animations[0].sprite;
    let x = pipe.pipes[0].x;
    let y = pipe.pipes[0].y;
    let r = bird.height / 4 + bird.width / 4;
    let roof = y + parseFloat(pipe.top.sprite.height);
    let floor = roof + pipe.gap;
    let w = parseFloat(pipe.top.sprite.width);
    if (this.x + r >= x) {
      if (this.x + r < x + w) {
        if (this.y - r <= roof || this.y + r >= floor) {
          // SFX.hit.play();
          return true;
        }
      } else if (pipe.moved) {
        if (pipe.pipes.length > 0) {
          let currPipePosition = pipe.pipes[0].id + 1;
          if (currPipePosition >= 12) { 
            UI.score.coefficient = 6;
          } else if (currPipePosition >= 9) {
            UI.score.coefficient = 5;
          } else if (currPipePosition >= 6) {
            UI.score.coefficient = 4;
          } else if (currPipePosition >= 3) {
            UI.score.coefficient = 3;
          } else if (currPipePosition >= 2) {
            UI.score.coefficient = 2;
          } else {
            UI.score.coefficient = 1;
          }
        }
        UI.score.curr =  UI.score.curr + 1 * UI.score.coefficient;
        // SFX.score.play();
        pipe.moved = false;
      }
    }
  },
};
const UI = {
  getReady: { sprite: new Image() },
  gameOver: { sprite: new Image() },
  tap: [{ sprite: new Image() }, { sprite: new Image() }],
  score: {
    curr: 0,
    best: 0,
    coefficient: 1,
  },
  uploadState: true,
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  frame: 0,
  draw: function () {
    switch (state.curr) {
      case state.getReady:
        this.y = parseFloat(scrn.height - this.getReady.sprite.height) / 2;
        this.x = parseFloat(scrn.width - this.getReady.sprite.width) / 2;
        this.tx = parseFloat(scrn.width - this.tap[0].sprite.width) / 2;
        this.ty =
          this.y + this.getReady.sprite.height - this.tap[0].sprite.height;
        sctx.drawImage(this.getReady.sprite, this.x, this.y);
        sctx.drawImage(this.tap[this.frame].sprite, this.tx, this.ty);
        break;
      case state.gameOver:

        this.y = parseFloat(scrn.height - this.gameOver.sprite.height) / 2;
        this.x = parseFloat(scrn.width - this.gameOver.sprite.width) / 2;
        this.tx = parseFloat(scrn.width - this.tap[0].sprite.width) / 2;
        this.ty =
          this.y + this.gameOver.sprite.height - this.tap[0].sprite.height;
        sctx.drawImage(this.gameOver.sprite, this.x, this.y);
        sctx.drawImage(this.tap[this.frame].sprite, this.tx, this.ty);
        if (this.uploadState) {
          this.uploadState = false;
          if (this.score.curr > user_state.score.best) {
            user_state.score.best = this.score.curr
          }
          uploadState(user_state, language, initData);
        }
        break;
    }
    this.drawScore();
  },
  drawScore: function () {
    sctx.fillStyle = "#FFFFFF";
    sctx.strokeStyle = "#000000";
    switch (state.curr) {
      case state.Play:
        sctx.lineWidth = "2";
        sctx.font = "35px Squada One";
        sctx.fillText(`${this.score.curr} (${this.score.coefficient} X)`, scrn.width / 2 - 5, 50);
        sctx.strokeText(this.score.curr, scrn.width / 2 - 5, 50);
        break;
      case state.gameOver:
        sctx.lineWidth = "2";
        sctx.font = "40px Squada One";
        let sc = `SCORE :     ${this.score.curr}`;
        try {
          sctx.fillText(sc, scrn.width / 2 - 80, scrn.height / 2 + 0);
          sctx.strokeText(sc, scrn.width / 2 - 80, scrn.height / 2 + 0);
        } catch (e) {
          sctx.fillText(sc, scrn.width / 2 - 85, scrn.height / 2 + 15);
          sctx.strokeText(sc, scrn.width / 2 - 85, scrn.height / 2 + 15);
        }

        break;
    }
  },
  update: function () {
    if (state.curr == state.Play) return;
    this.frame += frames % 10 == 0 ? 1 : 0;
    this.frame = this.frame % this.tap.length;
  },
};

function uploadState(user_state, language, initData) {
  (async () => {
    if (!await updateUserState(user_state.uid, user_state.score.best, user_state.balance.value, initData)) {
        showError(language);
    }
  })();
}

function birdCollisionWithReward(bird, rw) {
  let birdSprite = bird.animations[0].sprite;
  let birdRadius = birdSprite.width / 2;
  let birdX = bird.x;
  let birdY = bird.y;

  // Simplified rectangle collision (bird as circle, reward as rect)
  let rwLeft = rw.x;
  let rwRight = rw.x + reward.width;
  let rwTop = rw.y;
  let rwBottom = rw.y + reward.height;

  let closestX = Math.max(rwLeft, Math.min(birdX, rwRight));
  let closestY = Math.max(rwTop, Math.min(birdY, rwBottom));

  let dx = birdX - closestX;
  let dy = birdY - closestY;

  return (dx * dx + dy * dy) < (birdRadius * birdRadius);
}

const reward = {
  sprite: new Image(),
  width: 24,  // adjust based on your sprite size
  height: 24,
  gapFromPipe: 30,  // vertical space from bottom pipe to reward, or position in gap
  rewards: [], // array to store active rewards

  draw: function () {
    this.rewards.forEach(rw => {
      sctx.drawImage(this.sprite, rw.x, rw.y, reward.width, reward.height);
    });
  },

  update: function () {
    if (state.curr != state.Play) return;

    // Move rewards left
    this.rewards.forEach(rw => {
      rw.x -= dx;
    });

    // Remove rewards that went off-screen
    this.rewards = this.rewards.filter(rw => rw.x + this.width > 0);
      const lastPipe = pipe.pipes[pipe.pipes.length - 1];
      if (lastPipe) {
        if (!pipe.pipesMap.has(lastPipe.id)) {
          pipe.pipesMap.set(lastPipe.id, 0);
          if (pipe.pipesMap.size > 0) {
            const randomNum = Math.floor(Math.random() * 100) + 1;
            if (randomNum <= user_state.reward.probability) {
              const rewardY = lastPipe.y + pipe.top.sprite.height + pipe.gap / 2 - this.height / 2;

              this.rewards.push({
                x: lastPipe.x + pipe.top.sprite.width / 2 - this.width / 2,
                y: rewardY,
                collected: false,
              });
            }
          }
        }
      }
  },

  checkCollision: function () {
    // Check collision between bird and rewards
    this.rewards.forEach((rw, idx) => {
      if (!rw.collected && birdCollisionWithReward(bird, rw)) {
        rw.collected = true;
        animateText(
          user_state.balance.value, 
          user_state.balance.value + user_state.reward.coefficient * user_state.reward.usdtValue,
          "usdt-text",
          "",
          user_state.balance.precision
        );
        user_state.balance.value += user_state.reward.coefficient * user_state.reward.usdtValue;
        // Optionally remove collected reward from array immediately
        this.rewards.splice(idx, 1);
      }
    });
  }
};
reward.sprite.src = "img/reward/usdt-svgrepo-com.svg"; // your reward image path

gnd.sprite.src = "img/ground.png";
// bg.sprite.src = "img/BG.png";
pipe.top.sprite.src = "img/toppipe.png";
pipe.bot.sprite.src = "img/botpipe.png";
UI.gameOver.sprite.src = "img/go.png";
UI.getReady.sprite.src = "img/getready.png";
UI.tap[0].sprite.src = "img/tap/t0.png";
UI.tap[1].sprite.src = "img/tap/t1.png";
bird.animations[0].sprite.src = "img/bird/b0.png";
bird.animations[1].sprite.src = "img/bird/b1.png";
bird.animations[2].sprite.src = "img/bird/b2.png";
bird.animations[3].sprite.src = "img/bird/b0.png";
// SFX.start.src = "sfx/start.wav";
// SFX.flap.src = "sfx/flap.wav";
// SFX.score.src = "sfx/score.wav";
// SFX.hit.src = "sfx/hit.wav";
// SFX.die.src = "sfx/die.wav";

function gameLoop() {
  update();
  draw();
  frames++;
}

function update() {
  bird.update();
  gnd.update();
  pipe.update();
  reward.update();      // <--- update rewards
  reward.checkCollision();
  UI.update();
}

function animateText(from, to, textId, postfix, precision=1) {
  const element = document.getElementById(textId);
  const duration = 500;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const current = from + (to - from) * progress;
    element.textContent = current.toFixed(precision) + postfix;

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const gradient = sctx.createLinearGradient(0, 0, 0, canvas.height); // vertical
gradient.addColorStop(0, "#6a0dad");   // top color (dark purple)
gradient.addColorStop(1, "#9b30ff");   // bottom color (light purple)
function draw() {
  sctx.fillStyle = gradient;
  sctx.fillRect(0, 0, scrn.width, scrn.height);
  // bg.draw();
  pipe.draw();
  reward.draw();   
  bird.draw();
  gnd.draw();
  UI.draw();
}

setInterval(gameLoop, 17);
}

function showLoading() {
  document.getElementById('progress').style.display = 'block';
}

function showError(language) {
  document.getElementById('progress').style.display = 'none';
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('error-content').style.display = 'flex';

  if (language == "ru") {
    document.getElementById('error-message').textContent = "Произошла ошибка";
    document.getElementById('reload-button').textContent = "Перезагрузить";
  } else {
    document.getElementById('error-message').textContent = "An error occurred";
    document.getElementById('reload-button').textContent = "Reload";
  }

  animateBackground("error-background-stars");
}

let tg = null;
if (!isDebug) {
  tg = window.Telegram.WebApp;
  tg.ready();
}


window.onerror = function(msg, url, line, col, error) {
  window.location.reload();
};

window.onload = function() {
  showLoading();
//   setTimeout(() => {
//     const user_state = {};

// const json = {
//   "uid": "1",
//   "score": { "best": 12 },
//   "balance": {
//     "value": 1.3364400000000034,
//     "minWithDrawAmount": 0.03,
//     "precision": 5
//   },
//   "reward": {
//     "coefficient": 2.0,
//     "usdtValue": 0.002,
//     "probability": 20
//   },
//   "referral": {
//     "friendsInvited": 6,
//     "link": "https://invite?ref=1"
//   },
//   "tasks": [
//     {
//       "id": "invite_friend",
//       "tg_uid": "1",
//       "title": "Пригласить друга и увеличить коэффициент на 0.2X",
//       "reward_coefficient": 0.2,
//       "status": 0
//     }
//   ]
// };

// // Fill user_state
// Object.assign(user_state, json);
//   showContent(user_state);
//   return

  (async () => {
    try {
      if (!isDebug) {
        const user = tg.initDataUnsafe.user;
        const language = user.language_code;
        const ref = tg.initDataUnsafe.start_param;
        const meta = `username=${tg.initDataUnsafe.user.username}, first_name=${tg.initDataUnsafe.user.first_name}, last_name=${tg.initDataUnsafe.user.last_name}`;
        const page = "gamePage";
        const initData = tg.initData;
        console.log(tg.initDataUnsafe);
        console.log("READ user ", user);
        console.log("READ ref ", ref);
        console.log("READ language code ", language);
        const user_state = await getUserState(user.id, language ?? 'en', ref, meta, page, initData);
        if (user_state) {
          showContent(user_state, language, initData);
        } else {
          showError(language);
        }
      } else {
        const uid = "1";
        const language = "en";
        const ref = null;
        const meta = null;
        const page = "gamePage";
        const initData = null;
        const user_state = await getUserState(uid, language, ref, meta, page, initData);
        if (user_state) {
          showContent(user_state, language, initData);
        } else {
          showError(language);
        }
      }
    } catch (err) {
      if (!isDebug) {
        console.error(`${err}, ${tg.initData}, ${tg.initDataUnsafe}, ${tg},`);
      } else {
        console.error(`${err}`)
      }
      showError("en");
    }
  })();
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
    const url = item.getAttribute('data-url');
    if (url && url != "index.html") {
        window.location.href = url; // navigate to page
    }
    });
});
}



