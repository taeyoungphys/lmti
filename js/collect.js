/*
 * 응답 데이터 수집 자리 — 지금은 꺼져 있다 (collectUrl이 비어 있으면 아무것도 보내지 않음).
 * 켜는 법 (01_plan/05_build_plan.md 10절):
 *   1. 구글 시트 + Apps Script 웹 앱을 만들고 배포 주소를 받는다
 *   2. 아래 collectUrl에 그 주소를 넣는다
 *   3. index.html 시작 화면 안내 문구를 "익명 응답 통계가 수집돼요"로 바꾼다
 * 보내는 내용(익명): 시각, 결과 코드(20개 답), 🥇·🥈·💔 연구실, 연구실별 가까움 점수
 */
(function (root) {
  var LMTI = (root.LMTI = root.LMTI || {});
  LMTI.config = LMTI.config || { collectUrl: "" };

  LMTI.collect = function (payload) {
    var url = LMTI.config.collectUrl;
    if (!url || typeof fetch !== "function") return;
    try {
      fetch(url, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      }).catch(function () {});
    } catch (e) { /* 수집 실패는 테스트 진행에 영향을 주지 않는다 */ }
  };
})(typeof window !== "undefined" ? window : globalThis);
