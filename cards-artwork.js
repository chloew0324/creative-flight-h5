(function (global) {
  'use strict';
  // Source pixels stay intact. Only the approved rounded card is viewed/exported.
  const cards = [
    ['点子新鲜', 'point-fresh.png', 887, 1774, 86, 174, 715, 1230],
    ['故事动人', 'story-moving.png', 887, 1774, 86, 174, 715, 1230],
    ['画面好看', 'visual-beauty.png', 887, 1774, 86, 174, 715, 1230],
    ['文案有梗', 'copy-fun.png', 887, 1774, 86, 174, 716, 1230],
    ['互动好玩', 'interaction-play.png', 887, 1773, 87, 174, 714, 1229],
    ['细节用心', 'detail-care.png', 887, 1774, 87, 174, 714, 1230]
  ].map(([title, file, sourceWidth, sourceHeight, x, y, width, height], id) => Object.freeze({
    id, standardIndex: id, title, asset: 'cards/' + file, src: 'assets/cards/' + file,
    sourceWidth, sourceHeight, crop: Object.freeze({ x, y, width, height }),
    artwidth: width, artheight: height, radius: 33
  }));
  const images = new Map(), sources = new Map();
  global.FLIGHT_IDENTITY = global.FLIGHT_IDENTITY || Object.freeze({ name: 'Aragakey.', get avatar() {
    return global.FLIGHT_ASSETS?.['identity/aragakey-avatar.svg'] || global.FLIGHT_ASSETS?.['assets/identity/aragakey-avatar.svg'] || 'assets/identity/aragakey-avatar.svg';
  } });
  const escape = value => String(value).replace(/[&"<>]/g, character => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[character]));
  function identityFor(options = {}) {
    const identity = Object.hasOwn(options, 'identity') ? options.identity : global.FLIGHT_IDENTITY;
    if (!identity?.name) return null;
    let avatar = identity.avatar || '';
    if (avatar.startsWith('assets/')) avatar = global.FLIGHT_ASSETS?.[avatar.slice(7)] || global.FLIGHT_ASSETS?.[avatar] || avatar;
    return { name: String(identity.name).slice(0, 30), avatar };
  }
  function identityLayout(card) {
    const bodyCropHeight = [1153,1153,1153,1170,1170,1170][card.id], bodyHeight = card.artheight - 158, bodyScale = bodyHeight / bodyCropHeight;
    return { bodyCropHeight, bodyHeight, bodyWidth: card.artwidth * bodyScale, bodyX: card.artwidth * (1-bodyScale) / 2,
      x: 50, avatarY: card.artheight - 118, avatar: 88, textX: 164, nameY: card.artheight - 80, labelY: card.artheight - 42,
      ruleY: card.artheight - 140, brandX: card.artwidth - 50, paper: '#f5f2e7',
      color: ['#004c3d', '#6d2813', '#6d2337', '#163f70', '#41216b', '#414b13'][card.id] };
  }
  function identitySVG(card, identity) {
    if (!identity) return '';
    const p = identityLayout(card), clip = 'card-avatar-' + card.id;
    return `<g class="card-identity" aria-label="${escape(identity.name)} 的创意卡片"><path d="M50 ${p.ruleY}H${p.brandX}" fill="none" stroke="${p.color}" stroke-opacity=".2" stroke-width="1.5"/><defs><clipPath id="${clip}"><rect x="${p.x}" y="${p.avatarY}" width="${p.avatar}" height="${p.avatar}" rx="18"/></clipPath></defs>${identity.avatar ? `<image href="${escape(identity.avatar)}" x="${p.x}" y="${p.avatarY}" width="${p.avatar}" height="${p.avatar}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clip})"/>` : `<rect x="${p.x}" y="${p.avatarY}" width="${p.avatar}" height="${p.avatar}" rx="18" fill="${p.color}"/><text x="${p.x+p.avatar/2}" y="${p.avatarY+59}" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="46">${escape(identity.name[0])}</text>`}<rect x="${p.x}" y="${p.avatarY}" width="${p.avatar}" height="${p.avatar}" rx="18" fill="none" stroke="${p.color}" stroke-opacity=".14" stroke-width="2"/><text x="${p.textX}" y="${p.nameY}" font-family="Arial,'PingFang SC',sans-serif" font-size="36" font-weight="700" fill="${p.color}">${escape(identity.name)}</text><text x="${p.textX}" y="${p.labelY}" font-family="RefSans,'PingFang SC',sans-serif" font-size="25" font-weight="500" fill="${p.color}">我的创意偏爱</text><g fill="${p.color}" text-anchor="end" font-family="RefSans,'PingFang SC',sans-serif" font-weight="600"><text x="${p.brandX}" y="${p.nameY-2}" font-size="24">腾讯十周年</text><text x="${p.brandX}" y="${p.labelY-1}" font-size="29">创意启航</text></g></g>`;
  }
  function get(id) {
    const number = typeof id === 'string' && /^[0-5]$/.test(id) ? Number(id) : id;
    if (!Number.isInteger(number) || !cards[number]) throw new RangeError('Unknown approved card');
    return cards[number];
  }
  function source(id) {
    const card = get(id), assets = global.FLIGHT_ASSETS;
    return assets?.[card.asset] || assets?.[card.asset.split('/').pop()] || card.src;
  }
  function svg(id, options = {}) {
    const card = get(id), { x, y, width, height } = card.crop, identity = identityFor(options), p = identityLayout(card);
    const outputWidth = options.width || width, outputHeight = options.height || Math.round(outputWidth * height / width);
    const clip = 'approved-card-' + card.id, bodyClip = 'card-body-' + card.id;
    const image = `<image href="${escape(options.src || source(id))}" width="${card.sourceWidth}" height="${card.sourceHeight}"/>`;
    const artwork = identity ? `<rect width="${width}" height="${height}" fill="${p.paper}"/><g clip-path="url(#${bodyClip})"><svg x="${p.bodyX}" width="${p.bodyWidth}" height="${p.bodyHeight}" viewBox="${x} ${y} ${width} ${p.bodyCropHeight}" overflow="hidden">${image}</svg></g>${identitySVG(card,identity)}` : `<svg width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}" overflow="hidden">${image}</svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escape(card.title)}，十周年创意纪念卡" viewBox="0 0 ${width} ${height}" width="${outputWidth}" height="${outputHeight}"><defs><clipPath id="${clip}"><rect width="${width}" height="${height}" rx="${card.radius}"/></clipPath><clipPath id="${bodyClip}"><rect x="${p.bodyX}" width="${p.bodyWidth}" height="${p.bodyHeight}" rx="30"/></clipPath></defs><g clip-path="url(#${clip})">${artwork}</g></svg>`;
  }
  async function dataSource(address) {
    if (/^data:image\//.test(address)) return address;
    if (!sources.has(address)) sources.set(address, (async () => {
      const response = await fetch(address);
      if (!response.ok) throw new Error('Approved card image unavailable');
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Approved card image unreadable'));
        reader.readAsDataURL(blob);
      });
    })().catch(error => { sources.delete(address); throw error; }));
    return sources.get(address);
  }
  async function embeddedSVG(id, options = {}) {
    const identity = identityFor(options);
    if (identity?.avatar) identity.avatar = await dataSource(identity.avatar);
    return svg(id, { ...options, identity, src: await dataSource(options.src || source(id)) });
  }
  function loadImage(address) {
    if (!images.has(address)) images.set(address, new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Approved card image unavailable'));
      image.src = address;
    }).catch(error => { images.delete(address); throw error; }));
    return images.get(address);
  }
  async function draw(id, canvas, options = {}) {
    const { width = 1080, rounded = true, background = null } = options;
    const card = get(id), crop = card.crop;
    if (!Number.isFinite(width) || width < 1) throw new RangeError('Invalid card width');
    const identity = identityFor(options);
    if(typeof document !== 'undefined') await document.fonts?.ready;
    const [image, avatar] = await Promise.all([loadImage(options.src || source(id)), identity?.avatar ? loadImage(identity.avatar) : null]);
    canvas.width = Math.round(width);
    canvas.height = Math.round(canvas.width * crop.height / crop.width);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable');
    if (background) { context.fillStyle = background; context.fillRect(0, 0, canvas.width, canvas.height); }
    context.save();
    if (rounded) {
      context.beginPath();
      context.roundRect(0, 0, canvas.width, canvas.height, card.radius * canvas.width / crop.width);
      context.clip();
    }
    const p = identityLayout(card), scale = canvas.width / crop.width;
    if (identity) {
      context.save(); context.scale(scale, scale); context.fillStyle = p.paper; context.fillRect(0,0,crop.width,crop.height);
      context.save(); context.beginPath(); context.roundRect(p.bodyX,0,p.bodyWidth,p.bodyHeight,30); context.clip();
      context.drawImage(image,crop.x,crop.y,crop.width,p.bodyCropHeight,p.bodyX,0,p.bodyWidth,p.bodyHeight);context.restore();
      context.strokeStyle=p.color;context.lineWidth=1.5;context.globalAlpha=.2;context.beginPath();context.moveTo(50,p.ruleY);context.lineTo(p.brandX,p.ruleY);context.stroke();context.globalAlpha=1;
      context.save();context.beginPath();context.roundRect(p.x,p.avatarY,p.avatar,p.avatar,18);context.clip();
      if (avatar) {
        const side = Math.min(avatar.naturalWidth, avatar.naturalHeight);
        context.drawImage(avatar,(avatar.naturalWidth-side)/2,(avatar.naturalHeight-side)/2,side,side,p.x,p.avatarY,p.avatar,p.avatar);
      } else {context.fillStyle=p.color;context.fillRect(p.x,p.avatarY,p.avatar,p.avatar);context.fillStyle='#fff';context.font='46px Arial';context.textAlign='center';context.fillText(identity.name[0],p.x+p.avatar/2,p.avatarY+59)}
      context.restore();context.strokeStyle=p.color;context.globalAlpha=.14;context.lineWidth=2;context.beginPath();context.roundRect(p.x,p.avatarY,p.avatar,p.avatar,18);context.stroke();context.globalAlpha=1;
      context.fillStyle=p.color;context.font='700 36px Arial';context.textAlign='left';context.fillText(identity.name,p.textX,p.nameY,330);
      context.font='500 25px RefSans, sans-serif';context.fillText('我的创意偏爱',p.textX,p.labelY);
      context.textAlign='right';context.font='600 24px RefSans, sans-serif';context.fillText('腾讯十周年',p.brandX,p.nameY-2);
      context.font='600 29px RefSans, sans-serif';context.fillText('创意启航',p.brandX,p.labelY-1);context.restore();
    } else context.drawImage(image,crop.x,crop.y,crop.width,crop.height,0,0,canvas.width,canvas.height);
    context.restore();
    return canvas;
  }
  async function toPNG(id, options = {}) {
    const canvas = await draw(id, document.createElement('canvas'), options);
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Unable to export approved card')), 'image/png'));
  }
  Object.defineProperties(cards, {
    get: { value: get }, source: { value: source }, svg: { value: svg },
    embeddedSVG: { value: embeddedSVG }, draw: { value: draw }, toPNG: { value: toPNG },
    preload: { value: ids => Promise.all((ids || cards.map(card => card.id)).map(id => loadImage(source(id)))) }
  });
  global.FLIGHT_CARD_ARTWORK = Object.freeze(cards);
  if (typeof module !== 'undefined' && module.exports) module.exports = global.FLIGHT_CARD_ARTWORK;
})(globalThis);
