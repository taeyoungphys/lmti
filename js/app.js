/* 시작 화면 + 20문항 진행 → 결과 페이지로 이동 */
(function () {
  var LMTI = window.LMTI;
  var Q = LMTI.questions;
  var TOTAL = Q.length;
  var KEY = "lmti-progress";

  var $ = function (id) { return document.getElementById(id); };
  var startView = $("start");
  var quizView = $("quiz");
  var choiceBtns = Array.prototype.slice.call(document.querySelectorAll(".choice"));

  var answers = new Array(TOTAL).fill(null);
  var idx = 0;
  var locked = false;

  // ---- 진행 상황 임시 저장 (새로고침 대비). 막힌 브라우저에서도 테스트는 정상 동작 ----
  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify({ answers: answers, idx: idx })); } catch (e) {}
  }
  function load() {
    try {
      var s = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (s && Array.isArray(s.answers) && s.answers.length === TOTAL) return s;
    } catch (e) {}
    return null;
  }
  function clear() {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }

  // ---- 시작 화면 (연구실 이야기는 하지 않는다 — 반전은 결과지에서) ----
  var sample = Q[2]; // 여행 계획 문항을 미리보기로
  $("sampleQ").textContent = "Q. " + sample.situation;
  $("sampleA").textContent = "A  " + sample.options[0].text;
  $("sampleB").textContent = "B  " + sample.options[1].text;

  var saved = load();
  var params = new URLSearchParams(location.search);
  if (params.get("restart")) { clear(); saved = null; history.replaceState(null, "", location.pathname); }
  if (saved && saved.answers.some(function (a) { return a !== null; })) {
    var done = saved.answers.filter(function (a) { return a !== null; }).length;
    $("resumeText").textContent = done + "문항까지 답했어요.";
    $("startBtn").textContent = "이어서 하기";
    $("resume").hidden = false;
  }

  $("startBtn").addEventListener("click", function () {
    if (saved) { answers = saved.answers; idx = Math.min(saved.idx, TOTAL - 1); }
    showQuiz();
  });
  $("restartBtn").addEventListener("click", function () {
    clear(); saved = null;
    answers = new Array(TOTAL).fill(null); idx = 0;
    showQuiz();
  });

  function showQuiz() {
    startView.hidden = true;
    quizView.hidden = false;
    history.pushState({ view: "quiz" }, "");
    render();
  }
  function showStart() {
    quizView.hidden = true;
    startView.hidden = false;
    saved = load();
    if (saved) {
      var done = saved.answers.filter(function (a) { return a !== null; }).length;
      $("resumeText").textContent = done + "문항까지 답했어요.";
      $("startBtn").textContent = done ? "이어서 하기" : "시작하기";
      $("resume").hidden = !done;
    }
  }
  window.addEventListener("popstate", function () { if (!quizView.hidden) showStart(); });

  // ---- 문항 ----
  function render() {
    var q = Q[idx];
    $("progressFill").style.width = ((idx) / TOTAL) * 100 + "%";
    $("progressText").textContent = idx + 1 + " / " + TOTAL;
    $("qEmoji").textContent = q.emoji;
    $("qNum").textContent = "Q" + (idx + 1);
    $("qText").textContent = q.situation;
    choiceBtns.forEach(function (btn, i) {
      var opt = q.options[i];
      btn.querySelector(".choice-text").textContent = opt.text;
      btn.classList.toggle("selected", answers[idx] === opt.pole);
      btn.setAttribute("aria-pressed", answers[idx] === opt.pole ? "true" : "false");
    });
    var body = $("qBody");
    body.classList.remove("fade-in"); void body.offsetWidth; body.classList.add("fade-in");
    locked = false;
  }

  function choose(i) {
    if (locked) return;
    locked = true;
    var opt = Q[idx].options[i];
    answers[idx] = opt.pole;
    choiceBtns.forEach(function (b, j) { b.classList.toggle("selected", j === i); });
    $("progressFill").style.width = ((idx + 1) / TOTAL) * 100 + "%";
    save();
    setTimeout(function () {
      if (idx < TOTAL - 1) { idx += 1; save(); render(); }
      else finish();
    }, 220);
  }

  function finish() {
    var code = LMTI.match.encode(answers);
    var r = LMTI.match.compute(answers);
    LMTI.collect({
      at: new Date().toISOString(),
      code: code,
      first: r.first && r.first.lab.code,
      second: r.second && r.second.lab.code,
      worst: r.worst && r.worst.lab.code,
      scores: r.items.reduce(function (o, it) { o[it.lab.code] = it.score; return o; }, {})
    });
    clear();
    location.href = "result.html?r=" + code;
  }

  choiceBtns.forEach(function (btn, i) { btn.addEventListener("click", function () { choose(i); }); });
  $("backBtn").addEventListener("click", function () {
    if (idx > 0) { idx -= 1; save(); render(); }
    else history.back();
  });
  document.addEventListener("keydown", function (e) {
    if (quizView.hidden) return;
    var k = e.key.toLowerCase();
    if (k === "a" || k === "1") choose(0);
    else if (k === "b" || k === "2") choose(1);
    else if (k === "backspace" || k === "arrowleft") $("backBtn").click();
  });
})();
