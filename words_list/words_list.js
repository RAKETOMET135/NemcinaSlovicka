import { loadLection, updateHTMLSelect } from "../loader/lection_loader.js"
import { saveData, loadData } from "../loader/data_saver.js"

const wordsRange = document.querySelector("#basic-data")

let darkMode = false
let currentFileName = ""
let words = NaN

function displayWords(wordsList){
    words = wordsList

    addListWordsToPreview()
}

function addListWordsToPreview(){
    const wordsListWords = document.querySelector("#words-list-words")

    while (wordsListWords.firstChild) wordsListWords.firstChild.remove()

    for (let i = 0; i < words.length; i++){
        const thisWord = words[i]

        let wordElement = document.createElement("div")
        wordsListWords.append(wordElement)

        let zima3 = document.createElement("br")
        wordElement.append(zima3)

        let czSpan = document.createElement("span")
        wordElement.append(czSpan)
        czSpan.style.color = "purple"
        czSpan.style.fontWeight = "bold"
        czSpan.innerText = "CZ: "
        let czWordSpan = document.createElement("span")
        wordElement.append(czWordSpan)
        czWordSpan.style.color = "white"
        czWordSpan.innerText = thisWord.czWord

        let zima = document.createElement("br")
        wordElement.append(zima)

        let deSpan = document.createElement("span")
        wordElement.append(deSpan)
        deSpan.style.color = "purple"
        deSpan.style.fontWeight = "bold"
        deSpan.innerText = " DE: "
        let deWordSpan = document.createElement("span")
        wordElement.append(deWordSpan)
        deWordSpan.style.color = "white"
        deWordSpan.innerText = thisWord.deWord

        let zima2 = document.createElement("br")
        wordElement.append(zima2)
    }
}

function changeMode(){
    const nav = document.querySelector("nav")
    const navLogoText = document.querySelector("#nav-logo-text")
    const wordsListHeader = document.querySelector("#words-list-header")

    if (darkMode && darkMode !== "false"){
        document.body.style.backgroundColor = "rgb(22, 22, 22)"
        nav.style.backgroundColor = "rgb(22, 22, 22)"
        navLogoText.style.color = "white"
        wordsListHeader.style.color = "white"
    }
    else{
        document.body.style.backgroundColor = "#FDFBFD"
        nav.style.backgroundColor = "#FDFBFD"
        navLogoText.style.color = "#021F31"
        wordsListHeader.style.color = "#021F31"
    }
}

function onWordsRangeChange(){
    const selectedItem = wordsRange.value

    if (currentFileName === selectedItem) return

    currentFileName = selectedItem

    loadLection("..", currentFileName, displayWords)
}

function main(){
    const navLogo = document.querySelector("#nav-logo")
    navLogo.addEventListener("click", () => {
        window.location.href = "../index.html"
    })

    const lectionSelect = document.querySelector("#basic-data")
    
    updateHTMLSelect(lectionSelect)

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

    wordsRange.addEventListener("change", onWordsRangeChange)

    onWordsRangeChange()
}

main()