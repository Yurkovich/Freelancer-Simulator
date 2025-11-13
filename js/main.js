const icons = document.querySelectorAll(".icon")
const portfolioWindow = document.getElementById("portfolio-window")
const closeBtn = document.querySelector(".window-close")

icons.forEach((icon) => {
  icon.addEventListener("click", (e) => {
    const app = e.currentTarget.dataset.app

    if (app === "portfolio") {
      portfolioWindow.classList.remove("hidden")
    } else {
      alert("Приложение в разработке")
    }
  })
})

closeBtn.addEventListener("click", () => {
  portfolioWindow.classList.add("hidden")
})
