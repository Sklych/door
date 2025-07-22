import { init, getUserState, UserState} from './network.js';

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

  // todo главная вкладка иногда зависает намертво
  // todo изменить стиль у кнопок с заданиями
  // todo Получить 0.2 X за каждого друга
  const container = document.querySelector('.container');

  for (const task of state.tasks) {
    console.log(task)
    const taskBtn = document.createElement('div');
    taskBtn.className = 'subscribe-bonus';
    taskBtn.id = task.id;
    taskBtn.textContent = task.title;
    taskBtn.addEventListener('click', () => {
      console.log(task.id)
      if (task.id == "invite_friend") {
        // todo fix now it does not share
        window.Telegram.WebApp.share({
          message: `🚀 Try out this app! Click here: ${state.referral.link}`
        });
      } else if (task.id == "subscribe_to_game_channel") {
         window.open("https://t.me/sklych_bot?start=flappytappy");
      }
    });
    container.appendChild(taskBtn);
  }

  const friendsInvitedText = document.createElement('div')
  friendsInvitedText.className = 'friends-invited'
  friendsInvitedText.id = 'friends-invited'
  friendsInvitedText.textContent = `Друзей приглашено: ${state.referral.friendsInvited}`
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
  const starCount = 10;
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

function showError(err) {
  document.getElementById('progress').style.display = 'none';
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('error-content').style.display = 'flex';
  document.getElementById('error-content').textContent = err;
  animateBackground("error-background-stars");
}


const tg = window.Telegram.WebApp;
tg.ready();
window.onload = function() {
  showLoading();
  
  (async () => {
    try {
      const user = tg.initDataUnsafe.user;
      const ref = tg.initDataUnsafe.start_param;
      if (!localStorage.getItem("init")) {
        if (await init(user.id, ref)) {
          localStorage.setItem("init", true)
        }
      }
      const user_state = await getUserState(user.id);
      showContent(user_state);
    } catch (err) {
      console.error(`${err}, ${tg.initData}, ${tg.initDataUnsafe}, ${tg},`);
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
