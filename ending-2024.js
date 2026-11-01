(function (global) {
  'use strict';
  let callbacks = {}, packetDone = null;
  const plane = '<path d="M12 49 91 15 57 84 48 58 34 73 37 48Z" fill="#00bd75"/><path d="M12 49 91 15 37 48 48 58Z" fill="#f9fff3"/><path d="M48 58 91 15 57 84Z" fill="#97e8aa"/><path d="m34 73 14-15-11-10Z" fill="#00664c"/>';
  const burst = '<path d="M0-11v6M0 5v6M-9.5-5.5l5.2 3M4.3 2.5l5.2 3M-9.5 5.5l5.2-3M4.3-2.5l5.2-3" fill="none" stroke="currentColor" stroke-width="2"/>';
  const giftPacket = `<svg viewBox="0 0 120 185" aria-hidden="true"><rect x="1" y="1" width="118" height="183" rx="10" fill="#fff7e9" stroke="#fff" stroke-width="2"/><g color="#efc8ad" transform="translate(39 48)">${burst}</g><g color="#f5d668" transform="translate(101 77)">${burst}</g><g color="#efc8ad" transform="translate(24 145) scale(1.2)">${burst}</g><path d="M47 77h26v32H47Z" fill="#ed6347"/><path d="M47 77c0 14 26 14 26 0" fill="none" stroke="#fff1db" stroke-width="2"/><circle cx="60" cy="90" r="2.6" fill="#fff1db"/></svg>`;
  const wallpaper = `<svg viewBox="0 0 182 216" aria-hidden="true"><g transform="translate(14 19) rotate(-6 47 94)"><rect width="96" height="190" rx="16" fill="#efe3ff" stroke="#fff" stroke-width="2"/><text x="48" y="49" text-anchor="middle" fill="#b68ae0" font-size="21" font-family="Arial">9:41</text></g><g transform="translate(85 19) rotate(6 47 94)"><rect width="96" height="190" rx="16" fill="#e0f8ff" stroke="#fff" stroke-width="2"/><text x="48" y="49" text-anchor="middle" fill="#80c4db" font-size="21" font-family="Arial">9:41</text></g><g transform="translate(49 2)"><rect width="98" height="211" rx="16" fill="#d8ffd4" stroke="#fff" stroke-width="2"/><text x="49" y="49" text-anchor="middle" fill="#85cf66" font-size="23" font-family="Arial">9:41</text><g transform="translate(14 78) scale(.7)">${plane}</g><text x="49" y="152" text-anchor="middle" fill="#73bd68" font-size="7" font-family="sans-serif">腾讯十周年 · 创意启航</text><circle cx="17" cy="192" r="6" fill="#7fa67a" opacity=".8"/><circle cx="81" cy="192" r="6" fill="#7fa67a" opacity=".8"/><path d="M15 188h4l-1 4h-2Z" fill="#fff"/><path d="M78 190h6v4h-6Z" fill="#fff"/><circle cx="81" cy="192" r="1" fill="#7fa67a"/></g></svg>`;
  const icons = {
    invite: '<path d="M3 12C-3 3 9-2 14 6 19-1 30 5 24 14L14 27Z" fill="#09c66b"/><path d="M16 20c-4-7 4-12 8-6 5-5 12 0 8 6l-8 11Z" fill="#9de9c5"/>',
    subscribe: '<path d="M7 23v-8c0-7 15-7 15 0v8l3 5H4Z" fill="#0ac66d"/><circle cx="14.5" cy="7" r="3" fill="#0ac66d"/><path d="M11 30c0 4 7 4 7 0" fill="#0ac66d"/>',
    express: '<g transform="rotate(34 16 17)"><rect x="10" y="5" width="13" height="17" rx="6.5" fill="#0ac66d"/><path d="M10 13h13" stroke="#fff" stroke-width="2"/><rect x="13" y="23" width="7" height="13" rx="2" fill="#0ac66d"/></g>'
  };
  function action(icon, title, subtitle, label, id, primary = false) {
    return `<div class="ending-action"><svg viewBox="0 0 36 36" aria-hidden="true">${icons[icon]}</svg><p>${title}<small>${subtitle}</small></p><button id="${id}" class="ending-action-button${primary ? ' is-primary' : ''}">${label}</button></div>`;
  }
  function fitDialog(dialog) {
    const app = document.querySelector('#app'), nav = app.querySelector('.wechat');
    const bounds = app.getBoundingClientRect(), header = nav.getBoundingClientRect();
    Object.assign(dialog.style, { left: bounds.left + 'px', top: header.bottom + 'px', width: bounds.width + 'px', height: Math.max(1, bounds.bottom - header.bottom) + 'px' });
    dialog.style.setProperty('--ending-scale', bounds.width / 402);
  }
  function openInfo(title, body, buttons = '') {
    const dialog = document.querySelector('#ending-info-dialog');
    dialog.querySelector('.ending-info-card').innerHTML = `<button class="ending-info-close" aria-label="关闭">×</button><h2 id="ending-info-title">${title}</h2>${body}${buttons}`;
    dialog.querySelector('.ending-info-close').onclick = () => dialog.close();
    fitDialog(dialog);
    if (!dialog.open) dialog.showModal();
    return dialog;
  }
  function invite() {
    const dialog = openInfo('邀请朋友参与', '<p>把这份创意分享给朋友，一起支持好创意。</p><label class="ending-share-label">活动链接<input id="ending-share-link" readonly aria-label="活动链接"></label>', '<button id="ending-copy-link" class="ending-info-primary">复制链接</button>');
    const input = dialog.querySelector('input'); input.value = global.location.href;
    dialog.querySelector('#ending-copy-link').onclick = async () => {
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(input.value);
        else { input.focus(); input.select(); if (!document.execCommand('copy')) throw new Error('Copy unavailable'); }
        callbacks.notify?.('链接已复制'); dialog.close();
      } catch (_) { input.focus(); input.select(); callbacks.notify?.('请长按或手动复制链接'); }
    };
  }
  function mount(options = {}) {
    callbacks = options;
    if (document.querySelector('#gift')) return api;
    const page = document.createElement('section');
    page.id = 'gift'; page.className = 'page gift'; page.hidden = true; page.setAttribute('aria-label', '评委礼物');
    page.innerHTML = `<div class="ending-card-tail"><button id="ending-return-cards">↑ 长按图片，保存你的评委卡</button><p>上滑查看评委礼物</p></div><section class="ending-gifts"><h1>感谢支持好创意<br>送你定制礼物</h1><p class="ending-gift-quote">「选你所爱，遇见所爱」</p><div class="ending-gift-grid"><button id="gift-packet" class="ending-gift-item"><span class="ending-gift-art ending-gift-envelope">${giftPacket}</span><span>查看获得的现金红包</span></button><button id="gift-wallpaper" class="ending-gift-item"><span class="ending-gift-art ending-gift-wallpaper">${wallpaper}</span><span>点击去保存壁纸</span></button></div></section><section class="ending-results"><h2>本次评选结果<br>将于 <strong>1月17日</strong> 揭晓</h2><p class="ending-results-copy">你支持的创意会成为年度 TOP10 吗？<br>现在除了等待，你还可以：</p><div class="ending-actions">${action('invite', '邀请朋友参与', '一起支持好创意', '邀请', 'ending-invite', true)}${action('subscribe', '订阅评选结果', '1月17日提醒你', '去订阅', 'ending-subscribe')}${action('express', '继续说心里话', '填问卷表达你的观点', '去表达', 'ending-express')}</div><button id="ending-about" class="ending-about">关于朋友圈广告评选</button><div class="ending-brands"><span class="ending-wechat-mark" aria-hidden="true">●<i>●</i></span><span>微信广告</span><span class="ending-brand-rule"></span><b>TOP</b><small>MOST LIKED WECHAT<br>MOMENTS ADS</small></div></section>`;
    document.querySelector('#app main').append(page);
    const packet = document.createElement('dialog'); packet.id = 'packet-dialog'; packet.className = 'ending-dialog'; packet.setAttribute('aria-labelledby', 'ending-packet-title');
    packet.innerHTML = `<div class="ending-dialog-mask"><div class="ending-packet-card"><p class="ending-packet-thanks">感谢你支持好创意</p><h2 id="ending-packet-title">送你惊喜现金红包</h2><p class="ending-packet-amount">65.38 <small>元</small></p><p class="ending-packet-status">录屏示例 · 非真实到账</p><svg class="ending-packet-spark one" viewBox="-13 -13 26 26" aria-hidden="true">${burst}</svg><svg class="ending-packet-spark two" viewBox="-13 -13 26 26" aria-hidden="true">${burst}</svg><button id="ending-packet-take">收下了</button></div><button class="ending-packet-close" aria-label="关闭红包"><svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="15.5"/><path d="m11.5 11.5 11 11m0-11-11 11"/></svg></button></div>`;
    const info = document.createElement('dialog'); info.id = 'ending-info-dialog'; info.className = 'ending-dialog'; info.setAttribute('aria-labelledby', 'ending-info-title'); info.innerHTML = '<div class="ending-info-mask"><div class="ending-info-card"></div></div>';
    document.body.append(packet, info);
    packet.querySelector('#ending-packet-take').onclick = packet.querySelector('.ending-packet-close').onclick = () => packet.close();
    packet.addEventListener('close', () => { const done = packetDone; packetDone = null; done?.(); });
    info.addEventListener('click', event => { if (event.target.classList.contains('ending-info-mask')) info.close(); });
    page.querySelector('#ending-return-cards').onclick = () => callbacks.onCards?.();
    page.querySelector('#gift-packet').onclick = () => openPacket();
    page.querySelector('#gift-wallpaper').onclick = () => callbacks.onWallpaper?.();
    page.querySelector('#ending-invite').onclick = invite;
    page.querySelector('#ending-subscribe').onclick = () => openInfo('订阅评选结果', '<p>录屏中的评选结果将于 1月17日 揭晓。</p><p>当前为本地体验预览，未连接活动订阅服务，尚未提交订阅。</p>');
    page.querySelector('#ending-express').onclick = () => openInfo('继续说心里话', '<p>感谢你愿意为好创意表达观点。</p><p>当前为本地体验预览，未连接原活动问卷，尚未提交任何内容。</p>');
    page.querySelector('#ending-about').onclick = () => {
      const dialog = openInfo('朋友圈广告年度评选', '<p>让更多好创意被看见。</p><p>本地体验沿用你提供的2024录屏流程，结合腾讯十周年「创意启航」主题。</p>', '<button id="ending-replay" class="ending-info-primary">重看我的创意航线</button>');
      dialog.querySelector('#ending-replay').onclick = () => { dialog.close(); callbacks.onReplay?.(); };
    };
    global.addEventListener('resize', () => requestAnimationFrame(() => document.querySelectorAll('.ending-dialog[open]').forEach(fitDialog)));
    return api;
  }
  function openPacket({ onDone } = {}) {
    const dialog = document.querySelector('#packet-dialog');
    if (!dialog) throw new Error('Mount the 2024 ending before opening the packet');
    packetDone = onDone || null; fitDialog(dialog);
    if (!dialog.open) dialog.showModal();
  }
  function afterShowGift() { const page = document.querySelector('#gift'); if (page) page.scrollTop = 0; }
  const api = Object.freeze({ mount, openPacket, afterShowGift });
  global.FLIGHT_ENDING = api;
})(globalThis);
