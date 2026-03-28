
// ===== RELEASES FROM JSON =====
// latest order support
function formatReleaseDate(iso) {
 if (iso === null) return "";
 if (iso === undefined) return "";
 if (iso === "") return "";
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
 "December"
 ];
 var day = String(d.getDate()).padStart(2, "0");
 return months[d.getMonth()] + " " + day + " | " + d.getFullYear();
}

function buildReleaseCard(release) {
 var link = document.createElement("a");
 link.className = "release-card";
 link.href = release.slug ? "release.html?slug=" + encodeURIComponent(release.slug) : release.page;

 var cover = document.createElement("div");
 cover.className = "release-cover";

 var img = document.createElement("img");
 img.src = release.cover;
 img.alt = release.title;
 cover.appendChild(img);
 link.appendChild(cover);

 var title = document.createElement("div");
 title.className = "release-title";
 title.textContent = release.title;
 link.appendChild(title);

 var meta = document.createElement("div");
 meta.className = "release-meta";
 meta.textContent = formatReleaseDate(release.date);
 link.appendChild(meta);

 var type = document.createElement("div");
 type.className = "release-type";
 type.textContent = release.type;
 link.appendChild(type);

 return link;
}

function buildLatestCard(release) {
 var card = document.createElement("div");
 card.className = "latest-card";
 card.setAttribute("data-full-title", release.title || "");

 var cover = document.createElement("div");
 cover.className = "latest-cover";
 var img = document.createElement("img");
 img.src = release.cover;
 img.alt = release.title;
 cover.appendChild(img);
 card.appendChild(cover);

 var info = document.createElement("div");
 info.className = "latest-info";

 var titleRow = document.createElement("div");
 titleRow.className = "latest-title-row";

 var title = document.createElement("div");
 title.className = "latest-title";
 title.textContent = release.title;
 title.setAttribute("title", release.title);
 titleRow.appendChild(title);

 var type = (release.type || "").toUpperCase();
 var typeLabel = "";
 if (type === "EP") {
  typeLabel = "EP";
 } else if (type === "ALBUM") {
  typeLabel = "AL";
 }
 if (typeLabel) {
  var typeBadge = document.createElement("span");
  typeBadge.className = "latest-type";
  typeBadge.textContent = typeLabel;
  titleRow.appendChild(typeBadge);
 }

 info.appendChild(titleRow);

 var artist = document.createElement("div");
 artist.className = "latest-artist";
 artist.textContent = release.artist;
 info.appendChild(artist);

 var date = document.createElement("div");
 date.className = "latest-date";
 date.textContent = formatReleaseDate(release.date);
 info.appendChild(date);

 card.appendChild(info);

 card.addEventListener("click", function () {
 window.location.href = release.slug ? "release.html?slug=" + encodeURIComponent(release.slug) : release.page;
 });

 return card;
}

