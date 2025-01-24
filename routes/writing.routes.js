// 외부 라이브러리 선언
const express = require("express");

// 프로젝트 내 파일
const imageUploadMiddleware = require("../middlewares/image-upload");
const csrfTokenCheckMiddleware = require("../middlewares/csrf-token-check");
const addCsrfTokenMiddleware = require("../middlewares/csrf-token");
const writingController = require("../controller/writing.controller");

// express
const router = express.Router();

router.get("/writing-list", writingController.getWritingList);

router.get("/history-writing", addCsrfTokenMiddleware, writingController.getHistoryWriting);

router.post("/history-writing", csrfTokenCheckMiddleware, writingController.historyWriting);

router.get("/contents-writing", addCsrfTokenMiddleware, writingController.getContentsWriting);

router.post("/contents-writing", imageUploadMiddleware, csrfTokenCheckMiddleware, writingController.contentsWriting);

module.exports = router;