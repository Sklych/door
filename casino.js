import { isDebug, getUserState, postFunaPopup, postFunaCreate, postFunaCancel, getFunaOutcome, postFunaCashout, starscasinodeposit, UserState } from './network.js';

function animateText(from, to, textId) {
    const element = document.getElementById(textId);
    const duration = 500;
    const start = performance.now();

    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const current = from + (to - from) * progress;
        element.textContent = current;

        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

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

function showFortuuuuneee(state, room) {
    document.getElementById('popup_room').style.display = 'none';
    document.getElementById('look_for_enemy_room').style.display = 'none';
    document.getElementById('fortuna_room').style.display = 'block';

    const youDepositedText = document.getElementById("fortuna-room-you-deposited-text")
    const enemyDepositedText = document.getElementById("fortuna-room-enemy-deposited-text")
    const tryAgainButton = document.getElementById("fortuna-room-try-again-btn")
    tryAgainButton.textContent = state.funaPage.funaGameTryAgainBtnText;

    const statusItem = document.createElement('div');
    statusItem.className = 'status-item';
    statusItem.id = 'points_balance';
    statusItem.textContent = `${state.funaPage.balance} `;

    const img = document.createElement('img');
    img.src = './img/tg-star.svg';
    img.width = 16;
    img.height = 16;
    img.className = 'roulete-token';

    statusItem.appendChild(img);
    document.getElementById("funa-game-status-bar").appendChild(statusItem);

    if (state.uid == room.user1.uid) {
        youDepositedText.textContent = `${room.user1.username} ${state.funaPage.funaGameYouDepositedText} ${room.user1.points}`;
        enemyDepositedText.textContent = `${room.user2.username} ${state.funaPage.funaGameEnemyDepositedText} ${room.user2.points}`;
        youDepositedText.style.color = "#ff5252"; // red
        enemyDepositedText.style.color = "#0088cc"; // blue
    } else {
        youDepositedText.textContent = `${room.user2.username} ${state.funaPage.funaGameYouDepositedText} ${room.user2.points}`;
        enemyDepositedText.textContent = `${room.user1.username} ${state.funaPage.funaGameEnemyDepositedText} ${room.user1.points}`;
        youDepositedText.style.color = "#0088cc"; // blue
        enemyDepositedText.style.color = "#ff5252"; // red
    }

    // Добавляем иконки к тексту
    [youDepositedText, enemyDepositedText].forEach(el => {
        const icon = document.createElement('img');
        icon.src = './img/tg-star.svg';
        icon.width = 16;
        icon.height = 16;
        icon.className = 'roulete-token';
        el.appendChild(icon);
    });

    tryAgainButton.addEventListener('click', () => {
        window.location.reload();
    });

    const canvas = document.getElementById('fortuna-room-roulette');
    const ctx = canvas.getContext('2d');
    const size = 100;
    let angle = 0;

    const colors = new Map();
    colors.set(0, '#ff5252'); // red
    colors.set(1, '#0088cc'); // blue

    // ==== Prepare users sectors ====
    const users = [];
    if (room.user1.points === room.user2.points) {
        users.push({ percent: 50, color: colors.get(room.user1.color) });
        users.push({ percent: 50, color: colors.get(room.user2.color) });
    } else if (room.user1.points < room.user2.points) {
        const p = (room.user1.points / room.user2.points) * 100;
        users.push({ percent: p, color: colors.get(room.user1.color) });
        users.push({ percent: 100 - p, color: colors.get(room.user2.color) });
    } else {
        const p = (room.user2.points / room.user1.points) * 100;
        users.push({ percent: p, color: colors.get(room.user2.color) });
        users.push({ percent: 100 - p, color: colors.get(room.user1.color) });
    }

    // Precompute sectors with start and end angles
    const sectors = [];
    let startAngle = 0;
    users.forEach(u => {
        const seg = (u.percent / 100) * Math.PI * 2;
        sectors.push({
            color: u.color,
            start: startAngle,
            end: startAngle + seg
        });
        startAngle += seg;
    });

    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);

        sectors.forEach(sec => {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, size, sec.start, sec.end);
            ctx.fillStyle = sec.color;
            ctx.fill();
        });

        ctx.restore();

        // Arrow on the left
        const arrowX = canvas.width / 2 - size - 10;
        const arrowY = canvas.height / 2;

        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 20, arrowY - 10);
        ctx.lineTo(arrowX - 20, arrowY + 10);
        ctx.fillStyle = '#000';
        ctx.fill();
    }

    function spinToWinner(targetColor) {
        const targetSector = sectors.find(sec => sec.color === targetColor);
        if (!targetSector) {
            console.error("Winner color not found");
            return;
        }

        // Pick a random point inside this sector for natural stop
        const randomAngleInside = targetSector.start + Math.random() * (targetSector.end - targetSector.start);

        const rotations = 6; // full spins for nice animation
        // Arrow is now to the left → π radians
        const arrowAngle = Math.PI / 2 * 3;
        const finalAngle = rotations * 2 * Math.PI + arrowAngle - randomAngleInside;

        const startAngle = angle;
        const duration = 5000; // ms
        const startTime = performance.now();

        function animate(time) {
            const t = Math.min((time - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3); // cubic ease-out

            angle = startAngle + eased * (finalAngle - startAngle);
            drawWheel();

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // рулетка стопнулась
                tryAgainButton.style.display = 'block';
                if (room.winner.uid == state.uid) {
                    showGameStatus(state.funaPage.funaGameWinNotificationText);
                } else {
                    showGameStatus(`${room.winner.username} ${state.funaPage.funaGameLooseNotificationText}`);
                }
            }
        }

        requestAnimationFrame(animate);
    }

    drawWheel();

    // Spin to winner
    spinToWinner(colors.get(room.winner.color));
}



