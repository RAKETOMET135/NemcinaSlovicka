import { loadData, saveData } from "../loader/data_saver.js"

let darkMode

function changeMode(){
    const nav = document.querySelector("nav")
    const navLogoText = document.querySelector("#nav-logo-text")

    if (darkMode && darkMode !== "false"){
        document.body.style.backgroundColor = "rgb(22, 22, 22)"
        document.documentElement.style.setProperty("--scrollbar-color", "white")
        nav.style.backgroundColor = "rgb(22, 22, 22)"
        navLogoText.style.color = "white"
    }
    else {
        document.body.style.backgroundColor = "#FDFBFD"
        document.documentElement.style.setProperty("--scrollbar-color", "#021F31")
        nav.style.backgroundColor = "#FDFBFD"
        navLogoText.style.color = "#021F31"
    }
}

function main(){
    const navLogo = document.querySelector("#nav-logo")
    navLogo.addEventListener("click", () => {
        window.location.href = "../index.html"
    })

    const standartButton = document.querySelector("#standart-card")
    const pexesoButton = document.querySelector("#pexeso-card")
    const wordsListButton = document.querySelector("#words-list-card")
    const customeWordsButton = document.querySelector("#custome-words-card")

    standartButton.addEventListener("click", () => {
        window.location.href = "../default/default.html"
    })
    pexesoButton.addEventListener("click", () => {
        window.location.href = "../pexeso/pexeso.html"
    })
    wordsListButton.addEventListener("click", () => {
        window.location.href = "../words_list/words_list.html"
    })
    customeWordsButton.addEventListener("click", () => {
        window.location.href = "../words_creator/words_creator.html"
    })

    darkMode = loadData("darkMode")
    if (!darkMode || darkMode === NaN) {
        saveData(false, "darkMode")
        darkMode = false
    }

    const darkModeButton = document.querySelector("#dark-mode")

    if (darkMode && darkMode !== "false") {
        darkModeButton.setAttribute("src", "../images/sun.png")
    }
    else {
        darkModeButton.setAttribute("src", "../images/moon.png")
    }

    darkModeButton.addEventListener("click", () => {
        darkMode = !darkMode
        saveData(darkMode, "darkMode")

        if (darkMode && darkMode !== "false") {
            darkModeButton.setAttribute("src", "../images/sun.png")
        }
        else {
            darkModeButton.setAttribute("src", "../images/moon.png")
        }

        changeMode()
    })

    changeMode()
}

main()