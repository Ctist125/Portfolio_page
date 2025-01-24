// 외부 라이브러리 선언
const express = require("express");

// 프로젝트 내 파일
const portfolioController = require("../controller/portfolio.controller");
const authAccessCheckMiddleware = require("../middlewares/auth-access-check");
const csrfTokenCheckMiddleware = require("../middlewares/csrf-token-check");
const addCsrfTokenMiddleware = require("../middlewares/csrf-token");

// express
const router = express.Router();

router.get("/", portfolioController.getMain);

router.get("/details/:id", addCsrfTokenMiddleware, portfolioController.contentsDetails);

router.post("/details/:id", authAccessCheckMiddleware, csrfTokenCheckMiddleware, portfolioController.writingComment);

router.get("/comment-delete/:id", portfolioController.deleteComment);

module.exports = router;
