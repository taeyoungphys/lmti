/* 결과 페이지와 연구실 목록이 같이 쓰는 화면 조각 */
(function (root) {
  var LMTI = (root.LMTI = root.LMTI || {});

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function badge(lab) {
    var r = lab.recruit || "";
    var cls = /안 함/.test(r) ? "closed" : /만 모집/.test(r) ? "partial" : "open";
    return '<span class="badge ' + cls + '">' + esc(r) + "</span>";
  }

  function logo(lab, cls) {
    return '<img class="' + (cls || "logo") + '" src="' + esc(lab.logo) + '" alt="' + esc(lab.code) +
      ' 로고" width="56" height="56" loading="lazy">';
  }

  function head(lab) {
    var full = [lab.nameKo, lab.name].filter(Boolean).join(" · ");
    return '<div class="pick-head">' + logo(lab) + "<div>" +
      "<h3>" + esc(lab.code) + "</h3>" +
      (full ? '<p class="pick-name">' + esc(full) + "</p>" : "") +
      '<p class="pick-meta">' + esc(lab.professor) + " 교수 · " + badge(lab) + "</p>" +
      "</div></div>";
  }

  function chips(list) {
    return '<ul class="chips">' + (list || []).map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + "</ul>";
  }

  function detail(lab, opts) {
    var rows = [];
    if (!(opts && opts.noKeywords)) rows.push(["연구 키워드", chips(lab.keywords)]);
    rows = rows.concat([
      ["어떤 연구실인가요?", esc(lab.intro)],
      ["이런 점이 좋아요", esc(lab.strength)],
      ["연구실 분위기", chips(lab.mood)],
      ["연구실 문화", esc(lab.culture)],
      ["이런 학생과 잘 맞아요", esc(lab.fit)],
      ["학부생에게 한마디", '<span class="quote">' + esc(lab.message) + "</span>"]
    ]);
    return '<dl class="detail">' + rows.map(function (r) {
      return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>";
    }).join("") + "</dl>";
  }

  function meter(score, label) {
    return '<div class="meter"><div class="meter-top">' +
      '<span class="meter-label">' + esc(label) + "</span>" +
      '<span class="meter-score">' + score + " <small>/ 100</small></span></div>" +
      '<div class="meter-bar" role="img" aria-label="가까움 ' + score + '점"><span style="width:' + score + '%"></span></div></div>';
  }

  function toast(msg) {
    var t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove("show"); }, 2000);
  }

  // 연구실 목록 카드 (결과지 맨 아래 · labs.html 공용)
  function labCard(lab) {
    if (lab.status === "empty") {
      return '<article class="lab-card empty" style="--lab:' + esc(lab.color) + '">' + head(lab) +
        '<p class="empty-note">소개를 준비하고 있어요.</p></article>';
    }
    return '<article class="lab-card" style="--lab:' + esc(lab.color) + '">' + head(lab) +
      '<p class="one-liner">“' + esc(lab.oneLiner) + '”</p>' + chips(lab.keywords) +
      '<details class="lab-more"><summary>자세히 보기</summary>' + detail(lab, { noKeywords: true }) + "</details></article>";
  }

  LMTI.ui = { esc: esc, badge: badge, logo: logo, head: head, chips: chips, detail: detail, meter: meter, toast: toast, labCard: labCard };
})(typeof window !== "undefined" ? window : globalThis);
