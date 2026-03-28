// Unified release page renderer
(function () {
  var licensingHtml =
    '<div class="license-title">MUSIC USE &amp; LICENSING INFO</div>' +
    '<ul class="license-list">' +
    '<li>all tracks safe for stream &amp; video use and may be used by independent streamers, video creators, animators, etc for their work</li>' +
    '<li>for use in games or film please contact amodeyaaa@gmail.com</li>' +
    '<li>for additional licensing information please contact amodeyaaa@gmail.com</li>' +
    '<li>credit / links back are appreciated if music is used ❤</li>' +
    "</ul>";
  var params = new URLSearchParams(window.location.search);
  var slug = params.get("slug");

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text || "";
  }

  function setAttr(id, attr, value) {
    var el = document.getElementById(id);
    if (el) el.setAttribute(attr, value || "");
  }

  function hide(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = "none";
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    var months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    var day = String(d.getDate()).padStart(2, "0");
    return months[d.getMonth()] + " " + day + ", " + d.getFullYear();
  }

  function buildTracklist(tracks, fallbackTitle) {
    var list = document.getElementById("release-tracklist");
    if (!list) return;
    list.innerHTML = "";

    var useTracks = Array.isArray(tracks) && tracks.length ? tracks : [{ name: fallbackTitle, duration: "--:--" }];
    for (var i = 0; i < useTracks.length; i++) {
      var tr = document.createElement("div");
      tr.className = "release-track";

      var num = document.createElement("span");
      num.className = "track-number";
      num.textContent = String(i + 1) + ".";

      var name = document.createElement("span");
      name.className = "track-name";
      name.textContent = useTracks[i].name || ("Track " + (i + 1));

      var dur = document.createElement("span");
      dur.className = "track-duration";
      dur.textContent = useTracks[i].duration || "--:--";

      tr.appendChild(num);
      tr.appendChild(name);
      tr.appendChild(dur);
      list.appendChild(tr);
    }
  }

  fetch("data/releases.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (payload) {
      var releases = payload.releases || [];
      if (!slug) return;

      var item = null;
      for (var i = 0; i < releases.length; i++) {
        if (releases[i].slug === slug) {
          item = releases[i];
          break;
        }
      }
      if (!item) return;

      setText("release-title", item.title);
      setText("release-artist", item.artist);
      setText("release-desc", item.description || "");
      setText("release-meta", (item.type || "SINGLE") + " | " + formatDate(item.date));
      setAttr("release-cover", "src", item.cover || "");
      setAttr("release-cover", "alt", (item.title || "Release") + " cover");

      var artistEl = document.getElementById("release-artist");
      if (artistEl) {
        var aliasMap = {
          "ALTERNATIVE ZERO": "alternative-zero",
          "AMODEYA": "amodeya",
          "adminGRL": "admingrl",
          "ARLEKYN": "arlekyN",
        };
        var tab = aliasMap[item.artist] || "";
        if (tab) {
          artistEl.innerHTML = '<a href="index.html#music" class="release-artist-link">' + item.artist + "</a>";
          artistEl.querySelector("a").addEventListener("click", function () {
            // Let hash change happen, then tab will be restored by scripts.js
            localStorage.setItem("activeMusicTab", tab);
          });
        }
      }

      var listenUrl = item.listenUrl || "";
      var downloadUrl = item.downloadMp3Url || item.downloadUrl || item.downloadWavUrl || "";

      if (listenUrl) {
        setAttr("listen-btn", "href", listenUrl);
      } else {
        setAttr("listen-btn", "href", "#");
        document.getElementById("listen-btn")?.classList.add("btn-disabled");
      }

      if (downloadUrl) {
        setAttr("download-btn", "href", downloadUrl);
      } else {
        setAttr("download-btn", "href", "#");
        document.getElementById("download-btn")?.classList.add("btn-disabled");
      }

      buildTracklist(item.tracks, item.title);

      var licenseEl = document.getElementById("release-licensing");
      if (licenseEl) {
        licenseEl.innerHTML = licensingHtml;
      }
    })
    .catch(function () {});
})();
