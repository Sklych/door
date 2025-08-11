import { isDebug, getUserState, postTaskComplete, getactivatexinvoice, UserState } from './network.js';

function animateBackground(id) {
    const bgCanvas = document.getElementById(id);
    console.log('bgCanvas ', bgCanvas, " by id ", id)
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

async function sendTransaction(tonConnectUI, address, amount) {
    try {
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 120, // 120 sec exp time
            messages: [
                {
                    address: address,
                    amount: amount * 10 ** 9,
                },
            ]
        };
        console.log('before tx result ')
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('tx result ', JSON.stringify(result))
        return true
    } catch (e) {
        console.error(e);
        return false
    }
}

function showTransactionStatus(text) {
    const html = `
      <div class="token" style="align: center;">
          <span>${text}</span>
      </div>`;
    showToast(html, 5000);
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

function showContent(state, tonConnectUI, initData) {
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
    if (state.reward.coefficient >= state.reward.maxCoefficient) {
        coefficientBtn.classList.add("gold");
    }
    const usdtBtn = document.getElementById("usdt-menu-item");
    coefficientBtn.addEventListener('click', () => {
        // ignore
    });
    usdtBtn.addEventListener('click', () => {
        document.getElementById("withdraw-nav-item").click();
    });

    const casinoBtn = document.getElementById("casino-menu-item");
    casinoBtn.addEventListener('click', () => {
        document.getElementById("casino-nav-item").click();
    });
    document.getElementById("casino-text").textContent = state.funaPage.balance;

    // stage2
    // todo добавить таску на пиар через тикток/ютуб шортс
    // todo валидировать пользователя через initData(это типо токен) https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    const container = document.querySelector('.earn-container');

    const infoText = document.createElement('div');
    infoText.className = 'friends-invited'
    infoText.id = 'info-text';
    infoText.textContent = state.tasksPage.coefficientInfoText;
    container.appendChild(infoText);

    for (const task of state.tasks) {
        console.log(task)
        const taskBtn = document.createElement('div');
        taskBtn.className = 'subscribe-bonus';
        if (task.id.includes("popup")) {
            taskBtn.classList.add("gold")
        }
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
                            await postTaskComplete(state.uid, task.id, initData);
                        } else {
                            await postTaskComplete("1", task.id, initData);
                        }
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } catch (err) {
                        console.error(err);
                        showError(state.language);
                    }
                })();
            } else if (task.id == "add_sklych_to_group") {
                window.open("https://t.me/sklych_bot?startgroup=new");
                (async () => {
                    try {
                        if (!isDebug) {
                            await postTaskComplete(state.uid, task.id, initData);
                        } else {
                            await postTaskComplete("1", task.id, initData);
                        }
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } catch (err) {
                        console.error(err);
                        showError(state.language);
                    }
                })();
            } else if (task.id == "shorts") {
                window.open(`https://t.me/flappytappywallet?text=${state.tasksPage.shareShortText}`);
            } else if (task.id == "subscribe_to_news") {
                window.open(`https://t.me/flappytappynews`);
                (async () => {
                    try {
                        if (!isDebug) {
                            await postTaskComplete(state.uid, task.id, initData);
                        } else {
                            await postTaskComplete("1", task.id, initData);
                        }
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } catch (err) {
                        console.error(err);
                        showError(state.language);
                    }
                })();
            } else if (task.id.includes("starspopup")) {
                (async () => {
                    console.log('click starspopup')
                    try {
                        console.log('click inside async');
                        const invoiceLink = (await getactivatexinvoice(state.uid, state.language, initData)).result;
                        console.log('invoice link url ', invoiceLink);
                        window.Telegram.WebApp.openInvoice(invoiceLink, (status) => {
                            if (status === "cancelled" || status === "failed") {
                                window.Telegram.WebApp.showAlert(state.tasksPage.popupBalanceTransactionFailed);
                            } else {
                                showTransactionStatus(state.tasksPage.popupBalanceTransactionCompleted);
                                if (!isDebug) {
                                    postTaskComplete(state.uid, task.id, initData);
                                } else {
                                    postTaskComplete("1", task.id, initData);
                                }
                                setTimeout(() => {
                                    window.location.reload();
                                }, 2000);
                            }
                        });
                    }
                    catch (error) {
                        console.error(error);
                    }
                    
                })();
            }
            else if (task.id.includes("popup")) {
                if (tonConnectUI.wallet) {
                    (async () => {
                        if (await sendTransaction(tonConnectUI, state.tasksPage.popupBalanceAddress, state.tasksPage.popupBalanceTonAmount)) {
                            showTransactionStatus(state.tasksPage.popupBalanceTransactionCompleted);
                            console.log("sendTransaction = true")
                            try {
                                if (!isDebug) {
                                    await postTaskComplete(state.uid, task.id, initData);
                                } else {
                                    await postTaskComplete("1", task.id, initData);
                                }
                                setTimeout(() => {
                                    window.location.reload();
                                    
                                }, 2000);
                            } catch (err) {
                                console.error(err);
                                showError(state.language);
                            }
                        } else {
                            console.log("sendTransaction = false");
                            console.log(state.tasksPage.popupBalanceTransactionFailed);
                            showTransactionStatus(state.tasksPage.popupBalanceTransactionFailed);
                        }
                    })();
                } else {
                    tonConnectUI.openModal();
                }
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



function animateText(from, to, textId, postfix, precision = 1) {
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
window.onload = function () {
    showLoading();
    (async () => {
        try {
            if (!isDebug) {

                const user = tg.initDataUnsafe.user;
                const language = user.language_code;

                const ref = tg.initDataUnsafe.start_param;
                const meta = `username=${tg.initDataUnsafe.user.username}, first_name=${tg.initDataUnsafe.user.first_name}, last_name=${tg.initDataUnsafe.user.last_name}`;
                const page = "tasksPage";
                const initData = tg.initData;
                const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
                    manifestUrl: 'https://sklych.github.io/door/tonconnect-manifest.json',
                    language: language,
                });
                const user_state = await getUserState(user.id, language ?? 'en', ref, meta, page, initData);
                if (user_state) {
                    showContent(user_state, tonConnectUI, initData);
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
                const page = "tasksPage";
                const initData = null;
                const user_state = await getUserState(uid, language, ref, meta, page, initData);
                if (user_state) {
                    showContent(user_state, tonConnectUI, initData);
                } else {
                    showError(language);
                }
            }
        } catch (err) {
            console.log(err);
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
            if (url && url != "earn.html") {
                window.location.href = url; // navigate to page
            }
        });
    });
}
