document.addEventListener("DOMContentLoaded", function () {
    var menuToggle = document.getElementById("menuToggle");
    var mainMenu = document.getElementById("mainMenu");

    menuToggle.addEventListener("click", function () {
        mainMenu.classList.toggle("active");
        menuToggle.classList.toggle("active");
    });
});

