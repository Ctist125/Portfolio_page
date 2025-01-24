// 변수 선언
const mobileMenuButtonElement = document.querySelector("#header-menu button");
const mobileMenuAsideElement = document.getElementById("mobile-menu");

// 함수 선언
function openMobileMenu() {
    mobileMenuAsideElement.style.display = "block";
}

// 이벤트 구문
mobileMenuButtonElement.addEventListener("click", openMobileMenu);