/*
 * LMTI 밸런스 게임 20문항 (축마다 5문항, 축 순서 ①②③④ 반복)
 *
 * axis : 0 = 이론·해석 ↔ 실험·제작   (생각 먼저 ↔ 일단 해 보기)
 *        1 = 개인 자율 ↔ 공동 협업   (각자의 시간 ↔ 함께하는 시간)
 *        2 = 계획·체계 ↔ 유연·탐색   (미리 계획 ↔ 그때그때)
 *        3 = 기초 원리 ↔ 응용·기술   ("왜?" ↔ "그래서 어떻게?")
 * options : 화면에 보이는 순서대로 두 개. pole 0 = 왼쪽(1점 쪽), pole 1 = 오른쪽(5점 쪽)
 * from : 참고한 유명 연애 밸런스 게임 / 논쟁
 */
(function (root) {
  var LMTI = (root.LMTI = root.LMTI || {});

  LMTI.questions = [
    {
      id: 1, axis: 0, emoji: "💬",
      situation: "썸 타는 사람의 마음이 궁금할 때",
      options: [
        { pole: 0, text: "답장 속도와 말투로 신호부터 분석한다" },
        { pole: 1, text: "\"우리 무슨 사이야?\" 직접 물어본다" }
      ],
      from: "썸 신호 분석 vs 직진 고백"
    },
    {
      id: 2, axis: 1, emoji: "📱",
      situation: "연인과 연락하는 스타일은?",
      options: [
        { pole: 1, text: "하루 종일 카톡으로 일상을 실시간 공유" },
        { pole: 0, text: "각자 할 일 하다가 자기 전 통화 한 번" }
      ],
      from: "매일 연락 vs 가끔 연락"
    },
    {
      id: 3, axis: 2, emoji: "✈️",
      situation: "연인과 처음 떠나는 여행",
      options: [
        { pole: 0, text: "시간 단위 일정표를 만들어 공유한다" },
        { pole: 1, text: "숙소만 잡고 나머지는 가서 정한다" }
      ],
      from: "여행 계획파(J) vs 즉흥파(P)"
    },
    {
      id: 4, axis: 3, emoji: "🌧️",
      situation: "연인과 다투고 난 뒤",
      options: [
        { pole: 0, text: "왜 서운했는지 원인을 끝까지 이야기한다" },
        { pole: 1, text: "맛있는 거 먹으면서 일단 풀고 넘어간다" }
      ],
      from: "싸우면 끝까지 대화 vs 일단 화해"
    },
    {
      id: 5, axis: 0, emoji: "💌",
      situation: "좋아하는 사람이 생겼다. 고백 타이밍은?",
      options: [
        { pole: 1, text: "마음이 생겼으면 일단 고백하고 본다" },
        { pole: 0, text: "확신이 들 때까지 충분히 지켜본다" }
      ],
      from: "3일 만에 고백 vs 3개월 썸"
    },
    {
      id: 6, axis: 1, emoji: "🎧",
      situation: "연인과 취미 생활",
      options: [
        { pole: 0, text: "취미는 각자, 만나면 데이트에 집중" },
        { pole: 1, text: "같은 취미를 함께 시작해 같이 즐긴다" }
      ],
      from: "각자 취미 존중 vs 커플 취미"
    },
    {
      id: 7, axis: 2, emoji: "🎂",
      situation: "다가오는 100일 기념일",
      options: [
        { pole: 1, text: "그날 기분 따라 즉흥 데이트" },
        { pole: 0, text: "한 달 전부터 식당 예약과 코스 준비" }
      ],
      from: "기념일 철저히 준비 vs 당일 즉흥"
    },
    {
      id: 8, axis: 3, emoji: "🎁",
      situation: "연인에게 받고 싶은 생일 선물",
      options: [
        { pole: 1, text: "요즘 갖고 싶다고 말한 실용적인 선물" },
        { pole: 0, text: "마음을 꾹꾹 눌러 담은 손편지" }
      ],
      from: "진심이 담긴 마음 vs 현금·실용 선물"
    },
    {
      id: 9, axis: 0, emoji: "🧩",
      situation: "연인과 커플 레고를 조립할 때",
      options: [
        { pole: 0, text: "설명서를 처음부터 차근차근 읽고 시작" },
        { pole: 1, text: "일단 끼워 보면서 맞춰 간다" }
      ],
      from: "설명서 정독파 vs 일단 해 보기파"
    },
    {
      id: 10, axis: 1, emoji: "💳",
      situation: "데이트 비용은 어떻게?",
      options: [
        { pole: 1, text: "데이트 통장을 만들어 함께 관리한다" },
        { pole: 0, text: "그때그때 번갈아 내거나 각자 계산한다" }
      ],
      from: "데이트 통장 vs 각자 계산"
    },
    {
      id: 11, axis: 2, emoji: "🍝",
      situation: "가려던 맛집이 갑자기 문을 닫았다",
      options: [
        { pole: 0, text: "미리 찾아 둔 플랜 B 식당으로 바로 이동" },
        { pole: 1, text: "근처를 걸으며 새로운 곳을 찾아본다" }
      ],
      from: "데이트 코스 계획파 vs 발길 닿는 대로"
    },
    {
      id: 12, axis: 3, emoji: "📺",
      situation: "연애 유튜브를 하나 본다면?",
      options: [
        { pole: 1, text: "바로 써먹는 데이트 꿀팁 영상" },
        { pole: 0, text: "'사람은 왜 사랑에 빠질까' 심리학 영상" }
      ],
      from: "연애의 원리 vs 연애 실전 팁"
    },
    {
      id: 13, axis: 0, emoji: "✍️",
      situation: "썸 타는 사람에게 카톡 답장을 보낼 때",
      options: [
        { pole: 0, text: "몇 번이고 고쳐 쓴 다음에 보낸다" },
        { pole: 1, text: "생각나는 대로 바로 보낸다" }
      ],
      from: "썸 카톡 답장 고민 vs 바로 답장"
    },
    {
      id: 14, axis: 1, emoji: "👯",
      situation: "친구들과 모임이 잡혔다",
      options: [
        { pole: 1, text: "연인도 데려가서 친구들에게 소개한다" },
        { pole: 0, text: "친구 모임은 각자, 연인과는 따로 만난다" }
      ],
      from: "친구 모임에 연인 데려가기 vs 각자"
    },
    {
      id: 15, axis: 2, emoji: "🚪",
      situation: "연인이 연락 없이 집 앞에 깜짝 방문했다",
      options: [
        { pole: 1, text: "이런 서프라이즈 너무 좋다!" },
        { pole: 0, text: "반갑지만 미리 말해 줬으면 좋겠다" }
      ],
      from: "연락 없는 깜짝 방문 vs 미리 연락"
    },
    {
      id: 16, axis: 3, emoji: "⏰",
      situation: "연인이 약속 시간에 30분 늦었다",
      options: [
        { pole: 0, text: "왜 늦었는지 이유부터 듣고 싶다" },
        { pole: 1, text: "이유보다 지금 와 준 게 중요하다" }
      ],
      from: "지각 이유 듣기 vs 와 준 걸로 충분"
    },
    {
      id: 17, axis: 0, emoji: "🔐",
      situation: "연인과 방탈출 카페에 갔다",
      options: [
        { pole: 1, text: "일단 보이는 건 다 눌러 보고 열어 본다" },
        { pole: 0, text: "단서를 모아 차근차근 추리한 뒤 움직인다" }
      ],
      from: "방탈출 추리파 vs 일단 다 눌러 보기파"
    },
    {
      id: 18, axis: 1, emoji: "☕",
      situation: "카페 데이트를 한다면?",
      options: [
        { pole: 0, text: "나란히 앉아 각자 할 일 하는 '카공 데이트'" },
        { pole: 1, text: "마주 앉아 이야기하는 게 진짜 데이트" }
      ],
      from: "카공 데이트 vs 대화 데이트"
    },
    {
      id: 19, axis: 2, emoji: "🗓️",
      situation: "사귄 지 한 달, 앞으로의 이야기",
      options: [
        { pole: 0, text: "앞으로 하고 싶은 것들을 같이 계획해 본다" },
        { pole: 1, text: "먼 미래보다 지금 이 순간에 집중한다" }
      ],
      from: "연애 초반 미래 이야기 vs 지금에 집중"
    },
    {
      id: 20, axis: 3, emoji: "💗",
      situation: "연인에게 \"나 왜 좋아해?\"라고 물었다. 듣고 싶은 답은?",
      options: [
        { pole: 1, text: "\"이유 없어, 그냥 너라서 좋아\"" },
        { pole: 0, text: "좋아하는 이유를 하나하나 구체적으로" }
      ],
      from: "'나 왜 좋아해?' 이유 설명 vs 그냥 좋아"
    }
  ];
})(typeof window !== "undefined" ? window : globalThis);
