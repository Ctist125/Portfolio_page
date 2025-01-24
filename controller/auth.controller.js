// 프로젝트 내 파일
const validation = require("../util/validation");
const randomNumberUtil = require("../util/random-number");
const sendMail = require("../util/send-mail");
const logForm = require("../util/log-form");
const Auth = require("../models/auth.model");
const Management = require("../models/management.model");

function getLogin(req, res) {
  let flashData = req.session.flashData;

  req.session.flashData = null;

  if (!flashData) {
    flashData = {
      login: {
        email: "",
        error: null,
      },
    };
  }

  if (req.session.loginCnt >= 5) {
    req.session.loginCnt = null;
    return res.send(
      "<script>alert('로그인 실패!'); location.href='/';</script>"
    );
  }

  res.render("auth/login", {
    login: flashData.login,
    cnt: req.session.loginCnt,
  });
}

async function login(req, res) {
  const userInput = {
    email: req.body.userEmail,
    pw: req.body.userPw,
  };
  let loginStatus = {
    login: {
      auth: null,
      class: null,
      userName: null,
    },
    error: null,
  };

  const auth = new Auth("", userInput.email, userInput.pw);
  const userInfo = await auth.findByEmail();

  // 로그를 위한 user ip
  const userIp = "USER: " + req.ip;

  // user 정보가 존재하지도 않을 때
  if (!userInfo) {
    // 로그
    console.log(logForm(userIp, "존재하지 않는 회원. 로그인 시도."));
    loginStatus.error = true;

    // 로그인 실패 카운트
    if (req.session.loginCnt) {
      req.session.loginCnt += 1;
    } else {
      req.session.loginCnt = 1;
    }

    // 로그인 실패시 로그인에 사용하는 email정보 유지와 error 상태 flashData에 저장
    req.session.flashData = {
      login: {
        email: userInput.email,
        error: loginStatus.error,
      },
    };
    req.session.save();

    return res.redirect("/login");
  }

  let hashedPw = userInfo.pw;

  // 로그인 5회 이상 실패시 잠김 문구 출력
  if (userInfo.lock) {
    // 로그
    console.log(logForm(userIp, userInfo.email + " 잠긴 계정 로그인 시도."));
    return res.send(
      "<script>alert('5회 이상 실패로 계정이 잠겨있습니다.'); history.back();</script>"
    );
  }

  // 로그인 성공 & 실패
  if (await auth.matchingPw(hashedPw)) {
    // 회원가입 승인 전 계정이 접속을 시도할 때
    if (!userInfo.approval) {
      // 로그
      console.log(logForm(userIp, "승인 전 회원. 로그인 시도."));
      return res.send(
        "<script>alert('승인되지 않은 회원입니다.'); history.back();</script>"
      );
    }

    loginStatus.login.auth = true;
    loginStatus.login.userName = userInfo.userName;

    // 권한 확인
    if (userInfo.admin) {
      loginStatus.login.class = "admin";

      console.log(
        logForm(
          userIp,
          loginStatus.login.class +
            " " +
            loginStatus.login.userName +
            " 로그인."
        )
      );
    } else if (userInfo.manager) {
      loginStatus.login.class = "manager";

      console.log(
        logForm(
          userIp,
          loginStatus.login.class +
            " " +
            loginStatus.login.userName +
            " 로그인."
        )
      );
    } else {
      // 나머지 유저에 대한 로그인 로그
      console.log(logForm(userIp, loginStatus.login.userName + " 로그인."));
    }

    req.session.login = { ...loginStatus.login };
    req.session.save();

    return res.redirect("/");
  } else {
    // 로그
    console.log(logForm(userIp, userInfo.email + " 로그인 실패."));
    loginStatus.error = true;

    // 로그인 실패 카운트
    if (req.session.loginCnt) {
      req.session.loginCnt += 1;
    } else {
      req.session.loginCnt = 1;
    }

    // 5회 실패 시 계정 잠김
    if (userInfo && req.session.loginCnt >= 5) {
      // 로그
      console.log(
        logForm(userIp, userInfo.email + "로그인 5회 실패 계정 잠김.")
      );
      await auth.accountLock();
    }

    // 로그인 실패시 로그인에 사용하는 email정보 유지와 error 상태 flashData에 저장
    req.session.flashData = {
      login: {
        email: userInput.email,
        error: loginStatus.error,
      },
    };
    req.session.save();

    return res.redirect("/login");
  }
}

