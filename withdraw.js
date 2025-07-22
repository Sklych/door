import { init, getUserState, postTransaction, UserState} from './network.js';

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

function showContent(state, tonConnectUI) {
  document.getElementById('progress').style.display = 'none';
  document.getElementById('error-content').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';

  animateText(0.0, state.balance.value, "usdt-text", "", state.balance.precision)
  animateText(0.0, state.reward.coefficient, "coefficient-text", " X")
  animateBackground("content-background-stars")
  
  const coefficientBtn = document.getElementById("coefficient-menu-item");
const usdtBtn = document.getElementById("usdt-menu-item");
coefficientBtn.addEventListener('click', () => {
  document.getElementById("earn-nav-item").click();
});
usdtBtn.addEventListener('click', () => {
  // ignore
});
  
  const usdtButton = document.getElementById("usdt-button");
  usdtButton.textContent = `Вывести ${state.balance.value.toFixed(state.balance.precision)} USDT`
    
    usdtButton.addEventListener("click", function () {
        if (tonConnectUI.wallet) {
          console.log(tonConnectUI.wallet.account)
          const expectedAmountToWithDraw = 0.001;
          if (true) {
            (async () => {
              try {
                // todo use real data
                const uid = '1';
                const tg_user_name = 'lol';
                const amount = expectedAmountToWithDraw;
                const wallet_info = tonConnectUI.wallet;
                const actualAmountToWithDraw = (await postTransaction(uid, tg_user_name, amount, wallet_info)).withDrawAmount;
                state.balance.value -= actualAmountToWithDraw;
                showContent(state, tonConnectUI);
                requestWithDraw(actualAmountToWithDraw, state.balance.precision);
              } catch (err) {
                console.error(err);
                showError();
              }
            })();
          } else {
            requestWithDrawInsufficient(state.balance.minWithDrawAmount)
          }
        } else {
          tonConnectUI.openModal();
        }
    });
}

function showWalletConnectedToast() {
const html = `
  <div class="token" style="align: center;">
      <span>✅</span>
      <span>Кошелек подключен</span>
  </div>`;
showToast(html);
}

function requestWithDrawInsufficient(amount) {
const html = `
  <div class="token" style="align: center;">
      <span>Минимальная сумма вывода ${amount} USDT</span>
  </div>`;
showToast(html);
}

function requestWithDraw(amount, precision) {
const html = `
  <div class="token" style="align: center;">
      <span>✅</span>
      <span>${amount.toFixed(precision)} USDT будут отправлены через 10 минут</span>
  </div>`;
showToast(html);
}

function showToast(html, duration = 3000) {
const toast = document.createElement('div');
toast.className = 'toast';
toast.innerHTML = html;

document.getElementById('toast-container').appendChild(toast);

setTimeout(() => toast.classList.add('show'), 10);

setTimeout(() => {
  toast.classList.remove('show');
  setTimeout(() => toast.remove(), 300);
}, duration);
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

function showLoading() {
  document.getElementById('progress').style.display = 'block';
  const canvas = document.getElementById('loading-canvas');
  const ctx = canvas.getContext('2d');

  // Resize canvas to fill the screen
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Create stars
  const starCount = 100;
  const stars = Array.from({ length: starCount }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2 + 1,
    speed: Math.random() * 2 + 0.5,
  }));

  // Animate stars
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';

    stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }
    });

    requestAnimationFrame(animate);
  }

  animate();
}

function showError() {
  document.getElementById('progress').style.display = 'none';
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('error-content').style.display = 'flex';

  animateBackground("error-background-stars");
}

const tg = window.Telegram.WebApp;
tg.ready();

window.onload = function() {

  const user = tg.initData.user;
  const ref = tg.initData.start_param;

  showLoading();

  const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://pastebin.com/raw/B26zvtVz',
  });

  (async () => {
    try {

      if (!localStorage.getItem("init")) {
          if (await init(user.id, ref)) {
            localStorage.setItem("init", true)
          }
      }

      const user_state = await getUserState(user.id);
      if (user_state) {
        console.log(user_state)
        if (tonConnectUI.wallet) {
          showWalletConnectedToast();
        }
        showContent(user_state, tonConnectUI);
      } else {
        showError();
      }
    } catch (err) {
      console.error(err);
      showError();
    }
  })();

  document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
      const url = item.getAttribute('data-url');
      if (url && url != "withdraw.html") {
          window.location.href = url; // navigate to page
      }
      });
  });
}
