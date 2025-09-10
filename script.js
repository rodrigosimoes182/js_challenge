(async () => {
  const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
  const qs = (sel) => {
    const el = document.querySelector(sel);
    assert(el, `Element not found: ${sel}`);
    return el;
  };
  const setVal = (el, val) => {
    el.focus();
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const waitFor = (predicate, { timeout = 8000, interval = 50, error = 'Timed out' } = {}) =>
    new Promise((resolve, reject) => {
      const start = Date.now();
      (function tick() {
        try {
          if (predicate()) return resolve(true);
        } catch (e) {}
        if (Date.now() - start > timeout) return reject(new Error(error));
        setTimeout(tick, interval);
      })();
    });

  const expectedUrl = 'https://demoqa.com/text-box';
  assert(
    location.href.startsWith(expectedUrl),
    `Open ${expectedUrl} and run this script in the DevTools console.`
  );

  const data = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    current: '123 Main St',
    permanent: '456 Secondary St'
  };

  setVal(qs('#userName'), data.name);
  setVal(qs('#userEmail'), data.email);
  setVal(qs('#currentAddress'), data.current);
  setVal(qs('#permanentAddress'), data.permanent);

  const submitBtn = qs('#submit');
  submitBtn.scrollIntoView({ block: 'center' });
  submitBtn.click();

  await waitFor(
    () => {
      const out = document.querySelector('#output');
      return out && out.offsetParent !== null && out.innerText.trim().length > 0;
    },
    { timeout: 8000, error: 'Timed out waiting for the output section to render.' }
  );

  const nameText = qs('#name').innerText.trim();
  const emailText = qs('#email').innerText.trim();
  const curAddrText = qs('#currentAddress').innerText.trim();
  const permAddrText = qs('#permanentAddress').innerText.trim();

  assert(nameText.includes(data.name), `Output name mismatch. Got: "${nameText}"`);
  assert(emailText.includes(data.email), `Output email mismatch. Got: "${emailText}"`);
  assert(curAddrText.includes(data.current), `Output current address mismatch. Got: "${curAddrText}"`);
  assert(permAddrText.includes(data.permanent), `Output permanent address mismatch. Got: "${permAddrText}"`);

  const res = await fetch('https://jsonplaceholder.typicode.com/posts/1', { method: 'GET' });
  assert(res.status === 200, `Expected status 200, got ${res.status}`);
  const json = await res.json();

  ['userId', 'id', 'title', 'body'].forEach((k) => {
    assert(Object.prototype.hasOwnProperty.call(json, k), `Missing key "${k}" in JSON response`);
  });
  assert(json.id === 1, `Expected id=1, got ${json.id}`);

  console.log('✅ All tests passed');
})();