function logout(req, res) {
  // 로그
  const userIp = "USER: " + req.ip;
  console.log(logForm(userIp, req.session.login.userName + " 로그아웃."));

  req.session.login = null;

  res.redirect("/");
}

async function getTerms(req, res) {
  const management = new Management("signupFunctionLock");
  let signupFunctionLock = await management.serviceFindByServiceName();

  if (!signupFunctionLock) {
    signupFunctionLock = {
      serviceName: "signupFunctionLock",
      value: false,
    };
  }

  if (signupFunctionLock.value) {
    // 로그
    const userIp = "USER: " + req.ip;

    console.log(logForm(userIp, "회원가입 시도. (현재 기능 비활성화)"));
    return res.send(
      "<script>alert('현재 회원가입 기능이 잠겨있습니다.'); history.back();</script>"
    );
  }

  res.render("auth/terms");
}

function terms(req, res) {
  const termsCheck = { ...req.body };

  // 로그 수집을 위한 Ip
  const userIp = "USER: " + req.ip;

  if (
    termsCheck.serviceTerms &&
    termsCheck.signupTerms &&
    termsCheck.personalInfoTerms &&
    termsCheck.childTerms
  ) {
    // 로그
    console.log(logForm(userIp, "회원가입 모든 약관 동의."));
    req.session.terms = true;
    req.session.save();

    return res.redirect("/sign-up");
  } else {
    // 로그
    console.log(logForm(userIp, "회원가입 약관 동의 우회 시도."));
    return res.status(400).render("errors/400");
  }
}

function getSignup(req, res) {
  if (!req.session.terms) {
    // 로그
    const userIp = "USER: " + req.ip;
    console.log(logForm(userIp, "회원가입 약관 동의 우회 시도."));

    return res.status(400).render("errors/400");
  }

  let flashData = req.session.flashData;

  req.session.terms = null;
  req.session.flashData = null;

  if (!flashData) {
    flashData = {
      error: {
        userNameError: null,
        userEmailError: null,
        userPwError: null,
      },
      userInput: {
        userName: null,
        userEmail: null,
        userPw: null,
        pwCheck: null,
      },
    };
  }

  res.render("auth/sign-up", {
    signupError: flashData.error,
    signupInput: flashData.userInput,
  });
}

