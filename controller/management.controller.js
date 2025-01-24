// 내부 라이브러리
const fs = require("fs");
const path = require("path");

// 프로젝트 내 파일
const Management = require("../models/management.model");
const Auth = require("../models/auth.model");
const Skills = require("../models/skills.model");
const History = require("../models/history.model");
const Contents = require("../models/portfolio-contents.model");
const sendMail = require("../util/send-mail");
const getMailConents = require("../util/mail-contents");
const validation = require("../util/validation");
const logForm = require("../util/log-form");

function getMain(req, res) {
  res.render("management/main");
}

async function getService(req, res) {
  const contents = new Contents("");
  const skills = new Skills("");
  const history = new History();

  const contentsList = await contents.allList();
  const historyList = await history.allList();

  const noHiddenContents = [];
  const noHiddenHistory = [];

  // 숨겨진 컨텐츠 제외
  for (let content of contentsList) {
    if (content.status !== "hidden") {
      noHiddenContents.push(content);
    }
  }

  for (let history of historyList) {
    if (history.status !== "hidden") {
      noHiddenHistory.push(history);
    }
  }

  const skillList = await skills.allList();

  res.render("management/service-management", {
    contentsList: contentsList,
    noHiddenContents: noHiddenContents,
    skillList: skillList,
    historyList: historyList,
    noHiddenHistory: noHiddenHistory,
  });
}

async function contentsStatusManagement(req, res) {
  const id = req.params.id;
  const value = req.query.value;

  const contents = new Contents("");
  const content = await contents.findById(id);

  // 로그 수집을 위한 ip
  const userIp = "USER: " + req.ip;

  if (value === "delete") {
    await contents.deleteById(id);
    console.log(
      logForm(userIp, res.locals.userName + " " + id + " Portfolio 글 삭제.")
    );

    // 이미지 파일 삭제
    try {
      fs.unlinkSync(
        path.join(__dirname, "../resource/contents-image/" + content.image)
      );
    } catch (error) {
      console.log(logForm("SERVER", "Portfolio 이미지 제거 에러 발생."));
      console.log(error);
    }
  } else {
    await contents.managementById(id, value);

    console.log(
      logForm(userIp, res.locals.userName + " " + id + " " + value + " 처리.")
    );
  }

  return res.redirect("/management/service");
}

async function historyStatusManagement(req, res) {
  const value = req.query.value;
  const id = req.params.id;

  // 로그 수집을 위한 ip
  const userIp = "USER: " + req.ip;

  const history = new History();

  if (value === "delete") {
    await history.deleteById(id);

    console.log(
      logForm(userIp, res.locals.userName + " " + id + " history 삭제.")
    );
  } else {
    await history.managementById(id, value);

    console.log(
      logForm(userIp, res.locals.userName + " " + id + " " + value + " 처리.")
    );
  }

  return res.redirect("/management/service");
}

async function getReviseContent(req, res) {
  const id = req.params.id;

  // content 불러오기
  const contents = new Contents("");
  const content = await contents.findById(id);

  // form url
  const url = "/management/service/content/revise/" + content._id;

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
      ...content,
    };
  }

  res.render("writing/contents-writing", { url: url, flashData: flashData });
}

async function reviseContent(req, res) {
  const id = req.params.id;

  // 로그 수집을 위한 ip
  const userIp = "USER: " + req.ip;

  // 에러 값 선언
  let writingError = {
    error: {
      titleError: "",
      languageError: "",
      descriptionError: "",
    },
  };

  // 값 받아오기
  const inputValue = {
    ...req.body,
    image: req.file.filename,
  };

  // title 유효성 검사
  if (!validation.noEmpty(inputValue.title)) {
    writingError.error.titleError = "입력란이 비워져 있습니다.";
  }

  // image 유효성 검사
  if (!inputValue.image || !validation.jpgValid(inputValue.image)) {
    console.log(
      logForm(userIp, "Portfolio 수정 중 이미지 유효성 검사 우회 시도.")
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
      logForm(userIp, "Portfolio 수정 중 날짜 유효성 검사 우회 시도.")
    );

    return res.status(400).render("errors/400");
  }

  // 코딩 언어 유효성 검사
  if (
    !validation.noEmpty(inputValue.language) ||
    !validation.noWhiteSpace(inputValue.language)
  ) {
    writingError.error.languageError = "공백없이 입력해 주십시오.";
  }

  // 참고 자료 링크 유효성 검사
  if (
    !validation.noEmpty(inputValue.reference) ||
    !validation.noWhiteSpace(inputValue.reference)
  ) {
    console.log(
      logForm(userIp, "Portfolio 수정 중 참고 자료 링크 유효성 검사 우회 시도.")
    );

    return res.status(400).render("errors/400");
  }

  // 설명 유효성 검사
  if (!validation.noEmpty(inputValue.description)) {
    writingError.error.descriptionError = "내용을 입력해 주십시오.";
  }

  // 에러 상황 구분
  if (
    writingError.error.titleError ||
    writingError.error.languageError ||
    writingError.error.descriptionError
  ) {
    req.session.flashData = { ...writingError, ...inputValue };
    req.session.save();

    return res.redirect("/management/service/content/revise/" + id);
  } else {
    // tag 나누기
    inputValue.language = inputValue.language.split(",");

    // 저장
    const contents = new Contents(inputValue);

    console.log(
      logForm(userIp, res.locals.userName + " " + id + " Portfolio 수정.")
    );

    // 기존 이미지 파일 삭제 구문
    const content = await contents.findById(id);

    try {
      fs.unlinkSync(
        path.join(__dirname, "../resource/contents-image/" + content.image)
      );

      console.log(logForm("SERVER", "이미지 파일 삭제 됨."));
    } catch (error) {
      console.log(logForm("SERVER", "이미지 파일 삭제 중 에러 발생"));
      console.log(error);
    }

    await contents.updateById(id);

    return res.redirect("/management/service");
  }
}

