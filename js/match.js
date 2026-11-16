/*
 * 가까움 계산 + 추천 + 이유 코멘트
 * 계산 방식: 01_plan/05_build_plan.md 4절
 *   내 방향 a = u − 3,  연구실 방향 c = l − (추천 대상 연구실 평균)
 *   가까움 = cos(a, c),  표시 점수 = 10 + (가까움 + 1) / 2 × 85   (10 ~ 95)
 * 브라우저와 Node(05_tools/01_simulate.js) 양쪽에서 같은 코드로 동작한다.
 */
(function (root) {
  var LMTI = (root.LMTI = root.LMTI || {});
  var AXES = 4;

  function activeLabs() {
    return LMTI.labs.filter(function (l) { return l.status === "active" && l.axes; });
  }

  // ---- 답 ↔ 결과 코드 (12개 답 → 3글자) ----
  // answers[i] = i번째 문항에서 고른 쪽 (0 = 왼쪽 성향, 1 = 오른쪽 성향)
  function encode(answers) {
    var n = 0;
    for (var i = 0; i < answers.length; i++) if (answers[i] === 1) n += Math.pow(2, i);
    var s = n.toString(36);
    while (s.length < 3) s = "0" + s;
    return s;
  }

  function decode(code) {
    var total = LMTI.questions.length;
    if (typeof code !== "string" || !/^[0-9a-z]{1,3}$/.test(code)) return null;
    var n = parseInt(code, 36);
    if (isNaN(n) || n >= Math.pow(2, total)) return null;
    var answers = [];
    for (var i = 0; i < total; i++) answers.push(Math.floor(n / Math.pow(2, i)) % 2);
    return answers;
  }

  // ---- 내 점수: 축마다 오른쪽을 고른 개수(0~3) → 1 ~ 5점 ----
  function userScores(answers) {
    var right = [0, 0, 0, 0], total = [0, 0, 0, 0];
    LMTI.questions.forEach(function (q, i) {
      total[q.axis] += 1;
      if (answers[i] === 1) right[q.axis] += 1;
    });
    return right.map(function (r, k) { return 1 + (4 * r) / total[k]; });
  }

  function poolMean(labs) {
    var m = [0, 0, 0, 0];
    labs.forEach(function (l) { for (var k = 0; k < AXES; k++) m[k] += l.axes[k]; });
    return m.map(function (v) { return v / labs.length; });
  }

  function norm(v) { return Math.sqrt(v.reduce(function (s, x) { return s + x * x; }, 0)); }

  function levelLabel(score) {
    for (var i = 0; i < LMTI.closenessLevels.length; i++) {
      if (score >= LMTI.closenessLevels[i].min) return LMTI.closenessLevels[i].label;
    }
    return LMTI.closenessLevels[LMTI.closenessLevels.length - 1].label;
  }

  // ---- 이유 코멘트 ----
  // 같은 문장이 카드마다 반복되지 않도록, 앞 카드에서 쓴 축(avoid)은 다른 후보가 있으면 피한다.
  // 후보 조건: 🥇·🥈는 같은 방향(기여 > 0), 💔는 반대 방향(기여 < 0)
  function pickAxis(contrib, mode, avoid) {
    var order = [0, 1, 2, 3].sort(function (x, y) {
      return mode === "max" ? contrib[y] - contrib[x] : contrib[x] - contrib[y];
    });
    var ok = function (k) { return mode === "max" ? contrib[k] > 0 : contrib[k] < 0; };
    for (var i = 0; i < order.length; i++) {
      if (ok(order[i]) && (avoid || []).indexOf(order[i]) === -1) return order[i];
    }
    return order[0];
  }

  function reason(item, a, kind, avoidAxes) {
    var axis = pickAxis(item.contrib, kind === "worst" ? "min" : "max", avoidAxes);
    var pole = a[axis] > 0 ? 1 : 0;
    var reused = (avoidAxes || []).indexOf(axis) !== -1;
    var userLine = (reused ? LMTI.comments.userAlt : LMTI.comments.user)[axis][pole];
    var parts = [userLine, item.lab.axisLines[axis]];
    if (kind === "worst") parts.push(LMTI.comments.soft[axis][pole]);
    else parts.push(LMTI.comments.closing[kind]);
    return { axis: axis, text: parts.join(" ") };
  }

  // ---- 전체 계산 ----
  function compute(answers) {
    var labs = activeLabs();
    var u = userScores(answers);
    var m = poolMean(labs);
    var a = u.map(function (x) { return x - 3; });
    var na = norm(a);

    var items = labs.map(function (lab) {
      var c = lab.axes.map(function (x, k) { return x - m[k]; });
      var nc = norm(c);
      var dot = 0, contrib = [];
      for (var k = 0; k < AXES; k++) { contrib.push(a[k] * c[k]); dot += a[k] * c[k]; }
      var sim = na > 0 && nc > 0 ? dot / (na * nc) : 0;
      var dist = Math.sqrt(lab.axes.reduce(function (s, x, k) { return s + (x - u[k]) * (x - u[k]); }, 0));
      // 표시 점수: 10 ~ 95. 정반대여도 0점으로 보이지 않게 범위만 줄인다 (순위·5단계 말은 그대로)
      var score = Math.round(10 + ((sim + 1) / 2) * 85);
      return { lab: lab, sim: sim, score: score, label: levelLabel(score), dist: dist, contrib: contrib };
    });

    items.sort(function (x, y) { return y.sim - x.sim || x.dist - y.dist; });

    var result = { u: u, items: items, first: null, second: null, worst: null };
    if (items.length >= 3) {
      result.first = items[0];
      result.second = items[1];
      result.worst = items[items.length - 1];
      result.first.reason = reason(result.first, a, "first", []);
      result.second.reason = reason(result.second, a, "second", [result.first.reason.axis]);
      result.worst.reason = reason(result.worst, a, "worst", [result.first.reason.axis, result.second.reason.axis]);
    }
    return result;
  }

  LMTI.match = {
    activeLabs: activeLabs,
    encode: encode,
    decode: decode,
    userScores: userScores,
    compute: compute,
    levelLabel: levelLabel
  };
})(typeof window !== "undefined" ? window : globalThis);