async function signup(req, res) {
  const userInput = { ...req.body };
  let error = {
    userNameError: null,
    userEmailError: null,
    userPwError: null,
  };

  // 로그 수집을 위한 IP
  const userIp = "USER: " + req.ip;

  // 닉네임 유효성 검사
  if (
    userInput.userName.trim().length < 3 ||
    userInput.userName.trim().length > 5
  ) {
    console.log(logForm(userIp, "회원가입 입력 폼 우회 시도. (닉네임)"));
    return res.status(400).render("errors/400");
  }

  if (
    !validation.noEmpty(userInput.userName) ||
    !validation.noWhiteSpace(userInput.userName)
  ) {
    error.userNameError = "공백을 제외해 주십시오.";
  } else if (!validation.noSpecialChar(userInput.userName)) {
    error.userNameError = "특수문자를 제외해 주십시오.";
  } else if (await validation.sameUserName(userInput.userName)) {
    error.userNameError = "동일한 닉네임이 존재합니다.";
  }

  // 이메일 유효성 검사
  if (
    !validation.noEmpty(userInput.userEmail) ||
    !validation.noWhiteSpace(userInput.userEmail)
  ) {
    error.userEmailError = "공백을 제외해 주십시오.";
  } else if (!validation.emailValid(userInput.userEmail)) {
    console.log(logForm(userIp, "회원가입 입력 폼 우회 시도. (Email)"));

    return res.status(400).render("errors/400");
  } else if (await validation.sameEmail(userInput.userEmail)) {
    error.userEmailError = "동일한 이메일이 존재합니다.";
  }

  // Password 유효성 검사
  if (!validation.pwValid(userInput.userPw)) {
    error.userPwError = "주의 특수문자(!, @, #, $, %, ^, &, *, _, +, ?)";
  } else if (userInput.userPw.length < 8 || userInput.userPw.length > 15) {
    console.log(logForm(userIp, "회원가입 입력 폼 우회 시도. (비밀번호)"));

    return res.status(400).render("errors/400");
  }

  // Password 확인
  if (userInput.userPw != userInput.pwCheck) {
    error.userPwError = "Password와 Password 확인의 값이 다릅니다.";
  }

  // error 상태 확인
  if (error.userNameError || error.userEmailError || error.userPwError) {
    req.session.flashData = {
      error: { ...error },
      userInput: { ...userInput },
    };
    req.session.terms = true;
    req.session.save();

    return res.redirect("/sign-up");
  } else {
    // 로그
    console.log(logForm(userIp, userInput.userEmail + " 회원가입 신청 완료."));

    const auth = new Auth(
      userInput.userName,
      userInput.userEmail,
      userInput.userPw
    );
    await auth.signup();

    return res.render("auth/sign-up-success");
  }
}

function getViewTerms(req, res) {
  const termsType = req.query.contents;

  res.render("auth/view-terms", { termsType: termsType });
}

function getFindPw(req, res) {
  let flashData = req.session.flashData;
  req.session.flashData = null;

  if (!flashData) {
    flashData = {
      userName: "",
      email: "",
      error: "",
    };
  }

  res.render("auth/find-pw", { ...flashData });
}

async function findPw(req, res) {
  const userInput = { ...req.body };

  let error = null;

  // 로그 기록을 위한 ip
  const userIp = "USER: " + req.ip;

  // user name 공백 유효성 검사
  if (!validation.noEmpty(userInput.userName)) {
    error = "값이 비어있습니다. 다시 확인해 주십시오.";
  } else if (!validation.noWhiteSpace(userInput.userName)) {
    error = "값에 공백이 포함되어 있습니다. 다시 확인해 주십시오.";
  }

  // email 공백 유효성 검사
  if (
    !validation.noEmpty(userInput.email) ||
    !validation.noWhiteSpace(userInput.email) ||
    !validation.emailValid(userInput.email)
  ) {
    // 로그
    console.log(logForm(userIp, "비밀번호 찾기 입력 폼 우회 시도."));
    return res.status(400).render("errors/400");
  }

  // 에러 값 확인
  if (error) {
    req.session.flashData = {
      ...userInput,
      error: error,
    };

    return res.redirect("/find-pw");
  }

  // 입력값과 데이터값이 일치하는지 확인
  const auth = new Auth(userInput.userName, userInput.email);
  const userInfoByUserName = await auth.findByUserName();
  const userInfoByEmail = await auth.findByEmail();

  if (
    !userInfoByUserName ||
    !userInfoByEmail ||
    userInfoByUserName.pw !== userInfoByEmail.pw
  ) {
    return res.render("auth/find-fail");
  } else {
    // 로그
    console.log(logForm(userIp, userInput.email + " 비밀번호 찾기 성공."));

    const randomPw = randomNumberUtil(15);
    await auth.changePwByEmail(randomPw);

    // 임시 비밀번호 메일로 전송하기
    const mailContents = {
      title:
        "[Tief's Portfolio] " +
        userInput.userName +
        "님의 임시 비밀번호입니다.",
      contents: "임시 비밀번호는: " + randomPw + "입니다.",
    };

    sendMail.sendMailText(
      userInput.email,
      mailContents.title,
      mailContents.contents
    );

    return res.render("auth/find-success", { email: userInput.email });
  }
}