async function getReviseHistory(req, res) {
  const id = req.params.id;
  const url = "/management/service/history/revise/" + id;

  const history = new History();
  const historyInfo = await history.findById(id);

  let flashData = req.session.flashData;

  req.session.flashData = null;

  if (!flashData) {
    flashData = {
      error: {
        titleError: "",
        descriptionError: "",
      },
      ...historyInfo,
    };
  }

  res.render("writing/history-writing", { url: url, flashData: flashData });
}

async function reviseHistory(req, res) {
  const id = req.params.id;

  // 로그 수집을 위해 IP
  const userIp = "USER: " + req.ip;

  // 변수 선언
  let error = {
    titleError: "",
    descriptionError: "",
  };

  // input값 받아오기
  const inputValue = {
    ...req.body,
  };

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
      logForm(
        userIp,
        res.locals.userName +
          " " +
          id +
          " history 변경 중 날짜 데이터 유효성 검사 우회 시도."
      )
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

    return res.redirect("/management/service/history/revise/" + id);
  } else {
    const history = new History(inputValue);
    await history.updateById(id);

    console.log(
      logForm(userIp, res.locals.userName + " " + id + " history 수정 완료.")
    );

    return res.redirect("/management/service");
  }
}

async function deleteSkill(req, res) {
  const id = req.params.id;

  const skills = new Skills("");
  await skills.deleteSkill(id);

  // 로그
  const userIp = "USER: " + req.ip;
  console.log(logForm(userIp, res.locals.userName + " " + id + " Skill 삭제."));

  return res.redirect("/management/service");
}

async function newSkill(req, res) {
  const skillInput = {
    ...req.body,
  };

  // 로그 수집을 위한 IP
  const userIp = "USER: " + req.ip;

  // 유효성 검사
  if (
    !validation.noEmpty(skillInput.group) ||
    !validation.languageGroupValid(skillInput.group)
  ) {
    console.log(
      logForm(
        userIp,
        res.locals.userName + " Skill 추가 중 유효성 검사 우회 시도."
      )
    );

    return res.status(400).render("errors/400");
  }

  if (!validation.noEmpty(skillInput.language)) {
    return res.send(
      "<script>alert('언어 입력란이 빈칸입니다.'); history.back();</script>"
    );
  }

  if (
    !validation.noEmpty(skillInput.link) ||
    !validation.noWhiteSpace(skillInput.link)
  ) {
    console.log(
      logForm(
        userIp,
        res.locals.userName + " Skill 추가 중 유효성 검사 우회 시도."
      )
    );

    return res.status(400).render("errors/400");
  }

  const skills = new Skills(
    skillInput.language,
    skillInput.link,
    skillInput.group
  );

  await skills.save();

  res.redirect("/management/service");
}

async function getUser(req, res) {
  const management = new Management("signupFunctionLock");
  const auth = new Auth("");

  let serviceManagement = {
    signupFunctionLock: await management.serviceFindByServiceName(),
    watingApproval: await auth.watingApproval(),
    managerManagement: [],
    allUsers: [],
    lockedUser: await auth.findByLock(),
  };

  if (!serviceManagement.signupFunctionLock) {
    serviceManagement.signupFunctionLock = {
      serviceName: "signupFunctionLock",
      value: false,
    };
  }

  // 일반 유저와 메니저 골라내기
  const allUsers = await auth.allList();

  for (let user of allUsers) {
    if (!user.admin && !user.manager && user.approval) {
      serviceManagement.managerManagement.push(user);
    } else if (user.manager && user.approval) {
      serviceManagement.managerManagement.push(user);
    }
  }

  // admin 제외 & 승인 전 유저 제외 유저 불러오기
  for (let user of allUsers) {
    if (!user.admin && user.approval) {
      serviceManagement.allUsers.push(user);
    }
  }

  res.render("management/user-management", {
    serviceManagement: serviceManagement,
  });
}

