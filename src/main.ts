import "./style.css";
import "./effects.css";
import "./capsule-animation.css";
import { items, probability, type Item } from "./catalog";
import { DrawSequence, type DrawPhase } from "./draw-sequence";
import { SoundEffects, readSoundPreference, soundStorageKey } from "./sound";
import {
  motionStorageKey,
  parseMotionPreference,
  shouldReduceMotion,
} from "./motion";
import {
  addItem,
  drawItem,
  parseCollection,
  stats,
  storageKey,
  type Collection,
} from "./game";

const capsuleIcon = '<span class="capsule-icon" aria-hidden="true"></span>';
const soundButton =
  '<button class="sound-button" data-sound aria-label="効果音" aria-pressed="true"><span aria-hidden="true">♫</span><span>音 ON</span></button>';
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <header class="site-header"><a class="brand" href="#" aria-label="POCKET GACHA ホーム">${capsuleIcon}<span>POCKET<span class="brand-light">GACHA</span><small>ちいさな、わくわく。</small></span></a><nav aria-label="メインナビゲーション"><a class="nav-active" href="#gacha">ガチャ</a><a href="#collection">コレクション <span id="nav-count">0</span></a></nav>${soundButton}<span class="free-label"><span></span> ずっと無料であそべます</span></header>
  <main>
    <section id="gacha" class="hero" aria-labelledby="hero-title">
      <div class="hero-copy"><div class="eyebrow"><span></span> A LITTLE SURPRISE, JUST FOR YOU</div><h1 id="hero-title">小さな出会いを、<br>ポケットに<span class="heading-dot">。</span></h1><p class="hero-description">まわして、出会って、集めよう。<br>何が出るかは、開けてからのお楽しみ。</p><div class="series-tag"><span>VOL. 01</span> ちいさなともだち <span class="tag-total">全${items.length}種類</span></div><div class="mini-friends" aria-hidden="true"><span>✦</span><p>なんでもない日に、<br><strong>ちょっとした、ときめきを。</strong></p></div></div>
      <div class="play-area"><div class="stage"><span class="stage-orbit orbit-one"></span><span class="stage-orbit orbit-two"></span><span class="spark spark-one">✧</span><span class="spark spark-two">✦</span><span class="stage-note">なにが出るかな？</span><span class="rare-sticker">きらっと出会える<br><strong>レアなともだちも！</strong><span>✧</span></span>
        <div class="machine" aria-hidden="true"><div class="machine-cap"><span>POCKET GACHA</span></div><div class="machine-globe"><div class="glass-shine"></div><div class="globe-label">little<br><em>friends.</em><small>COLLECTION 01</small></div>${Array.from({ length: 8 }, (_, i) => `<span class="toy-ball ball-${i}"></span>`).join("")}</div><div class="machine-base"><div class="machine-plaque">TURN FOR A LITTLE HAPPINESS</div><div class="machine-controls"><span class="coin-slot"></span><span class="handle"><i></i></span><span class="turn-arrow">↻</span></div><div class="machine-opening"><span class="dispensed-ball"></span></div><span class="machine-foot left"></span><span class="machine-foot right"></span></div></div><div class="machine-shadow"></div>
      </div><button id="draw" class="draw-button">${capsuleIcon}<span>ガチャをひく</span><span aria-hidden="true">↗</span></button><p class="draw-caption" id="draw-status" role="status">何回でも無料 <span>•</span> ひとまわし、ひとつの出会い</p></div>
    </section>
    <section class="collection-section" id="collection" aria-labelledby="collection-title"><div class="collection-heading"><div><div class="eyebrow">YOUR LITTLE TREASURES</div><h2 id="collection-title">マイコレクション<span id="unique-count">0 / ${items.length}</span></h2></div><div class="collection-actions"><span>まわした回数 <strong id="total-count">0</strong><small> 回</small></span><button id="rates-button" class="text-button">ラインナップ・提供割合 <span aria-hidden="true">↗</span></button></div></div><div class="progress-track" role="progressbar" aria-label="コレクション達成率" aria-valuemin="0" aria-valuemax="${items.length}" aria-valuenow="0"><span id="progress"></span></div><div class="filter-bar"><div role="group" aria-label="コレクションの絞り込み"><button class="filter active" data-filter="all" aria-pressed="true">すべて</button><button class="filter" data-filter="owned" aria-pressed="false">獲得済み</button></div><p id="collection-message">あなたの小さなコレクション、ここから。</p></div><div class="item-grid" id="item-grid"></div><p id="empty-message" class="empty-message" hidden>まだ、ともだちはいないみたい。<br>最初のガチャをひいてみよう！</p><p class="storage-note" id="storage-note" role="status">◈ コレクションは、このブラウザーに自動で保存されます。</p></section>
  </main><footer><a class="footer-brand" href="#">POCKET GACHA</a><span>ひとつずつ、好きがふえていく。</span><small>JUST PLAY. NO PAY.</small></footer>
  <dialog id="draw-dialog" class="draw-dialog" aria-labelledby="sequence-title" data-phase="idle">
    <div class="sequence-toolbar">${soundButton}<button id="skip-animation" class="text-button">演出をスキップ ↗</button></div>
    <div class="eyebrow">A LITTLE MOMENT OF MAGIC</div>
    <h2 id="sequence-title" tabindex="-1">くるくる、わくわく。</h2>
    <div class="capsule-stage">
      <div class="delivery-chute" aria-hidden="true"><span>POCKET EXPRESS</span><i></i></div>
      <div class="mixing-balls" aria-hidden="true">${Array.from({ length: 5 }, (_, i) => `<i style="--ball:${i}"></i>`).join("")}</div>
      <div class="rare-beams" aria-hidden="true"></div>
      <div class="capsule-halo" aria-hidden="true"></div>
      <div id="capsule-prize" class="capsule-prize" aria-hidden="true"></div>
      <div class="impact-ring" aria-hidden="true"></div>
      <div class="capsule-particles" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<span style="--particle:${i}">✦</span>`).join("")}</div>
      <button id="open-capsule" class="big-capsule" aria-label="カプセルを開ける" disabled>
        <span class="capsule-half capsule-top"></span><span class="capsule-half capsule-bottom"></span><span class="capsule-seam" aria-hidden="true"></span><span class="capsule-seal" aria-hidden="true">✦</span>
      </button>
      <div class="capsule-ground" aria-hidden="true"></div>
    </div>
    <p id="sequence-caption" role="status">ちいさな出会いを、準備しています。</p>
    <div class="sequence-steps" aria-hidden="true"><span>01 まわす</span><i></i><span>02 あける</span><i></i><span>03 であう</span></div>
  </dialog>
  <dialog id="result-dialog" class="result-dialog" aria-labelledby="result-title"><div class="result-radiance" aria-hidden="true"></div><div class="result-sound">${soundButton}</div><button class="close-button" aria-label="結果を閉じる">×</button><div class="result-confetti" aria-hidden="true">${Array.from({ length: 36 }, (_, i) => `<i style="--confetti:${i}"></i>`).join("")}</div><div id="result-content"></div><button id="again" class="draw-button">もう一度ひく <span aria-hidden="true">↗</span></button><button id="view-collection" class="text-button">コレクションを見る</button></dialog>
  <dialog id="rates-dialog" aria-labelledby="rates-title"><button class="close-button" aria-label="提供割合を閉じる">×</button><div class="eyebrow">MEET YOUR LITTLE FRIENDS</div><h2 id="rates-title">ラインナップ・提供割合</h2><p class="dialog-description">ちいさなともだち / VOL. 01 · 全${items.length}種類<br>毎回、同じ確率で抽選します。重複して出ることもあります。</p><div class="rates-list">${items.map((item) => `<div><div class="rate-art">${art(item)}</div><span>${item.name}<small>${item.rarity === "rare" ? "✦ RARE" : "NORMAL"}</small></span><strong>${Number(probability(item).toFixed(3))}<small>%</small></strong></div>`).join("")}</div><p class="dialog-description">割合は小数第3位に丸めて表示しています。<br>回数による確率の変化や、レアの確定保証はありません。</p></dialog>`;