async function getInfo(req, res) {
  const auth = new Auth(res.locals.userName);
  const userInfo = await auth.findByUserName();

  let flashData1 = req.session.flashData1;
  req.session.flashData1 = null;

  if (!flashData1) {
    flashData1 = {
      status: {
        first: "view",
        second: "hide",
      },
    };
  }

  let flashData2 = req.session.flashData2;
  req.session.flashData2 = null;

  if (!flashData2) {
    flashData2 = {
      inputValue: {
        error: "",
        pw: "",
        pwCheck: "",
        authNumCheck: "",
      },
    };
  }

  res.render("auth/info", {
    userInfo: userInfo,
    ...flashData1,
    ...flashData2,
  });
}

async function sendAuthNum(req, res) {
  const authNum = randomNumberUtil(8);

  const flashData1 = {
    status: {
      first: "hide",
      second: "view",
    },
  };

  req.session.flashData1 = flashData1;

  // 로그
  const userIp = "USER: " + req.ip;
  console.log(logForm(userIp, res.locals.userName + "비밀번호 변경 시도."));

  // 인증번호 전송 및 데이터 값으로 저장
  const auth = new Auth(res.locals.userName);
  const userInfo = await auth.findByUserName();

  const mailContents = {
    title: "[Tief's Portfolio] 비밀번호 변경 인증번호입니다.",
    contents: "비밀번호 변경 인증번호 입니다.: " + authNum,
  };

  sendMail.sendMailText(
    userInfo.email,
    mailContents.title,
    mailContents.contents
  );

  await auth.addAuthNum(authNum);

  res.redirect("/info");
}

async function changePassword(req, res) {
  const userInput = { ...req.body };
  let error;

  // 로그를 위한 ip
  const userIp = "USER: " + req.ip;

  // Password 유효성 검사
  if (!validation.pwValid(userInput.pw)) {
    error =
      "영어 대/소문자, 특수문자(!, @, #, $, %, ^, &, *, _, +, ?), 숫자 포함 8~15자로 구성되어야 합니다.";
  } else if (userInput.pw.length < 8 || userInput.pw.length > 15) {
    // 로그
    console.log(
      logForm(userIp, res.locals.userName + " 비밀번호 입력 폼 우회 시도.")
    );

    return res.status(400).render("errors/400");
  }

  // Password 확인
  if (userInput.pw != userInput.pwCheck) {
    error = "Password와 Password 확인의 값이 다릅니다.";
  }

  // 인증번호 확인
  const auth = new Auth(res.locals.userName);
  const userInfo = await auth.findByUserName();

  if (userInput.authNumCheck != userInfo.authNum) {
    error = "인증번호가 다릅니다.";
  }

  // 에러 깂 확인
  if (error) {
    const flashData1 = {
      status: {
        first: "hide",
        second: "view",
      },
    };

    const flashData2 = {
      inputValue: {
        error: error,
        ...userInput,
      },
    };

    req.session.flashData1 = flashData1;
    req.session.flashData2 = flashData2;

    return res.redirect("/info");
  } else {
    // 로그
    console.log(logForm(userIp, userInfo.email + " 비밀번호 변경 성공"));

    await auth.changePwByUserName(userInput.pw);
    await auth.deleteAuthNum();

    const mailContents = {
      title: "[Tief's Portfolio] 비밀번호가 변경되었습니다.",
      contents: "본인이 아니라면 tief125@naver.com으로 메일 부탁드립니다.",
    };

    sendMail.sendMailText(
      userInfo.email,
      mailContents.title,
      mailContents.contents
    );

    return res.render("auth/pw-change-success");
  }
}

module.exports = {
  getLogin: getLogin,
  login: login,
  logout: logout,
  getTerms: getTerms,
  terms: terms,
  getSignup: getSignup,
  signup: signup,
  getViewTerms: getViewTerms,
  getFindPw: getFindPw,
  findPw: findPw,
  getInfo: getInfo,
  sendAuthNum: sendAuthNum,
  changePassword: changePassword,
};
