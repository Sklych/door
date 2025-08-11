import { isDebug, getUserState, UserState} from './network.js';

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

  function wins_text(language, amount) {
    if (language == "ru") {
        return ` и выигрывает <span class="username-text">${amount} USDT</span>`
    } else {
        return ` and wins <span class="username-text">${amount} USDT</span>`
    }
  }

  function you_win_text(language, amount) {
    if (language == "ru") {
        return ` и выигрываешь <span class="username-text">${amount} USDT</span>`
    } else {
        return ` and win <span class="username-text">${amount} USDT</span>`
    }
  }
  
  function buildButtonInnerHTML(fullText) {
    const firstSpaceIndex = fullText.indexOf(' ');
    if (firstSpaceIndex === -1) {
      // No space found — treat all as username, no extra text
      return `<span class="username-text">${fullText}</span>`;
    }
    const userName = fullText.substring(0, firstSpaceIndex);
    const restText = fullText.substring(firstSpaceIndex + 1);
    return `<span class="username-text">${userName}</span>${restText}`;
  }

  function createReferralButton(referral, you, language) {
    if (!referral) return null
    // { user_name: "DonatorYT", text: "DonatorYT invited 35 friends!", count: 35, position: 1 },
    // { user_name: "Unknown", text: "You invited 0 friends!", count: 0, position: 432 }
    const btn = document.createElement('button');
    btn.classList.add('leaderboard-button');
    if (referral.user_name == you.user_name) {
        btn.innerHTML =`${buildButtonInnerHTML(you.text)}`;
    } else {
        btn.innerHTML =`${buildButtonInnerHTML(referral.text)}`;
    }
    if (referral.reward && referral.reward > 0) {
        if (referral.user_name == you.user_name) {
            btn.innerHTML += you_win_text(language, referral.reward);
        } else {
            btn.innerHTML += wins_text(language, referral.reward);
        }
    }
    if (referral.user_name == you.user_name) {
        btn.classList.add('blue');
    } else {
        btn.classList.add('default');
    }
    return btn
  }

  function createScoreButton(score_another, score_you, language) {
    if (!score_another) return null
    // { user_name: "DonatorYT", text: "DonatorYT invited 35 friends!", count: 35, position: 1 },
    // { user_name: "Unknown", text: "You invited 0 friends!", count: 0, position: 432 }
    const btn = document.createElement('button');
    btn.classList.add('leaderboard-button');
    if (score_another.user_name == score_you.user_name) {
        btn.innerHTML =`${buildButtonInnerHTML(score_you.text)}`;
    } else {
        btn.innerHTML =`${buildButtonInnerHTML(score_another.text)}`;
    }
    if (score_another.reward && score_another.reward > 0) {
        if (score_another.user_name == score_you.user_name) {
            btn.innerHTML += you_win_text(language, score_another.reward);
        } else {
            btn.innerHTML += wins_text(language, score_another.reward);
        }
    }
    if (score_another.user_name == score_you.user_name) {
        btn.classList.add('blue');
    } else {
        btn.classList.add('default');
    }
    return btn
  }

  function createNotInTopButton(you) {
    const btn = document.createElement('button');
    btn.innerHTML =`${buildButtonInnerHTML(you.text)}`;
    btn.classList.add('leaderboard-button');
    btn.classList.add('blue');
    return btn;
  }

  function inviteFriendButton(text, share_link) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.classList.add('leaderboard-button');
    btn.classList.add('green');
    btn.addEventListener("click", ()=> {
        window.open(share_link);
    })
    return btn;
  }

  function showContent(state) {
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
      
    animateBackground("content-background-stars");
    
    const coefficientBtn = document.getElementById("coefficient-menu-item");
    const usdtBtn = document.getElementById("usdt-menu-item");
    if (state.reward.coefficient >= state.reward.maxCoefficient) {
      coefficientBtn.classList.add("gold");
    }
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
    document.getElementById("casino-text").textContent = state.funaPage.balance;
  
      const container = document.querySelector('.leaders-container');

        // Referrals

        const referralsTitle = document.createElement('div');
        referralsTitle.classList.add('board-title');
        referralsTitle.textContent = state.leaderBoardPage.referrals.title;
        container.appendChild(referralsTitle);

      state.leaderBoardPage.referrals.top.forEach(referral => {
        container.appendChild(createReferralButton(referral, state.leaderBoardPage.referrals.you, state.language));
      });

      const youInTop = state.leaderBoardPage.referrals.top.some(u => u.user_name === state.leaderBoardPage.referrals.you.user_name);
      if (!youInTop) {
        container.appendChild(createNotInTopButton(state.leaderBoardPage.referrals.you))
      }

      container.appendChild(inviteFriendButton(state.leaderBoardPage.referrals.inviteFriendButtonText, `http://t.me/share/url?url=${state.referral.link}&text=${state.referral.inviteText}`));
  
      // Scores

       const scoresTitle = document.createElement('div');
       scoresTitle.classList.add('board-title');
       scoresTitle.textContent = state.leaderBoardPage.scores.title;
       container.appendChild(scoresTitle);

     state.leaderBoardPage.scores.top.forEach(referral => {
       container.appendChild(createReferralButton(referral, state.leaderBoardPage.scores.you, state.language));
     });

     const scoreYouInTop = state.leaderBoardPage.scores.top.some(u => u.user_name === state.leaderBoardPage.scores.you.user_name);
     if (!scoreYouInTop) {
       container.appendChild(createNotInTopButton(state.leaderBoardPage.scores.you))
     }
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
          const meta = `username=${tg.initDataUnsafe.user.username}, first_name=${tg.initDataUnsafe.user.first_name}, last_name=${tg.initDataUnsafe.user.last_name}`;
          const page = "leaderBoardPage";
          const initData = tg.initData;
          const user_state = await getUserState(user.id, language ?? 'en', ref, meta, page, initData);
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
          const page = "leaderBoardPage";
          const initData = null;
          const user_state = await getUserState(uid, language, ref, meta, page, initData);
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
          if (url && url != "leaders.html") {
              window.location.href = url; // navigate to page
          }
          });
      });
  }