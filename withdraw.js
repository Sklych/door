import { isDebug, getUserState, postTransaction, UserState} from './network.js';

function animateBackground(id) {
  const bgCanvas = document.getElementById(id);
  console.log('bgCanvas ', bgCanvas)
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

function showContent(state, tonConnectUI, user, initData) {
  const playSpan = document.getElementById("play_nav_item");
  const tasksSpan = document.getElementById("tasks_nav_item");
  const leadersSpan = document.getElementById("leaders_nav_item");
  const cashoutSpan = document.getElementById("cash_out_nav_item");
  const casinoSpan = document.getElementById("casino_nav_item");

  playSpan.textContent = state.bottombar.playItem.title;
  tasksSpan.textContent = state.bottombar.tasksItem.title;
  leadersSpan.textContent = state.bottombar.leadersItem.title;
  cashoutSpan.textContent = state.bottombar.withdrawItem.title;
  casinoSpan.textContent = state.bottombar.funaItem.title;

  document.getElementById('progress').style.display = 'none';
  document.getElementById('error-content').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';

  animateText(0.0, state.balance.value, "usdt-text", "", state.balance.precision)
  animateText(0.0, state.reward.coefficient, "coefficient-text", " X")
  animateBackground("content-background-stars")
  
  const coefficientBtn = document.getElementById("coefficient-menu-item");
  if (state.reward.coefficient >= state.reward.maxCoefficient) {
    coefficientBtn.classList.add("gold");
  }
const usdtBtn = document.getElementById("usdt-menu-item");
coefficientBtn.addEventListener('click', () => {
  document.getElementById("earn-nav-item").click();
});
usdtBtn.addEventListener('click', () => {
  // ignore
});

const casinoBtn = document.getElementById("casino-menu-item");
    casinoBtn.addEventListener('click', () => {
        document.getElementById("casino-nav-item").click();
    });
    document.getElementById("casino-text").textContent = state.funaPage.balance;
  
  const usdtButton = document.getElementById("usdt-button");
  usdtButton.textContent = `${state.cashOutPage.btnText} ${state.balance.value.toFixed(state.balance.precision)} USDT`
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
                const actualAmountToWithDraw = (await postTransaction(uid, tg_user_name, amount, wallet_info, initData)).withDrawAmount;
                state.balance.value -= actualAmountToWithDraw;
                animateText(0.0, state.balance.value, "usdt-text", "", state.balance.precision)
                usdtButton.textContent = `Вывести ${state.balance.value.toFixed(state.balance.precision)} USDT`
                requestWithDraw(state.cashOutPage.successWithDrawPostfix, actualAmountToWithDraw, state.balance.precision);
              } catch (err) {
                console.error(err);
                showError(state.language);
              }
            })();
          } else {
            requestWithDrawInsufficient(state)
          }
        } else {
          tonConnectUI.openModal();
        }
    });

    const proofButton = document.getElementById("proof-button");
    if (state.language == "ru") {
        proofButton.textContent = "🐤 Смотрите выплаты в Telegram. Жми! 🐤"
    } else {
        proofButton.textContent = "🐤 See our payouts on Telegram. Click! 🐤"
    }
   
    proofButton.addEventListener("click", function () {
        window.open(`https://t.me/flappytappynews`);
    });

    const delayText = document.getElementById("transaction-delay-text");
    if (delayText) {
        delayText.textContent = state.cashOutPage.transactionDelayText;
    }
}

function showWalletConnectedToast() {
const html = `
  <div class="token" style="align: center;">
      <span>✅</span>
      <span>Кошелек подключен</span>
  </div>`;
showToast(html);
}

function requestWithDrawInsufficient(state) {
const html = `
  <div class="token" style="align: center;">
      <span>${state.cashOutPage.insufficientNotificationText} ${state.balance.minWithDrawAmount} USDT</span>
  </div>`;
showToast(html);
}

function requestWithDraw(successWithDrawPostfix, amount, precision) {
const html = `
  <div class="token" style="align: center;">
      <span>✅</span>
      <span>${amount.toFixed(precision)} USDT ${successWithDrawPostfix}</span>
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

window.onload = function() {
  showLoading();

  (async () => {
    try {
      if (!isDebug) {
        const user = tg.initDataUnsafe.user;
        const language = user.language_code ?? 'en';
        const ref = tg.initDataUnsafe.start_param;
        const meta = `username=${tg.initDataUnsafe.user.username}, first_name=${tg.initDataUnsafe.user.first_name}, last_name=${tg.initDataUnsafe.user.last_name}`;
        const page = "withDrawPage";
        const initData = tg.initData;
        const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
          manifestUrl: 'https://sklych.github.io/door/tonconnect-manifest.json',
          language: language,
        });
        const user_state = await getUserState(user.id, language, ref, meta, page, initData);
        if (user_state) {
          showContent(user_state, tonConnectUI, user, initData);
        } else {
          showError(language);
        }
      } else {
        const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
          manifestUrl: 'https://pastebin.com/raw/B26zvtVz',
          language: 'en',
        });
        const uid = "1";
        const language = "en";
        const ref = null;
        const meta = null;
        const page = "withDrawPage";
        const initData = null;
	const user = null;
        const user_state = await getUserState(uid, language, ref, meta, page, initData);
        if (user_state) {
          showContent(user_state, tonConnectUI, user, initData);
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
      if (url && url != "withdraw.html") {
          window.location.href = url; // navigate to page
      }
      });
  });
}