function showLookForEnemy(state, points, initData, meta) {
    document.getElementById('popup_room').style.display = 'none';
    document.getElementById('look_for_enemy_room').style.display = 'block';

    const lookForEnemyText = document.getElementById('look-for-enemy-text');
    lookForEnemyText.textContent = `${state.funaPage.lookForEnemyFirstText} ${points}`
    lookForEnemyText.className = 'look-for-enemy-text';

    const img = document.createElement('img');
    img.src = './img/tg-star.svg';
    img.width = 16;
    img.height = 16;
    img.className = 'roulete-token';
    lookForEnemyText.appendChild(img);

    const lookForEnemySecondText = document.createElement('div');
    lookForEnemySecondText.className = 'look-for-enemy-text';
    lookForEnemySecondText.textContent = `${state.funaPage.lookForEnemySecondText}`

    lookForEnemyText.appendChild(lookForEnemySecondText);

    const canvas = document.getElementById('look-enemy-roulette');
    const ctx = canvas.getContext('2d');

    const size = 100; // радиус
    let angle = 0; // текущий угол поворота
    let spinning = false;
    let speed = 0; // скорость вращения

    // 10 пользователей
    // Красный пользователь 30%, остальные 9 делят 70%
    const users = [];
    const colors = [
        '#ff5252', '#42a5f5', '#66bb6a', '#ffa726', '#ab47bc',
        '#29b6f6', '#ef5350', '#8d6e63', '#ffee58', '#26a69a'
    ];

    // Первый пользователь — красный с 30%
    users.push({ percent: 30, color: colors[0] });

    // Остальные 9 пользователей делят 70%
    const remainingPercent = 70;
    const otherUsersCount = 9;
    const percentPerUser = remainingPercent / otherUsersCount; // ~7.777...

    for (let i = 1; i <= otherUsersCount; i++) {
        users.push({
            percent: percentPerUser,
            color: colors[i]
        });
    }

    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);

        let startAngle = 0;
        users.forEach(user => {
            const segmentAngle = (user.percent / 100) * Math.PI * 2;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, size, startAngle, startAngle + segmentAngle);
            ctx.fillStyle = user.color;
            ctx.fill();

            startAngle += segmentAngle;
        });

        ctx.restore();

        // Стрелка сверху
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2 - size - 10);
        ctx.lineTo(canvas.width / 2 - 10, canvas.height / 2 - size - 30);
        ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2 - size - 30);
        ctx.fillStyle = '#000';
        ctx.fill();
    }

    function animate() {
        if (true) {
            angle += speed;
            // speed *= 0.99; // плавное замедление

            if (speed < 0.001) {
                spinning = false;
            }
        }

        drawWheel();
        requestAnimationFrame(animate);
    }

    function startSpin(initialSpeed = 0.3) {
        if (!spinning) {
            speed = initialSpeed;
            spinning = true;
        }
    }

    drawWheel();
    animate();
    startSpin(0.05);

    (async () => {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        const createRoomResponse = await postFunaCreate(state.uid, points, initData, meta);
        if (!createRoomResponse) {
            console.log('Create room response error');
            showError(state.language);
        } else {
            console.log(`Create room response success=${createRoomResponse}`)
            if (createRoomResponse.created) {
                // The room has been created. There are no players
                const lookForCancelButton = document.getElementById("look-for-enemy-cancel-btn")
                lookForCancelButton.style.display = 'block';
                lookForCancelButton.textContent = state.funaPage.lookForEnemyCancelButtonText;

                lookForCancelButton.addEventListener('click', () => {
                    postFunaCancel(state.uid, initData)
                    window.location.reload();
                });

                while (true) {
                    await sleep(3000);
                    const outcomeRes = await getFunaOutcome(state.uid, initData);
                    console.log('outcomeRes ', outcomeRes)
                    if (!outcomeRes.hasOutCome) {
                        continue
                    } else {
                        showFortuuuuneee(state, outcomeRes)
                        break
                    }
                }
            } else {
                // The room has not been created. There is already room with players
                showFortuuuuneee(state, createRoomResponse)
            }
        }
    })();
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

