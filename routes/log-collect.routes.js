// 외부 라이브러리 선언
const express = require("express");

// 프로젝트 내 파일
const logConllectController = require("../controller/log-collect.controller")

// express.js
const router = express.Router();

router.get("/log", logConllectController.getLogCollectPage);

router.post("/log-agree", logConllectController.logAgree);

module.exports = router;
