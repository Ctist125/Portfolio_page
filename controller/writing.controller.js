// 프로젝트 내 파일
const validation = require("../util/validation");
const History = require("../models/history.model");
const Contents = require("../models/portfolio-contents.model");
const logForm = require("../util/log-form");

function getWritingList(req, res) {
  res.render("writing/writing-list");
}

function getHistoryWriting(req, res) {
  // form 주소값
  const url = "/writing/history-writing";

  // flashData 구문
  let flashData = req.session.flashData;

  req.session.flashData = null;

  if (!flashData) {
    flashData = {
      error: {
        titleError: "",
        descriptionError: "",
      },
      title: "",
      startDate: "",
      endDate: "",
      description: "",
    };
  }

  res.render("writing/history-writing", { url: url, flashData: flashData });
}

async function historyWriting(req, res) {
  // 변수 선언
  let error = {
    titleError: "",
    descriptionError: "",
  };

  // input값 받아오기
  const inputValue = {
    ...req.body,
  };

  // 로그 수집을 위한 ip
  const userIp = "USER: " + req.ip;

  // title 유효성 검사
  if (!validation.noEmpty(inputValue.title)) {
    error.titleError = "입력란이 비워져 있습니다.";
  }

  // 날짜 유효성 검사
  if (
    !validation.noEmpty(inputValue.startDate) ||
    !validation.noWhiteSpace(inputValue.startDate) ||
    !validation.noEmpty(inputValue.endDate) ||
    !validation.noWhiteSpace(inputValue.endDate) ||
    !validation.dateValid(inputValue.startDate) ||
    !validation.dateValid(inputValue.endDate)
  ) {
    console.log(
      logForm(userIp, res.locals.userName + " history 날짜 폼 입력 우회 시도.")
    );
    return res.status(400).render("errors/400");
  }

  // description 유효성 검사
  if (!validation.noEmpty(inputValue.description)) {
    error.descriptionError = "내용을 입력해 주십시오.";
  }

  // 에러 상황 확인
  if (error.titleError || error.descriptionError) {
    req.session.flashData = {
      error: { ...error },
      ...inputValue,
    };

    req.session.save();

    return res.redirect("/writing/history-writing");
  } else {
    const history = new History(inputValue);

    await history.writingHistory();

    console.log(logForm(userIp, res.locals.userName + " history 작성."));

    return res.redirect("/");
  }
}

function getContentsWriting(req, res) {
  // form 주소값
  const url = "/writing/contents-writing";

  // 세션값 받아오기
  let flashData = req.session.flashData;

  req.session.flashData = null;

  if (!flashData) {
    flashData = {
      error: {
        titleError: "",
        languageError: "",
        descriptionError: "",
      },
      title: "",
      startDate: "",
      endDate: "",
      language: "",
      reference: "",
      description: "",
    };
  }

  res.render("writing/contents-writing", { flashData: flashData, url: url });
}

async function contentsWriting(req, res) {
  // 에러 값 선언
  let error = {
    titleError: "",
    languageError: "",
    descriptionError: "",
  };

  // 값 받아오기
  let inputValue = {
    ...req.body,
    image: req.file.filename,
  };

  // 로그 수집을 위한 ip
  const userIp = "USER: " + req.ip;

  // title 유효성 검사
  if (!validation.noEmpty(inputValue.title)) {
    error.titleError = "입력란이 비워져 있습니다.";
  }

  // image 유효성 검사
  if (!inputValue.image || !validation.jpgValid(inputValue.image)) {
    console.log(
      logForm(
        userIp,
        res.locals.userName + " Portfolio 작성 이미지 유효성 검사 우회 시도."
      )
    );
    return res.status(400).render("errors/400");
  }

  // 날짜 유효성 검사
  if (
    !validation.noEmpty(inputValue.startDate) ||
    !validation.noWhiteSpace(inputValue.startDate) ||
    !validation.noEmpty(inputValue.endDate) ||
    !validation.noWhiteSpace(inputValue.endDate) ||
    !validation.dateValid(inputValue.startDate) ||
    !validation.dateValid(inputValue.endDate)
  ) {
    console.log(
      logForm(
        userIp,
        res.locals.userName + " Portfolio 작성 날짜 유효성 검사 우회 시도."
      )
    );
    return res.status(400).render("errors/400");
  }

  // 코딩 언어 유효성 검사
  if (
    !validation.noEmpty(inputValue.language) ||
    !validation.noWhiteSpace(inputValue.language)
  ) {
    error.languageError = "공백없이 입력해 주십시오.";
  }

  // 참고 자료 링크 유효성 검사
  if (
    !validation.noEmpty(inputValue.reference) ||
    !validation.noWhiteSpace(inputValue.reference)
  ) {
    console.log(
      logForm(
        userIp,
        res.locals.userName + " Portfolio 작성 참고자료 유효성 검사 우회 시도."
      )
    );
    return res.status(400).render("errors/400");
  }

  // 설명 유효성 검사
  if (!validation.noEmpty(inputValue.description)) {
    error.descriptionError = "내용을 입력해 주십시오.";
  }

  // 에러 상황 구분
  if (error.titleError || error.languageError || error.descriptionError) {
    req.session.flashData = { error: { ...error }, ...inputValue };
    req.session.save();

    return res.redirect("/writing/contents-writing");
  } else {
    // tag 나누기
    inputValue.language = inputValue.language.split(",");

    // 저장
    const contents = new Contents(inputValue);

    await contents.save();

    console.log(logForm(userIp, res.locals.userName + " Portfolio 작성."));

    return res.redirect("/portfolio");
  }
}

module.exports = {
  getWritingList: getWritingList,
  getHistoryWriting: getHistoryWriting,
  historyWriting: historyWriting,
  getContentsWriting: getContentsWriting,
  contentsWriting: contentsWriting,
};
