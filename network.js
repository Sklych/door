export const isDebug = false;
let BASE_URL = 'https://flsdfl.pythonanywhere.com';
if (isDebug) {
  BASE_URL = 'http://127.0.0.1:5000';
}

export class UserState {
    constructor(data) {
      this.uid = data.uid,
      this.score = data.score;
      this.balance = data.balance;
      this.reward = data.reward;
      this.referral = data.referral;
      this.tasks = data.tasks;
    }
  }

export async function init(uid, language, ref = null) {
  if (!uid) {
    console.error("init: uid is required");
    return null;
  }
  if (!language) {
    console.error("init: language is required");
    return null;
  }
  const params = new URLSearchParams({ uid });
  params.append('language', language);
  if (ref) params.append('ref', ref);

  try {
    const res = await fetch(`${BASE_URL}/init?${params.toString()}`, { method: 'GET' });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Init failed: ${text}`);
      return null;
    }
    return await res.text();
  } catch (e) {
    console.error('Init fetch error:', e);
    return null;
  }
}

export async function getUserState(uid) {
    if (!uid) {
      console.error("getConfig: uid is required");
      return null;
    }
  
    try {
      const res = await fetch(`${BASE_URL}/config?uid=${encodeURIComponent(uid)}`, { method: 'GET' });
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

export async function updateUserState(uid, score_best, balance_value) {
  if (!uid) {
    console.error("updateUserState: uid is required");
    return null;
  }
  const body = { score_best, balance: { value: balance_value } };

  try {
    const res = await fetch(`${BASE_URL}/config?uid=${encodeURIComponent(uid)}`, {
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

export async function postTransaction(uid, tg_user_name, amount, wallet_info) {
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

  try {
    const res = await fetch(`${BASE_URL}/transaction?uid=${encodeURIComponent(uid)}`, {
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

export async function postTaskComplete(uid, task_id) {
  if (!uid) {
    console.error("postTaskComplete: uid is required");
    return null;
  }
  if (!task_id) {
    console.error("postTaskComplete: task_id is required");
    return null;
  }

  const params = new URLSearchParams({ uid, task_id });

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