function element<T extends HTMLElement>(selector: string): T {
  return document.querySelector<T>(selector)!;
}

function art(item: Item): string {
  // Resolve public artwork against the page before placing it in a CSS custom
  // property. Relative url() values substituted from a custom property can be
  // resolved against the generated stylesheet on Pages, producing
  // /assets/assets/... instead of /assets/....
  const artworkUrl = new URL(item.art.url, document.baseURI).href;
  return `<div class="item-art" role="img" aria-label="${item.name}" style="--art-image:url('${artworkUrl}');--art-position:${item.art.position};--art-size:${item.art.size}"></div>`;
}

let collection: Collection = {};
let storageFailed = false;
try {
  collection = parseCollection(localStorage.getItem(storageKey));
} catch {
  storageFailed = true;
}
let filter: "all" | "owned" = "all";
let drawing = false;
const resultDialog = element<HTMLDialogElement>("#result-dialog");
const ratesDialog = element<HTMLDialogElement>("#rates-dialog");
const drawButton = element<HTMLButtonElement>("#draw");
const drawDialog = element<HTMLDialogElement>("#draw-dialog");
const openCapsule = element<HTMLButtonElement>("#open-capsule");
let pendingResult: { item: Item; isNew: boolean; preview: boolean } | undefined;
let lastPreview: Item["rarity"] | undefined;
let revealSoundPlayed = false;
element("#draw-status").insertAdjacentHTML(
  "afterend",
  `
  <div class="motion-settings"><label for="motion-preference">演出の動き</label><select id="motion-preference"><option value="auto">自動（OSに合わせる）</option><option value="full">しっかり再生</option><option value="reduced">ひかえめ</option></select></div>
  <p id="motion-hint" class="motion-hint" hidden>現在は動きを省略しています。アニメーションを見るには「しっかり再生」を選んでください。</p>
  <div class="preview-buttons"><span>演出おためし</span><button id="preview-normal" class="text-button">通常</button><button id="preview-rare" class="text-button">✦ レア</button><small>アイテムは増えません</small></div>`,
);
const motionSelect = element<HTMLSelectElement>("#motion-preference");
const systemMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let motionPreference = parseMotionPreference(null);
try {
  motionPreference = parseMotionPreference(
    localStorage.getItem(motionStorageKey),
  );
} catch {
  /* Use system default. */
}
motionSelect.value = motionPreference;
function applyMotionPreference() {
  if (drawing) return;
  document.documentElement.dataset.motion = shouldReduceMotion(
    motionPreference,
    systemMotion.matches,
  )
    ? "reduced"
    : "full";
  element("#motion-hint").hidden =
    document.documentElement.dataset.motion !== "reduced";
}
motionSelect.addEventListener("change", () => {
  motionPreference = parseMotionPreference(motionSelect.value);
  try {
    localStorage.setItem(motionStorageKey, motionPreference);
  } catch {
    /* Keep session preference. */
  }
  applyMotionPreference();
});
systemMotion.addEventListener("change", applyMotionPreference);
applyMotionPreference();
const sound = new SoundEffects(undefined, updateSoundButtons);
try {
  sound.setEnabled(readSoundPreference(localStorage.getItem(soundStorageKey)));
} catch {
  // Preferences are optional; collection storage errors are reported separately.
}
const sequence = new DrawSequence(onDrawPhase);

