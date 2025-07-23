import { isDebug, init, getUserState, postTransaction, UserState} from './network.js';

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

function showContent(state, tonConnectUI, user) {
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
          const expectedAmountToWithDraw = state.balance.value;
          if (state.balance.value >= state.balance.minWithDrawAmount) {
            (async () => {
              try {
                let uid = null;
                let tg_user_name = null;
                if (!isDebug) {
                  uid = user.id;
                  tg_user_name = user.username ?? user.first_name;
                } else {
                  uid = "1";
                  tg_user_name = "test";
                }
                
                const amount = expectedAmountToWithDraw;
                const wallet_info = tonConnectUI.wallet.account;
                const actualAmountToWithDraw = (await postTransaction(uid, tg_user_name, amount, wallet_info)).withDrawAmount;
                state.balance.value -= actualAmountToWithDraw;
                animateText(0.0, state.balance.value, "usdt-text", "", state.balance.precision)
                usdtButton.textContent = `Вывести ${state.balance.value.toFixed(state.balance.precision)} USDT`
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
}

function showError() {
  document.getElementById('progress').style.display = 'none';
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('error-content').style.display = 'flex';

  animateBackground("error-background-stars");
}

let tg = null;
if (!isDebug) {
  tg = window.Telegram.WebApp;
  tg.ready();
}

window.onload = function() {

  

  showLoading();

  

  (async () => {
    try {
      if (!isDebug) {
        const user = tg.initDataUnsafe.user;
        const ref = tg.initDataUnsafe.start_param;
        const user_lang = user.language_code ?? 'en';

        const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
          manifestUrl: 'https://pastebin.com/raw/B26zvtVz',
          language: user_lang,
        });
        if (!localStorage.getItem("init")) {
          if (await init(user.id, ref)) {
            localStorage.setItem("init", true)
          }
        }
        const user_state = await getUserState(user.id);
        if (user_state) {
          showContent(user_state, tonConnectUI);
        } else {
          showError();
        }
      } else {
        const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
          manifestUrl: 'https://pastebin.com/raw/B26zvtVz',
          language: 'en',
        });
        if (!localStorage.getItem("init")) {
          if (await init("1", null)) {
            localStorage.setItem("init", true)
          }
        }
        const user_state = await getUserState("1");
        if (user_state) {
          showContent(user_state, tonConnectUI);
        } else {
          showError();
        }
      }
    } catch (err) {
      if (!isDebug) {
        console.error(`${err}, ${tg.initData}, ${tg.initDataUnsafe}, ${tg},`);
      } else {
        console.error(`${err}`)
      }
      showError(err);
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
