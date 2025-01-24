// 외부 라이브러리 선언
const express = require("express");

// 프로젝트 내 파일
const basicController = require("../controller/basic.controller");

// express
const router = express.Router();

router.get("/", basicController.getIndex);

router.get("/blog-list", basicController.getBlogList);

router.get("/image-license", basicController.getImageLicense);

router.get("/font-license", basicController.getFontLicense);

router.get("/email", basicController.getEmail);

module.exports = router;