function updateSoundButtons() {
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-sound]",
  )) {
    button.setAttribute(
      "aria-pressed",
      String(sound.enabled && sound.available),
    );
    button.disabled = !sound.available;
    button.title = sound.available
      ? "効果音のON / OFF"
      : "このブラウザーでは音声を再生できません。音なしで遊べます。";
    button.lastElementChild!.textContent = !sound.available
      ? "音声なし"
      : sound.enabled
        ? "音 ON"
        : "音 OFF";
  }
}

for (const button of document.querySelectorAll("[data-sound]")) {
  button.addEventListener("click", () => {
    sound.setEnabled(!sound.enabled);
    if (sound.enabled) void sound.unlock();
    try {
      localStorage.setItem(soundStorageKey, sound.enabled ? "on" : "off");
    } catch {
      /* Keep the preference for this session. */
    }
    updateSoundButtons();
  });
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) sound.stop();
});
window.addEventListener("pagehide", () => sound.stop());
updateSoundButtons();

function renderCollection() {
  const { total, unique } = stats(collection);
  element("#total-count").textContent = String(total);
  element("#unique-count").textContent = `${unique} / ${items.length}`;
  element("#nav-count").textContent = String(unique);
  element("#progress").style.width = `${(unique / items.length) * 100}%`;
  element(".progress-track").setAttribute("aria-valuenow", String(unique));
  element("#collection-message").textContent =
    unique === items.length
      ? "コンプリート！ みんな、あなたのともだち。"
      : unique > 0
        ? `あと${items.length - unique}種類の、新しい出会い。`
        : "あなたの小さなコレクション、ここから。";
  const visibleItems = items.filter(
    (item) => filter === "all" || (collection[item.id] ?? 0) > 0,
  );
  element("#item-grid").innerHTML = visibleItems
    .map((item) => {
      const count = collection[item.id] ?? 0;
      return `<article class="item-card ${count ? "owned" : "unowned"} ${item.rarity}" style="--item-color:${item.color}"><div class="card-top"><span class="rarity">${item.rarity === "rare" ? "✦ RARE" : "NORMAL"}</span><span class="count">${count ? `× ${count}` : "未獲得"}</span></div><div class="card-art">${art(item)}${count ? "" : '<span class="locked-label">? <span>まだ出会っていません</span></span>'}</div><div class="card-info"><small>${item.englishName}</small><h3>${item.name}</h3></div></article>`;
    })
    .join("");
  element("#empty-message").hidden = visibleItems.length > 0;
  if (storageFailed) {
    element("#storage-note").textContent =
      "保存データを読み書きできませんでした。現在の画面では遊べますが、再読み込みすると記録を失う場合があります。";
    element("#storage-note").classList.add("warning");
  }
}

