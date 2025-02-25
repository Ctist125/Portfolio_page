// 외부 라이브러리 선언
const express = require("express");

// 프로젝트 내 파일
const notAuthCheckMiddleware = require("../middlewares/not-auth-check");
const csrfTokenCheckMiddleware = require("../middlewares/csrf-token-check");
const authAccessCheckMiddleware = require("../middlewares/auth-access-check");
const addCsrfTokenMiddleware = require("../middlewares/csrf-token");
const authController = require("../controller/auth.controller");

// express.js
const router = express.Router();

router.get("/login", notAuthCheckMiddleware, addCsrfTokenMiddleware, authController.getLogin);

router.post("/login", notAuthCheckMiddleware, csrfTokenCheckMiddleware, authController.login);

router.get("/logout", authController.logout);

router.get("/terms", notAuthCheckMiddleware, addCsrfTokenMiddleware, authController.getTerms);

router.post("/terms", notAuthCheckMiddleware, csrfTokenCheckMiddleware, authController.terms);

router.get("/sign-up", notAuthCheckMiddleware, addCsrfTokenMiddleware, authController.getSignup);

router.post("/sign-up", notAuthCheckMiddleware, csrfTokenCheckMiddleware, authController.signup);

router.get("/view-terms", authController.getViewTerms);

router.get("/find-pw", notAuthCheckMiddleware, addCsrfTokenMiddleware, authController.getFindPw);

router.post("/find-pw", notAuthCheckMiddleware, csrfTokenCheckMiddleware, authController.findPw);

router.get("/info", authAccessCheckMiddleware, addCsrfTokenMiddleware, authController.getInfo);

router.post("/auth-num", authAccessCheckMiddleware, csrfTokenCheckMiddleware, authController.sendAuthNum);

router.post("/pw-change", authAccessCheckMiddleware, csrfTokenCheckMiddleware, authController.changePassword);

module.exports = router;
