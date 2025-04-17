import { loadData, saveData } from "./loader/data_saver.js"

let darkMode = false

function changeMode(){
    const nav = document.querySelector("nav")
    const navLogoText = document.querySelector("#nav-logo-text")
    const changeText = document.querySelectorAll(".change-text")
        
    if (darkMode && darkMode !== "false"){
        document.body.style.backgroundColor = "rgb(22, 22, 22)"
        nav.style.backgroundColor = "rgb(22, 22, 22)"
        navLogoText.style.color = "white"

        changeText.forEach(text => {
            text.style.color = "white"
        })

        document.documentElement.style.setProperty("--scrollbar-color", "white")
    }
    else{
        document.body.style.backgroundColor = "#FDFBFD"
        nav.style.backgroundColor = "#FDFBFD"
        navLogoText.style.color = "#021F31"

        changeText.forEach(text => {
            text.style.color = "#021F31"
        })

        document.documentElement.style.setProperty("--scrollbar-color", "#021F31")
    }
}

function main(){
    const pexesoButton = document.querySelector("#pexeso-button")
    pexesoButton.addEventListener("click", () => {
        window.location.href = "pexeso/pexeso.html"
    })

    const standartButton = document.querySelector("#web-content")
    standartButton.addEventListener("click", () => {
        window.location.href = "default/default.html"
    })

    const pexesoButton2 = document.querySelector("#pexeso-content")
    pexesoButton2.addEventListener("click", () => {
        window.location.href = "pexeso/pexeso.html"
    })

    const wordsListButton = document.querySelector("#words-list-content")
    wordsListButton.addEventListener("click", () => {
        window.location.href = "words_list/words_list.html"
    })

    const wordsCreationButton = document.querySelector("#words-creation-content")
    wordsCreationButton.addEventListener("click", () => {
        window.location.href = "words_creator/words_creator.html"
    })

    const tryButton = document.querySelector("#try-button")
    tryButton.addEventListener("click", () => {
        window.location.href = "web_links/web_links.html"
    })

    darkMode = loadData("darkMode")
    if (!darkMode || darkMode === NaN) {
        saveData(false, "darkMode")
        darkMode = false
    }

    const darkModeButton = document.querySelector("#dark-mode")

    if (darkMode && darkMode !== "false") {
        darkModeButton.setAttribute("src", "images/sun.png")
    }
    else {
        darkModeButton.setAttribute("src", "images/moon.png")
    }

    darkModeButton.addEventListener("click", () => {
        darkMode = !darkMode
        saveData(darkMode, "darkMode")

        if (darkMode && darkMode !== "false") {
            darkModeButton.setAttribute("src", "images/sun.png")
        }
        else {
            darkModeButton.setAttribute("src", "images/moon.png")
        }

        changeMode()
    })

    changeMode()
}

main()