function saveCollection() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(collection));
  } catch {
    storageFailed = true;
  }
}

function draw(previewRarity?: Item["rarity"]) {
  if (drawing) return;
  drawing = true;
  drawButton.disabled = true;
  motionSelect.disabled = true;
  resultDialog.close();
  const item = previewRarity
    ? items.find((item) => item.rarity === previewRarity)!
    : drawItem();
  const isNew = !collection[item.id];
  pendingResult = { item, isNew, preview: previewRarity !== undefined };
  revealSoundPlayed = false;
  lastPreview = previewRarity;
  // Record before animation: closing/reloading during the animation never loses a draw.
  if (!previewRarity) {
    collection = addItem(collection, item);
    saveCollection();
  }
  element("#capsule-prize").innerHTML = art(item);
  element("#capsule-prize").setAttribute("aria-hidden", "true");
  element(".play-area").classList.add("drawing");
  element("#draw-status").textContent = "くるくる… だれに出会えるかな？";
  drawButton.querySelector("span:nth-child(2)")!.textContent = "お楽しみ…";
  drawDialog.showModal();
  element("#sequence-title").focus();
  void sound.unlock().then(() => {
    if (sequence.phase === "rolling" && !document.hidden) sound.play("roll");
  });
  sequence.start(
    shouldReduceMotion(motionPreference, systemMotion.matches),
    item.rarity === "rare",
  );
}

function onDrawPhase(phase: DrawPhase) {
  for (const [key, duration] of Object.entries(sequence.timings)) {
    drawDialog.style.setProperty(`--${key}-duration`, `${duration}ms`);
  }
  drawDialog.dataset.phase = phase;
  drawDialog.classList.toggle(
    "rare-capsule",
    phase !== "rolling" && pendingResult?.item.rarity === "rare",
  );
  openCapsule.disabled = phase !== "ready";
  if (phase === "rolling") {
    element("#sequence-title").textContent = "くるくる、わくわく。";
    element("#sequence-caption").textContent =
      "ちいさな出会いを、準備しています。";
  } else if (phase === "omen") {
    element("#sequence-title").textContent = "あれ…？ 空気が変わった。";
    element("#sequence-caption").textContent = "特別な出会いが、近づいている。";
    if (!document.hidden) sound.play("omen");
  } else if (phase === "dropping") {
    element("#sequence-title").textContent = "ころころ、ぽんっ！";
    element("#sequence-caption").textContent =
      "あなたのもとへ、カプセルが到着。";
    if (!document.hidden) sound.play("drop");
  } else if (phase === "ready") {
    element("#sequence-title").textContent =
      pendingResult?.item.rarity === "rare"
        ? "あれ？ 特別なきらめき…！"
        : "どんな出会いが、待ってる？";
    element("#sequence-caption").textContent =
      "カプセルをタップして、あけよう。";
    if (document.activeElement === element("#sequence-title"))
      openCapsule.focus();
    if (!document.hidden) sound.play("ready");
  } else if (phase === "cracking") {
    element("#sequence-title").textContent = "なかから、光が…！";
    element("#sequence-caption").textContent = "もうすぐ、会える。";
    if (!document.hidden) sound.play("charge");
  } else if (phase === "opening") {
    element("#sequence-title").textContent = "小さな出会いが、ひらく。";
    element("#sequence-caption").textContent = "ぱかっ！";
    if (!document.hidden)
      sound.play(pendingResult?.item.rarity === "rare" ? "rare-open" : "open");
  } else if (phase === "revealing") {
    element("#sequence-title").textContent = pendingResult!.item.name;
    element("#sequence-caption").textContent =
      pendingResult!.item.rarity === "rare"
        ? "✦ RARE FRIEND · とっておきの出会い！"
        : "こんにちは、新しいともだち。";
    element("#capsule-prize").setAttribute("aria-hidden", "false");
    if (!document.hidden) sound.play(pendingResult!.item.rarity);
    revealSoundPlayed = true;
  } else if (phase === "result") {
    showResult();
  }
}

