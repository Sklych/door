const local = "http://127.0.0.1:5000";
const dev = "https://fdsaflsadkjfkljksdakjl.pythonanywhere.com";
const prod = "https://flsdfl.pythonanywhere.com";

const BASE_URL = prod;

export const isDebug = BASE_URL == local;

export class UserState {
  constructor(data) {
    this.uid = data.uid;
    this.language = data.language;
    this.score = data.score;
    this.balance = data.balance;
    this.reward = data.reward;
    this.referral = data.referral;
    this.tasks = data.tasks;
    this.bot = data.bot;
    this.bottombar = data.bottombar;
    this.tasksPage = data.tasksPage;
    this.leaderBoardPage = data.leaderBoardPage;
    this.cashOutPage = data.cashOutPage;
    this.funaPage = data.funaPage;
  }
}

export async function getUserState(uid, language, ref, meta, page, initData) {
  if (!uid) {
    console.error("getConfig: uid is required");
    return null;
  }

  const params = new URLSearchParams({ uid, language, initData });
  if (ref) params.append('ref', ref);
  if (meta) params.append('meta', meta);
  if (page) params.append('page', page);

  try {
    const res = await fetch(`${BASE_URL}/config?${params.toString()}`, { method: 'GET' });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Get config failed: ${text}`);
      return null;
    }
    const data = await res.json();
    console.log("Json data ", data);
    return new UserState(data);
  } catch (e) {
    console.error('getConfig fetch error:', e);
    return null;
  }
}

export async function updateUserState(uid, score_best, balance_value, initData) {
  if (!uid) {
    console.error("updateUserState: uid is required");
    return null;
  }
  const body = { score_best, balance: { value: balance_value } };
  const params = new URLSearchParams({ uid, initData });
  try {
    const res = await fetch(`${BASE_URL}/config?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`updateUserState failed: ${text}`);
      return null;
    }
    return await res.text();
  } catch (e) {
    console.error('updateUserState fetch error:', e);
    return null;
  }
}

export async function postTransaction(uid, tg_user_name, amount, wallet_info, initData) {
  if (!uid) {
    console.error("postTransaction: uid is required");
    return null;
  }
  if (!tg_user_name) {
    console.error("postTransaction: tg_user_name is required");
    return null;
  }
  if (amount == null) {
    console.error("postTransaction: amount is required");
    return null;
  }

  const body = { tg_user_name, amount, wallet_info };
  const params = new URLSearchParams({ uid, initData });
  try {
    const res = await fetch(`${BASE_URL}/transaction?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Post transaction failed: ${text}`);
      return null;
    }
    const resJson = await res.json();
    console.log("back response ", resJson);
    return resJson;
  } catch (e) {
    console.error('postTransaction fetch error:', e);
    return null;
  }
}

