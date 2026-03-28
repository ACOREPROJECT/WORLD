// ================== РќРђР’РР“РђР¦РРЇ РџРћ РЎР•РљР¦РРЇРњ ==================
const sections = document.querySelectorAll("section");

function showSectionByHash() {
  const hash = window.location.hash.substring(1) || "home";
  sections.forEach((sec) => sec.classList.toggle("active", sec.id === hash));
  document.body.classList.toggle("home-active", hash === "home");
}

window.addEventListener("load", showSectionByHash);
window.addEventListener("hashchange", showSectionByHash);

// ================== Р’РљР›РђР”РљР РњРЈР—Р«РљР ==================
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

function activateTab(tabId) {
  tabButtons.forEach((b) => b.classList.remove("active"));
  tabPanels.forEach((p) => p.classList.remove("active"));

  document
    .querySelector(`.tab-btn[data-tab="${tabId}"]`)
    ?.classList.add("active");

  document.getElementById(tabId)?.classList.add("active");

  // вњ… СЃРѕС…СЂР°РЅСЏРµРј Р°РєС‚РёРІРЅСѓСЋ РІРєР»Р°РґРєСѓ
  localStorage.setItem("activeMusicTab", tabId);
}

// ================== ALIAS LINKS -> MUSIC TAB ==================
document.querySelectorAll(".alias-link").forEach((link) => {
  link.addEventListener("click", () => {
    const tabId = link.dataset.tab;
    if (!tabId) return;
    localStorage.setItem("activeMusicTab", tabId);
    setTimeout(() => activateTab(tabId), 0);
  });
});

tabButtons.forEach((btn) =>
  btn.addEventListener("click", () => activateTab(btn.dataset.tab)),
);

// ================== RESTORE MUSIC TAB ==================
const savedTab = localStorage.getItem("activeMusicTab");
if (savedTab && document.getElementById(savedTab)) {
  activateTab(savedTab);
}

// ================== STOP ALL AUDIO ==================
function stopAllAudio() {
  document.querySelectorAll(".custom-audio-player").forEach((player) => {
    const audio = player._audio;
    const btn = player.querySelector(".play-btn");
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (btn) btn.textContent = "в–¶";
  });
}