function showResult() {
  if (!pendingResult) return;
  const { item, isNew, preview } = pendingResult;
  pendingResult = undefined;
  if (!revealSoundPlayed) sound.stop();
  drawDialog.close();
  element(".play-area").classList.remove("drawing");
  renderCollection();
  resultDialog.classList.toggle("rare-result", item.rarity === "rare");
  element("#result-content").innerHTML =
    `<div class="eyebrow">${preview ? "ANIMATION PREVIEW" : isNew ? "NEW FRIEND!" : "HELLO AGAIN!"}</div><div class="result-art">${art(item)}<span class="result-spark one">✧</span><span class="result-spark two">✦</span></div><span class="result-rarity">${item.rarity === "rare" ? "✦ RARE · 特別な出会い" : "NORMAL · ちいさなともだち"}</span><h2 id="result-title">${item.name}</h2><p>${item.description}</p><div class="result-count">${preview ? "演出のおためしです。アイテムは増えません。" : `${isNew ? "はじめての出会い！" : "また会えたね！"} <span>所持数 × ${collection[item.id]}</span>`}</div>`;
  element("#again").innerHTML =
    `${preview ? "もう一度見る" : "もう一度ひく"} <span aria-hidden="true">↗</span>`;
  resultDialog.showModal();
  if (!document.hidden && !revealSoundPlayed) sound.play(item.rarity);
  element("#draw-status").textContent = preview
    ? "演出のおためしが終わりました。"
    : `${item.name}をお迎えしました！`;
  drawButton.querySelector("span:nth-child(2)")!.textContent = "ガチャをひく";
  drawButton.disabled = false;
  drawing = false;
  motionSelect.disabled = false;
  applyMotionPreference();
}

drawButton.addEventListener("click", () => draw());
element("#again").addEventListener("click", () => draw(lastPreview));
element("#preview-normal").addEventListener("click", () => draw("normal"));
element("#preview-rare").addEventListener("click", () => draw("rare"));
openCapsule.addEventListener("click", () => sequence.open());
element("#skip-animation").addEventListener("click", () => sequence.skip());
drawDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  sequence.skip();
});
resultDialog.addEventListener("close", () => {
  if (!drawing) sound.stop();
});
element("#rates-button").addEventListener("click", () =>
  ratesDialog.showModal(),
);
element("#view-collection").addEventListener("click", () => {
  resultDialog.close();
  element("#collection").scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
});
for (const dialog of [resultDialog, ratesDialog]) {
  dialog
    .querySelector(".close-button")!
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        dialog.close();
    }
  });
}
for (const button of document.querySelectorAll<HTMLButtonElement>(
  "[data-filter]",
)) {
  button.addEventListener("click", () => {
    filter = button.dataset.filter as typeof filter;
    for (const sibling of document.querySelectorAll("[data-filter]")) {
      const active = sibling === button;
      sibling.classList.toggle("active", active);
      sibling.setAttribute("aria-pressed", String(active));
    }
    renderCollection();
  });
}
renderCollection();