export async function postTaskComplete(uid, task_id, initData) {
  if (!uid) {
    console.error("postTaskComplete: uid is required");
    return null;
  }
  if (!task_id) {
    console.error("postTaskComplete: task_id is required");
    return null;
  }

  const params = new URLSearchParams({ uid, task_id, initData });

  try {
    const res = await fetch(`${BASE_URL}/task/complete?${params.toString()}`, { method: 'POST' });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Post task complete failed: ${text}`);
      return null;
    }
    return await res.text();
  } catch (e) {
    console.error('postTaskComplete fetch error:', e);
    return null;
  }
}

export async function getactivatexinvoice(uid, language, initData) {
  if (!uid) {
    console.error("getactivatexinvoice: uid is required");
    return null;
  }
  if (!language) {
    console.error("getactivatexinvoice: language is required");
    return null;
  }

  const params = new URLSearchParams({ uid, language, initData });

  try {
    const res = await fetch(`${BASE_URL}/activatexinvoice?${params.toString()}`, { method: 'GET' });
    if (!res.ok) {
      const text = await res.text();
      console.error(`getactivatexinvoice failed: ${text}`);
      return null;
    }
    const resJson = await res.json();
    console.log(`getactivatexinvoice success ${resJson}`);
    return resJson;
  } catch (e) {
    console.error('getactivatexinvoice fetch error:', e);
    return null;
  }
}

export async function starscasinodeposit(uid, language, initData, amount) {
  if (!uid) {
    console.error("starscasinodeposit: uid is required");
    return null;
  }
  if (!language) {
    console.error("starscasinodeposit: language is required");
    return null;
  }

  const params = new URLSearchParams({ uid, language, initData, amount });

  try {
    const res = await fetch(`${BASE_URL}/casinostarsinvoicelink?${params.toString()}`, { method: 'GET' });
    if (!res.ok) {
      const text = await res.text();
      console.error(`starscasinodeposit failed: ${text}`);
      return null;
    }
    const resJson = await res.json();
    console.log(`starscasinodeposit success ${resJson}`);
    return resJson;
  } catch (e) {
    console.error('starscasinodeposit fetch error:', e);
    return null;
  }
}

export async function postFunaCreate(uid, points, initData, meta) {

  if (!uid) {

    console.error("postFunaCreate: uid is required");

    return null;

  }



  if (!points) {

    console.error("postFunaCreate: points is required");

    return null;

  }



  const params = new URLSearchParams({ uid, initData, meta });

  const body = { points };

  try {

    const res = await fetch(`${BASE_URL}/funa/create?${params.toString()}`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify(body),

    });

    if (!res.ok) {

      const text = await res.text();

      console.error(`postFunaCreate failed: ${text}`);

      return null;

    }

    return await res.json();

  } catch (e) {

    console.error('postFunaCreate fetch error:', e);

    return null;

  }

}

export async function postFunaCancel(uid, initData) {

  if (!uid) {

    console.error("postFunaCancel: uid is required");

    return null;

  }



  const params = new URLSearchParams({ uid, initData });

  try {

    const res = await fetch(`${BASE_URL}/funa/cancel?${params.toString()}`, { method: 'POST' });

    if (!res.ok) {

      const text = await res.text();

      console.error(`postFunaCancel failed: ${text}`);

      return null;

    }

    return await res.text();

  } catch (e) {

    console.error('postFunaCancel fetch error:', e);

    return null;

  }

}

export async function postFunaPopup(uid, points, initData) {

  if (!uid) {

    console.error("postFunaPopup: uid is required");

    return null;

  }

  if (!points) {

    console.error("postFunaPopup: points is required");

    return null;

  }



  const params = new URLSearchParams({ uid, initData });

  const body = { points };

  try {

    const res = await fetch(`${BASE_URL}/funa/popup?${params.toString()}`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify(body),

    });

    if (!res.ok) {

      const text = await res.text();

      console.error(`postFunaPopup failed: ${text}`);

      return null;

    }

    return await res.text();

  } catch (e) {

    console.error('postFunaPopup fetch error:', e);

    return null;

  }

}



export async function getFunaOutcome(uid, initData) {

  if (!uid) {

    console.error("getFunaOutcome: uid is required");

    return null;

  }



  const params = new URLSearchParams({ uid, initData });

  try {

    const res = await fetch(`${BASE_URL}/funa/pull?${params.toString()}`, {

      method: 'GET',

      headers: { 'Content-Type': 'application/json' }

    });

    if (!res.ok) {

      const text = await res.text();

      console.error(`getFunaOutcome failed: ${text}`);

      return null;

    }

    return await res.json();

  } catch (e) {

    console.error('getFunaOutcome fetch error:', e);

    return null;

  }

}

export async function postFunaCashout(uid, points, initData, wallet_info) {
  if (!uid) {
    console.error("postFunaCashout: uid is required");
    return false;
  }

  if (!points) {
    console.error("postFunaCashout: points is required");
    return false;
  }

  const params = new URLSearchParams({ uid, initData });

  const body = { points, wallet_info };

  try {
    const res = await fetch(`${BASE_URL}/funa/cashout?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`postFunaCashout failed: ${text}`);
      return false;
    }
    return true
  } catch (e) {
    console.error('postFunaCashout fetch error:', e);
    return false;
  }

}