fetch("data/releases.json")
 .then(function (res) {
 return res.json();
 })
 .then(function (payload) {
 var releases = payload.releases;
 if (!releases) {
 releases = new Array();
 }
 var grids = document.querySelectorAll(".release-grid[data-artist-grid]");
 var latestContainer = document.getElementById("latest-container");

 releases.sort(function (a, b) {
 return new Date(b.date) - new Date(a.date);
 });

 var byArtist = {};
 releases.forEach(function (r) {
 if (byArtist[r.artist] === undefined) {
 byArtist[r.artist] = [];
 }
 byArtist[r.artist].push(r);
 });

 var i = 0;
 while (i !== grids.length) {
 var grid = grids[i];
 var artist = grid.dataset.artistGrid;
 var list = byArtist[artist];
 if (list === undefined) {
 list = new Array();
 }
 grid.innerHTML = "";

 if (list.length === 0) {
 var empty = document.createElement("div");
 empty.className = "release-empty";
 empty.textContent = "SOON";
 grid.appendChild(empty);
 i = i + 1;
 continue;
 }

 var j = 0;
 while (j !== list.length) {
 grid.appendChild(buildReleaseCard(list[j]));
 j = j + 1;
 }

 i = i + 1;
 }

 if (latestContainer) {
 latestContainer.innerHTML = "";
 var latest = releases.slice();
 latest.sort(function (a, b) {
  return new Date(b.date) - new Date(a.date);
 });
 latest = latest.slice(0, 5);
 var k = 0;
 while (k !== latest.length) {
  var card = buildLatestCard(latest[k]);
  if (k === 0) {
   var badge = document.createElement("div");
   badge.className = "latest-badge";
   badge.textContent = "NEW";
   var cover = card.querySelector(".latest-cover");
   if (cover) {
    cover.appendChild(badge);
   } else {
    card.appendChild(badge);
   }
  }
 latestContainer.appendChild(card);
 k = k + 1;
 }

 // ensure the first card is fully visible
 latestContainer.scrollLeft = 0;

 // tooltip for full titles
 var tooltip = document.getElementById("latest-tooltip");
 if (!tooltip) {
  tooltip = document.createElement("div");
  tooltip.id = "latest-tooltip";
  tooltip.className = "latest-tooltip";
  document.body.appendChild(tooltip);
 }

 function getZoom() {
  var z = 1;
  try {
   var v = window.getComputedStyle(document.body).zoom;
   var n = parseFloat(v);
   if (!isNaN(n) && n > 0) z = n;
  } catch (e) {}
  return z;
 }

 function showTooltip(text, x, y) {
  if (!text) return;
  tooltip.textContent = text;
  tooltip.style.opacity = "1";
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
 }

 function hideTooltip() {
  tooltip.style.opacity = "0";
 }

 latestContainer.querySelectorAll(".latest-card").forEach(function (cardEl) {
  cardEl.addEventListener("mouseenter", function (e) {
   var text = cardEl.getAttribute("data-full-title") || "";
   var z = getZoom();
   showTooltip(text, (e.clientX + 4) / z, (e.clientY + 6) / z);
  });
  cardEl.addEventListener("mousemove", function (e) {
   var text = cardEl.getAttribute("data-full-title") || "";
   var z = getZoom();
   showTooltip(text, (e.clientX + 4) / z, (e.clientY + 6) / z);
  });
  cardEl.addEventListener("mouseleave", function () {
   hideTooltip();
  });
 });

 var carousel = document.getElementById("latest-carousel");
 var prevBtn = document.getElementById("latest-prev");
 var nextBtn = document.getElementById("latest-next");

 function updateLatestNav() {
  if (!carousel || !latestContainer) return;
  var maxScroll = latestContainer.scrollWidth - latestContainer.clientWidth;
  if (maxScroll <= 0) {
   carousel.classList.remove("can-scroll-left");
   carousel.classList.remove("can-scroll-right");
   return;
  }
  if (latestContainer.scrollLeft > 2) {
   carousel.classList.add("can-scroll-left");
  } else {
   carousel.classList.remove("can-scroll-left");
  }
  if (latestContainer.scrollLeft < maxScroll - 2) {
   carousel.classList.add("can-scroll-right");
  } else {
   carousel.classList.remove("can-scroll-right");
  }
 }

 if (prevBtn) {
  prevBtn.addEventListener("click", function () {
   latestContainer.scrollBy({ left: -latestContainer.clientWidth * 0.8, behavior: "smooth" });
  });
 }
 if (nextBtn) {
  nextBtn.addEventListener("click", function () {
   latestContainer.scrollBy({ left: latestContainer.clientWidth * 0.8, behavior: "smooth" });
  });
 }

 latestContainer.addEventListener("scroll", updateLatestNav);
 window.addEventListener("resize", updateLatestNav);
 setTimeout(updateLatestNav, 0);
 }
 })
 .catch(function (err) {
 console.error("Releases JSON error:", err);
 });
