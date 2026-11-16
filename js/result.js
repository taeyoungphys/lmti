/*
 * 결과 페이지: 주소의 ?r=코드 → 20개 답 복원 → 다시 계산 → 화면
 * 순서: 1) 나의 연애 성향  →  [버튼]  →  2) 반전: 사실은 연구실 궁합 테스트 → 추천 3곳 · 가까움 척도 · 참여 연구실
 */
(function () {
  var LMTI = window.LMTI;
  var ui = LMTI.ui;
  var $ = function (id) { return document.getElementById(id); };
  var answers = LMTI.match.decode(new URLSearchParams(location.search).get("r"));
  var r = answers && LMTI.match.compute(answers);

  if (!r || !r.first) {
    $("notFound").hidden = false;
    return;
  }

  // ---- 1. 나의 연애 성향 (축마다 오른쪽을 고른 개수 0~5) ----
  // 축마다 문항 수가 홀수(5)라서 어느 한쪽이 반드시 더 많다
  var right = [0, 0, 0, 0], per = [0, 0, 0, 0];
  LMTI.questions.forEach(function (q, i) { per[q.axis] += 1; if (answers[i] === 1) right[q.axis] += 1; });
  var isRight = function (k) { return right[k] * 2 > per[k]; };

  $("loveScales").innerHTML = LMTI.loveAxes.map(function (ax, k) {
    var n = right[k];
    var leftOn = !isRight(k);
    return '<div class="love-row">' +
      '<div class="love-labels">' +
      '<span class="' + (leftOn ? "on" : "") + '">' + ax.leftEmoji + " " + ui.esc(ax.left) + "</span>" +
      '<span class="' + (leftOn ? "" : "on") + '">' + ui.esc(ax.right) + " " + ax.rightEmoji + "</span>" +
      "</div>" +
      '<div class="love-track" role="img" aria-label="' + ui.esc(leftOn ? ax.left : ax.right) + ' 쪽">' +
      '<span class="love-dot" style="left:' + (8 + (84 * n) / per[k]).toFixed(1) + '%">💗</span></div>' +
      "</div>";
  }).join("");

  // ---- 2. 반전 ----
  $("mapList").innerHTML = LMTI.loveAxes.map(function (ax, k) {
    var pole = isRight(k) ? 1 : 0;
    var love = pole ? ax.rightEmoji + " " + ax.right : ax.leftEmoji + " " + ax.left;
    var lab = pole ? LMTI.axes[k].right : LMTI.axes[k].left;
    return "<li><span>" + ui.esc(love) + "</span><i>→</i><span>" + ui.esc(lab) + "</span></li>";
  }).join("");

  var picks = [
    { item: r.first, rank: "🥇 가장 잘 어울리는 연구실" },
    { item: r.second, rank: "🥈 두 번째로 잘 어울리는 연구실" },
    { item: r.worst, rank: "💔 가장 안 어울리는 연구실" }
  ];
  $("picks").innerHTML = picks.map(function (p) {
    var lab = p.item.lab;
    return '<article class="pick" style="--lab:' + ui.esc(lab.color) + '">' +
      '<div class="pick-rank">' + p.rank + "</div>" +
      ui.head(lab) +
      ui.meter(p.item.score, p.item.label) +
      '<p class="reason">' + ui.esc(p.item.reason.text) + "</p>" +
      '<p class="one-liner">“' + ui.esc(lab.oneLiner) + "”</p>" +
      '<details class="lab-more"><summary>' + ui.esc(lab.code) + " 자세히 보기</summary>" + ui.detail(lab) + "</details>" +
      "</article>";
  }).join("");

  $("scaleList").innerHTML = r.items.map(function (it) {
    var lab = it.lab;
    return '<li class="scale-item" style="--lab:' + ui.esc(lab.color) + '">' +
      '<img src="' + ui.esc(lab.logo) + '" alt="" width="40" height="40">' +
      "<div>" +
      '<div class="scale-row"><span class="scale-code">' + ui.esc(lab.code) + "</span>" +
      '<span class="scale-val">' + ui.esc(it.label) + " · <b>" + it.score + "</b></span></div>" +
      '<div class="meter-bar" role="img" aria-label="' + ui.esc(lab.code) + " 가까움 " + it.score + '점"><span style="width:' + it.score + '%"></span></div>' +
      "</div></li>";
  }).join("");

  var empty = LMTI.labs.filter(function (l) { return l.status === "empty"; }).map(function (l) { return l.code; });
  $("emptyNote").textContent = empty.length
    ? empty.join(" · ") + "은 소개를 준비하고 있어요. 준비되면 함께 비교해 드릴게요."
    : "";

  $("labList").innerHTML = LMTI.labs.filter(function (l) { return l.status !== "excluded"; }).map(ui.labCard).join("");

  $("result").hidden = false;

  // ---- 반전 버튼 ----
  var revealed = false;
  function reveal(scroll) {
    if (revealed) return;
    revealed = true;
    var sec = $("reveal");
    sec.hidden = false;
    sec.classList.add("reveal-in");
    $("revealBtn").hidden = true;
    $("revealHint").hidden = true;
    $("revealBtn").setAttribute("aria-expanded", "true");
    document.title = "LMTI 결과 · 나와 어울리는 연구실은 " + r.first.lab.code;
    if (scroll) {
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      sec.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }
  $("revealBtn").addEventListener("click", function () { reveal(true); });
  if (location.hash === "#lab") reveal(false);

  // ---- 공유: 친구에게는 반전이 들키지 않게 테스트 첫 화면을 보낸다 ----
  // 카카오톡 · 인스타 같은 앱 안 브라우저는 공유 창(navigator.share)이나 클립보드 API가 없거나 막혀 있을 때가 많다.
  // 그래서 공유 창 → 클립보드 API → 예전 방식 복사(execCommand) → 직접 복사 안내 순서로 시도한다.
  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.top = "-1000px"; ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  function copy(text, done) {
    var fallback = function () {
      if (legacyCopy(text)) ui.toast(done);
      else window.prompt("아래 링크를 길게 눌러 복사해 주세요", text);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { ui.toast(done); }, fallback);
    } else {
      fallback();
    }
  }
  var testUrl = new URL("./", location.href).href;
  $("shareBtn").addEventListener("click", function () {
    var text = "정답 없는 연애 밸런스 게임 20문항! 나는 어떤 연인일까? 결과에 반전이 있어 🤫";
    if (navigator.share) {
      navigator.share({ title: "LMTI 연애 성향 테스트", text: text, url: testUrl }).catch(function (e) {
        // 사용자가 공유 창을 닫은 경우(AbortError)만 그대로 두고, 공유가 막힌 경우에는 링크를 복사한다
        if (!e || e.name !== "AbortError") copy(testUrl, "테스트 링크를 복사했어요");
      });
    } else {
      copy(testUrl, "테스트 링크를 복사했어요");
    }
  });
  $("copyBtn").addEventListener("click", function () {
    copy(location.origin + location.pathname + location.search + "#lab", "내 결과 링크를 복사했어요");
  });
})();