// ================== РђРЈР”РРћ РџР›Р•Р•Р  ==================
let currentAudio = null;
let currentPlayBtn = null;

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".custom-audio-player").forEach((player) => {
    const audio = new Audio(player.dataset.src);
    player._audio = audio;

    const playBtn = player.querySelector(".play-btn");
    const progressBar = player.querySelector(".progress-bar");
    const progressContainer = player.querySelector(".progress-container");
    const currentTimeEl = player.querySelector(".current");
    const durationEl = player.querySelector(".duration");
    const volumeSlider = player.querySelector(".volume-slider");

    let isPlaying = false;
    let isDragging = false;

    audio.volume = volumeSlider?.value || 0.5;

    playBtn.addEventListener("click", () => {
      if (!isPlaying) {
        if (currentAudio && currentAudio !== audio) {
          currentAudio.pause();
          currentPlayBtn.textContent = "в–¶";
        }
        audio.play();
        playBtn.textContent = "вЏё";
        isPlaying = true;
        currentAudio = audio;
        currentPlayBtn = playBtn;
        requestAnimationFrame(updateProgress);
      } else {
        audio.pause();
        playBtn.textContent = "в–¶";
        isPlaying = false;
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      durationEl.textContent = formatTime(audio.duration);
    });

    function updateProgress() {
      if (isPlaying && !isDragging) {
        progressBar.style.width =
          (audio.currentTime / audio.duration) * 100 + "%";
        currentTimeEl.textContent = formatTime(audio.currentTime);
      }
      if (isPlaying) requestAnimationFrame(updateProgress);
    }

    progressContainer.addEventListener("mousedown", (e) => {
      isDragging = true;
      const rect = progressContainer.getBoundingClientRect();

      function seek(e) {
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        audio.currentTime = (x / rect.width) * audio.duration;
      }

      seek(e);

      function up() {
        isDragging = false;
        window.removeEventListener("mousemove", seek);
        window.removeEventListener("mouseup", up);
      }

      window.addEventListener("mousemove", seek);
      window.addEventListener("mouseup", up);
    });

    volumeSlider?.addEventListener("input", () => {
      audio.volume = volumeSlider.value;
    });

    audio.addEventListener("ended", () => {
      playBtn.textContent = "в–¶";
      isPlaying = false;
    });

    function formatTime(sec) {
      if (!sec || isNaN(sec)) return "0:00";
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60)
        .toString()
        .padStart(2, "0");
      return `${m}:${s}`;
    }
  });

  // ================== LATEST RELEASES ==================

  const latestContainer = document.getElementById("latest-container");
  if (!latestContainer) return;

  latestContainer.innerHTML = "";

  document.querySelectorAll(".track-row").forEach((track) => {
    const trackId = track.dataset.track;
    if (!trackId) return;

    const tabPanel = track.closest(".tab-panel");
    if (!tabPanel) return;

    const tabId = tabPanel.id;

    const cover = track.querySelector(".track-cover")?.src || "";
    const title = track.querySelector(".track-title")?.textContent || "";
    const artist =
      track.querySelector(".track-meta")?.childNodes[0]?.textContent.trim() ||
      "";
    const date = track.querySelector(".track-date")?.textContent || "";

    const card = document.createElement("div");
    card.className = "latest-card";

    card.innerHTML = `
      <div class="latest-cover">
        <img src="${cover}" alt="${title}">
      </div>
      <div class="latest-info">
        <div class="latest-title">${title}</div>
        <div class="latest-artist">${artist}</div>
        <div class="latest-date">${date}</div>
      </div>
    `;

    card.addEventListener("click", () => {
      stopAllAudio();

      // рџ‘‰ РџР•Р Р•РҐРћР”РРњ Р’ MUSIC Р§Р•Р Р•Р— HASH
      window.location.hash = "music";

      // рџ‘‰ Р°РєС‚РёРІРёСЂСѓРµРј РІРєР»Р°РґРєСѓ Рё СЃРєСЂРѕР»Р»РёРј РїРѕСЃР»Рµ СЂРµРЅРґРµСЂР°
      setTimeout(() => {
        activateTab(tabId);

        const target = document.querySelector(
          `#${tabId} .track-row[data-track="${trackId}"]`,
        );
        if (!target) return;

        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("highlight-track");
        setTimeout(() => target.classList.remove("highlight-track"), 1200);
      }, 50);
    });

    latestContainer.appendChild(card);
  });
});

// ===== LATEST RELEASES FROM JSON =====
fetch("data/tracks.json")
  .then((res) => res.json())
  .then((tracks) => {
    const latestContainer = document.getElementById("latest-container");
    if (!latestContainer) return;

    latestContainer.innerHTML = "";

    tracks.forEach((track) => {
      const card = document.createElement("div");
      card.className = "latest-card";

      card.innerHTML = `
        <div class="latest-cover">
          <img src="${track.cover}" alt="${track.title}">
        </div>
        <div class="latest-info">
          <div class="latest-title">${track.title}</div>
          <div class="latest-artist">${track.artist}</div>
          <div class="latest-date">${track.date}</div>
        </div>
      `;

      card.addEventListener("click", () => {
        stopAllAudio();
        window.location.hash = "music";

        setTimeout(() => {
          activateTab(track.tab);

          const target = document.querySelector(
            `#${track.tab} .track-row[data-track="${track.id}"]`,
          );

          if (!target) return;

          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.classList.add("highlight-track");
          setTimeout(() => target.classList.remove("highlight-track"), 1200);
        }, 50);
      });

      latestContainer.appendChild(card);
    });
  })
  .catch((err) => console.error("Tracks JSON error:", err));


