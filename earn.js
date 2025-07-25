import { isDebug, getUserState, postTaskComplete, UserState} from './network.js';

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

function showContent(state) {
  const playSpan = document.getElementById("play_nav_item");
  const tasksSpan = document.getElementById("tasks_nav_item");
  const cashoutSpan = document.getElementById("cash_out_nav_item");

  playSpan.textContent = state.bottombar.playItem.title;
  tasksSpan.textContent = state.bottombar.tasksItem.title;
  cashoutSpan.textContent = state.bottombar.withdrawItem.title;

  document.getElementById('progress').style.display = 'none';
  document.getElementById('error-content').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';

  animateText(0.0, state.balance.value, "usdt-text", "", state.balance.precision)
  animateText(0.0, state.reward.coefficient, "coefficient-text", " X")
    
  animateBackground("content-background-stars");
  
  const coefficientBtn = document.getElementById("coefficient-menu-item");
  const usdtBtn = document.getElementById("usdt-menu-item");
  coefficientBtn.addEventListener('click', () => {
    // ignore
  });
  usdtBtn.addEventListener('click', () => {
    document.getElementById("withdraw-nav-item").click();
  });

  // stage2
  // todo добавить таску на пиар через тикток/ютуб шортс
  const container = document.querySelector('.container');

  const infoText = document.createElement('div');
  infoText.className = 'friends-invited'
  infoText.id = 'info-text';
  infoText.textContent = state.tasksPage.coefficientInfoText;
  container.appendChild(infoText);

  for (const task of state.tasks) {
    console.log(task)
    const taskBtn = document.createElement('div');
    taskBtn.className = 'subscribe-bonus';
    taskBtn.id = task.id;
    taskBtn.textContent = task.title;
    taskBtn.addEventListener('click', () => {
      if (task.id == "invite_friend") {
         window.open(`http://t.me/share/url?url=${state.referral.link}&text=${state.referral.inviteText}`);
      } else if (task.id == "start_main_bot") {
         window.open(`https://t.me/${state.bot.id}?start=flappytappy`);
         (async () => {
          try {
            if (!isDebug) {
              await postTaskComplete(state.uid, task.id);
            } else {
              await postTaskComplete("1", task.id);
            }
            setTimeout(() => {
              window.location.reload();
            }, 2000); 
          } catch (err) {
            console.error(err);
            showError(err);
          }
        })();
      } else if (task.id == "add_sklych_to_group") {
         window.open("https://t.me/sklych_bot?startgroup=new");
         (async () => {
          try {
            if (!isDebug) {
              await postTaskComplete(state.uid, task.id);
            } else {
              await postTaskComplete("1", task.id);
            }
            setTimeout(() => {
              window.location.reload();
            }, 2000); 
          } catch (err) {
            console.error(err);
            showError(err);
          }
        })();
      }
    });
    container.appendChild(taskBtn);
  }

  const friendsInvitedText = document.createElement('div')
  friendsInvitedText.className = 'friends-invited'
  friendsInvitedText.id = 'friends-invited'
  friendsInvitedText.textContent = `${state.tasksPage.friendsInvitedPrefix}: ${state.referral.friendsInvited}`
  container.appendChild(friendsInvitedText);
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

function showError(err) {
  document.getElementById('progress').style.display = 'none';
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('error-content').style.display = 'flex';
  document.getElementById('error-content').textContent = err;
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
        const language = user.language_code;
        const ref = tg.initDataUnsafe.start_param;
        const meta = `username=${tg.initDataUnsafe.username}, first_name=${tg.initDataUnsafe.first_name}, last_name=${tg.initDataUnsafe.last_name}`;
        const user_state = await getUserState(user.id, language ?? 'en', ref, meta);
        if (user_state) {
          showContent(user_state);
        } else {
          showError();
        }
      } else {
        const uid = "1";
        const language = "en";
        const ref = null;
        const meta = null;
        const user_state = await getUserState(uid, language, ref, meta);
        if (user_state) {
          showContent(user_state);
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
        if (url && url != "earn.html") {
            window.location.href = url; // navigate to page
        }
        });
    });
}