function showInitialFortunee(state, tonConnectUI, initData, meta) {
    document.getElementById('popup_room').style.display = 'block';
    document.getElementById('fortuna_room').style.display = 'none';
    document.getElementById('look_for_enemy_room').style.display = 'none';

    document.getElementById("deposit-for-ton-text").textContent = state.funaPage.depositForTonTitle;
    document.getElementById("deposit-for-stars-text").textContent = state.funaPage.depositForStarsTitle;
    document.getElementById("deposit-info-text").textContent = state.funaPage.depositInfoText;

    const statusItem = document.createElement('div');
    statusItem.className = 'status-item';
    statusItem.id = 'points_balance';
    statusItem.textContent = `${state.funaPage.balance} `; // пробел перед картинкой

    // Balance
    const img = document.createElement('img');
    img.src = './img/tg-star.svg';
    img.width = 16;
    img.height = 16;
    img.className = 'roulete-token';

    statusItem.appendChild(img);
    document.getElementById("status-bar").appendChild(statusItem);

    const tonPopupContainer = document.getElementById('ton-buttons');
    const starsPopupContainer = document.getElementById('star-buttons');

    const tonAvailableDeposits = state.funaPage.tonDeposits;
    const starAvailableDeposits = state.funaPage.starDeposits;

    const cashoutBtn = document.getElementById("funa-cashout")
    cashoutBtn.textContent = `${state.funaPage.funaCashoutPrefix} ${state.funaPage.balance} ⭐️`
    cashoutBtn.addEventListener('click', () => {
        (async () => {
            if (!tonConnectUI.wallet) {
                tonConnectUI.openModal();
            } else {
                if (state.funaPage.balance > 0) {
                    if (await postFunaCashout(state.uid, state.funaPage.balance, initData, tonConnectUI.wallet.account)) {
                        showTransactionStatus(state.funaPage.funaCashoutTransactionCompleted);
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    } else {
                        console.log("Funa cashout transaction incompleted")
                    }
                }
            }
        })();
    })


    // ton buttons
    for (const deposit of tonAvailableDeposits) {
        const btn = document.createElement('div');
        btn.className = 'buy-ton';
        if (state.funaPage.balance >= deposit.points) {
            btn.classList.add('green');
        }
        // `Start ${deposit} or  `Deposit ${deposit} `;
        btn.textContent = deposit.text;
        btn.addEventListener('click', () => {
            console.log(state.funaPage.balance, deposit.points)
            if (state.funaPage.balance >= deposit.points) {
                showLookForEnemy(state, deposit.points, initData, meta)
            } else {
                if (!tonConnectUI.wallet) {
                    tonConnectUI.openModal();
                } else {
                    (async () => {
                        const txRes = await sendTransaction(tonConnectUI, deposit.depositAddress, deposit.cost);
                        if (txRes) {
                            showTransactionStatus(state.funaPage.popupBalanceTransactionCompleted);
                            console.log("sendTransaction = true")
                            try {
                                if (!isDebug) {
                                    await postFunaPopup(state.uid, deposit.points, initData);
                                } else {
                                    await postFunaPopup("1", deposit.points, initData);
                                }
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1000);
                            } catch (err) {
                                console.error(err);
                                showError(state.language);
                            }
                        } else {
                            console.log("sendTransaction = false");
                            console.log(state.funaPage.popupBalanceTransactionFailed);
                            showTransactionStatus(state.funaPage.popupBalanceTransactionFailed);
                        }
                    })();
                }
            }
        });

        const img = document.createElement('img');
        img.src = './img/tg-star.svg';
        img.width = 16;
        img.height = 16;
        img.className = 'roulete-token';
        btn.appendChild(img);

        tonPopupContainer.appendChild(btn);
    }

    // star buttons
    for (const deposit of starAvailableDeposits) {
        const btn = document.createElement('div');
        btn.className = 'buy-stars';
        if (state.funaPage.balance >= deposit.points) {
            btn.classList.add('green');
        }
        // `Start ${deposit} or  `Deposit ${deposit} `;
        btn.textContent = deposit.text;
        btn.addEventListener('click', () => {
            if (state.funaPage.balance >= deposit.points) {
                showLookForEnemy(state, deposit.points, initData, meta)
            } else {
                (async () => {
                    console.log('click popup stars csn')
                    try {
                        console.log('click inside async');
                        const invoiceLink = (await starscasinodeposit(state.uid, state.language, initData, deposit.cost)).result;
                        console.log('invoice link url ', invoiceLink);
                        window.Telegram.WebApp.openInvoice(invoiceLink, (status) => {
                            if (status === "cancelled" || status === "failed") {
                                showTransactionStatus(state.funaPage.popupBalanceTransactionFailed);
                            } else {
                                showTransactionStatus(state.funaPage.popupBalanceTransactionCompleted);
                                if (!isDebug) {
                                    postFunaPopup(state.uid, deposit.points, initData);
                                } else {
                                    postFunaPopup("1", deposit.points, initData);
                                }
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1000);
                            }
                        });
                    }
                    catch (error) {
                        console.error(error);
                    }
                })();
            }
        });

        const img = document.createElement('img');
        img.src = './img/tg-star.svg';
        img.width = 16;
        img.height = 16;
        img.className = 'roulete-token';
        btn.appendChild(img);

        starsPopupContainer.appendChild(btn);
    }

    const canvas = document.getElementById('popup-roulette');
    const ctx = canvas.getContext('2d');

    const size = 100; // радиус
    let angle = 0; // текущий угол поворота
    let spinning = false;
    let speed = 0; // скорость вращения

    // 10 пользователей
    // Красный пользователь 30%, остальные 9 делят 70%
    const users = [];
    const colors = [
        '#ff5252', '#42a5f5', '#66bb6a', '#ffa726', '#ab47bc',
        '#29b6f6', '#ef5350', '#8d6e63', '#ffee58', '#26a69a'
    ];

    // Первый пользователь — красный с 30%
    users.push({ percent: 30, color: colors[0] });

    // Остальные 9 пользователей делят 70%
    const remainingPercent = 70;
    const otherUsersCount = 9;
    const percentPerUser = remainingPercent / otherUsersCount; // ~7.777...

    for (let i = 1; i <= otherUsersCount; i++) {
        users.push({
            percent: percentPerUser,
            color: colors[i]
        });
    }

    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);

        let startAngle = 0;
        users.forEach(user => {
            const segmentAngle = (user.percent / 100) * Math.PI * 2;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, size, startAngle, startAngle + segmentAngle);
            ctx.fillStyle = user.color;
            ctx.fill();

            startAngle += segmentAngle;
        });

        ctx.restore();

        // Стрелка сверху
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2 - size - 10);
        ctx.lineTo(canvas.width / 2 - 10, canvas.height / 2 - size - 30);
        ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2 - size - 30);
        ctx.fillStyle = '#000';
        ctx.fill();
    }

    function animate() {
        if (true) {
            angle += speed;
            // speed *= 0.99; // плавное замедление

            if (speed < 0.001) {
                spinning = false;
            }
        }

        drawWheel();
        requestAnimationFrame(animate);
    }

    function startSpin(initialSpeed = 0.3) {
        if (!spinning) {
            speed = initialSpeed;
            spinning = true;
        }
    }

    drawWheel();
    animate();
    startSpin(0.05);
}