async function signupFunction(req, res) {
  const management = new Management("signupFunctionLock");

  const signupFunctionLock = req.body.signupFunction;

  // 로그 수집을 위한 IP
  const userIp = "USER: " + req.ip;

  if (signupFunctionLock === "on") {
    await management.signupFunction(true);

    console.log(
      logForm(userIp, res.locals.userName + " 회원가입 기능 비활성화.")
    );

    return res.redirect("/management/user");
  } else if (signupFunctionLock === "off") {
    await management.signupFunction(false);

    console.log(
      logForm(userIp, res.locals.userName + " 회원가입 기능 활성화.")
    );

    return res.redirect("/management/user");
  } else {
    console.log(
      logForm(userIp, res.locals.userName + " 회원가입 기능 우회 시도.")
    );

    return res.status(400).render("errors/400");
  }
}

async function signupApprovalFunction(req, res) {
  const id = req.params.id;
  const value = req.query.value;

  const auth = new Auth("");
  const userInfo = await auth.findById(id);

  // 로그 수집을 위한 ip
  const userIp = "USER: " + req.ip;

  if (value === "true") {
    // 승인으로 값 변경
    await auth.signupApproval(id);

    const htmlContents = getMailConents(
      "../views/auth/includes/email-form/sign-up.ejs"
    );

    const mailContents = {
      title:
        "[Tief's Portfolio] " +
        userInfo.userName +
        "님의 회원가입을 환영합니다.",
      contents: htmlContents,
    };

    sendMail.sendMailHTML(
      userInfo.email,
      mailContents.title,
      mailContents.contents
    );

    console.log(
      logForm(
        userIp,
        res.locals.userName + "가 " + userInfo.email + " 회원가입을 승인함."
      )
    );
  } else {
    // 삭제
    await auth.deleteById(id);

    const htmlContents = getMailConents(
      "../views/auth/includes/email-form/sign-up-fail.ejs"
    );

    const mailContents = {
      title:
        "[Tief's Portfolio] " +
        userInfo.userName +
        "님의 회원가입이 거절되었습니다.",
      contents: htmlContents,
    };

    sendMail.sendMailHTML(
      userInfo.email,
      mailContents.title,
      mailContents.contents
    );

    console.log(
      logForm(
        userIp,
        res.locals.userName + "가 " + userInfo.email + " 회원가입을 거부함."
      )
    );
  }

  return res.redirect("/management/user");
}

async function lockManagement(req, res) {
  const id = req.params.id;

  const auth = new Auth("");

  await auth.unlockById(id);

  // 로그
  const userIp = "USER: " + req.ip;
  console.log(
    logForm(userIp, res.locals.userName + "가 " + id + "의 계정 잠금을 해제함.")
  );

  return res.redirect("/management/user");
}

async function managerManagementFunction(req, res) {
  const value = req.query.value;
  const id = req.params.id;

  const auth = new Auth("");

  // 로그 수집을 위한 ip
  const userIp = "USER: " + req.ip;

  if (value === "up") {
    // 관리자로 승급
    await auth.promotion(id);

    console.log(logForm(userIp, id + "를 승급."));
  } else {
    // 일반 유저로 강등
    await auth.demotion(id);

    console.log(logForm(userIp, id + "를 강등."));
  }

  res.redirect("/management/user");
}

async function userKickFunction(req, res) {
  const id = req.params.id;

  const auth = new Auth("");
  await auth.deleteById(id);

  // 로그
  const userIp = "USER: " + req.ip;
  console.log(logForm(userIp, id + "를 탈퇴시킴."));

  return res.redirect("/management/user");
}

module.exports = {
  getMain: getMain,
  getService: getService,
  contentsStatusManagement: contentsStatusManagement,
  historyStatusManagement: historyStatusManagement,
  getReviseContent: getReviseContent,
  reviseContent: reviseContent,
  getReviseHistory: getReviseHistory,
  reviseHistory: reviseHistory,
  deleteSkill: deleteSkill,
  newSkill: newSkill,
  getUser: getUser,
  signupFunction: signupFunction,
  signupApprovalFunction: signupApprovalFunction,
  lockManagement: lockManagement,
  managerManagemenFunction: managerManagementFunction,
  userKickFunction: userKickFunction,
};