function showContent(state, tonConnectUI, initData, meta) {
    document.getElementById('fortuna_room').style.display = 'block';
    document.getElementById('look_for_enemy_room').style.display = 'none';
    document.getElementById('popup_room').style.display = 'block';

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

    animateBackground("content-background-stars")

    showInitialFortunee(state, tonConnectUI, initData, meta);
}

function showGameStatus(text) {
    const html = `
      <div class="token" style="align: center;">
          <span>${text}</span>
      </div>`;
    showToast(html, 30000);
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
                const language = user.language_code ?? 'en';
                const ref = tg.initDataUnsafe.start_param;
                const meta = `username=${tg.initDataUnsafe.user.username}, first_name=${tg.initDataUnsafe.user.first_name}, last_name=${tg.initDataUnsafe.user.last_name}`;
                const page = "battlePage";
                const initData = tg.initData;
                const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
                    manifestUrl: 'https://sklych.github.io/door/tonconnect-manifest.json',
                    language: language,
                });
                const user_state = await getUserState(user.id, language, ref, meta, page, initData);
                if (user_state) {
                    document.querySelectorAll('.nav-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const url = item.getAttribute('data-url');
                            if (url && url != "casino.html") {
                                postFunaCancel(user_state.uid, initData);
                                window.location.href = url; // navigate to page
                            }
                        });
                    });
                    showContent(user_state, tonConnectUI, initData, meta);
                } else {
                    document.querySelectorAll('.nav-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const url = item.getAttribute('data-url');
                            if (url && url != "casino.html") {
                                window.location.href = url; // navigate to page
                            }
                        });
                    });
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
                const meta = `username=test, first_name=idi, last_name=nahui`;
                const page = "battlePage";
                const initData = null;
                const user_state = await getUserState(uid, language, ref, meta, page, initData);
                if (user_state) {
                    document.querySelectorAll('.nav-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const url = item.getAttribute('data-url');
                            if (url && url != "casino.html") {
                                window.location.href = url; // navigate to page
                                postFunaCancel(user_state.uid, initData);
                            }
                        });
                    });
                    showContent(user_state, tonConnectUI, initData, meta);
                } else {
                    document.querySelectorAll('.nav-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const url = item.getAttribute('data-url');
                            if (url && url != "casino.html") {
                                window.location.href = url; // navigate to page
                            }
                        });
                    });
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
}
