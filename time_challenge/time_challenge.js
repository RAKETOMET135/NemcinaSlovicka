import { saveData, loadData } from "../loader/data_saver.js"
import { getLectionFileNames, loadLection, updateHTMLSelect } from "../loader/lection_loader.js"
import { Random } from "../structure/random.js"

const userInput = document.querySelector("#user-input")
const displayWord = document.querySelector("#display-word")
const wordsRange = document.querySelector("#words-range")
const difficultyRange = document.querySelector("#difficulty-range")
const variantRange = document.querySelector("#variant-range")
const playButton = document.querySelector("#play-button")
const roundElements = document.querySelectorAll(".round-element")
const menuElements = document.querySelectorAll(".menu-element")
const resultElements = document.querySelectorAll(".result-element")

const aUmlautButton = document.querySelector("#a-umlaut-button")
const oUmlautButton = document.querySelector("#o-umlaut-button")
const uUmlautButton = document.querySelector("#u-umlaut-button")
const sharpSButton = document.querySelector("#sharp-s-button")
const upperCaseButton = document.querySelector("#upper-case-button")

const timeBar = document.querySelector("#time-bar")
const result = document.querySelector("#result")
const backButton = document.querySelector("#back-button")

let time = 0
let currentTime = 0
let isGame = false

let answeredWords = 0

let currentWordFile
let currentWord

let darkMode = false
let altHolded = false
let difficulty = "normal"
let availableWords = []
let language = "de"
let upperCase = false

function changeTimeBarSize(){
    if (currentTime > time) return

    let move = (80 / time) * currentTime
    move = 80 - move

    timeBar.style.width = `${move}%`
}

function changeMode(){
    const nav = document.querySelector("nav")
    const navLogoText = document.querySelector("#nav-logo-text")
    const resultHeader = document.querySelector("#result-header")
    const mainSectionHeader = document.querySelector("#main-section-header")
    const wordsRangeHeader = document.querySelector("#words-range-header")
    const difficultyRangeHeader = document.querySelector("#difficulty-range-header")
    const timeBarDecor = document.querySelector("#time-bar-decor")
    const variantRangeHeader = document.querySelector("#variant-range-header")

    if (darkMode && darkMode !== "false"){
        document.body.style.backgroundColor = "rgb(22, 22, 22)"
        nav.style.backgroundColor = "rgb(22, 22, 22)"
        navLogoText.style.color = "white"
        result.style.color = "white"
        mainSectionHeader.style.color = "white"
        resultHeader.style.color = "white"
        wordsRangeHeader.style.color = "white"
        difficultyRangeHeader.style.color = "white"
        timeBar.style.backgroundColor = "white"
        timeBarDecor.style.outlineColor = "white"
        variantRangeHeader.style.color = "white"
    }
    else{
        document.body.style.backgroundColor = "#FDFBFD"
        nav.style.backgroundColor = "#FDFBFD"
        navLogoText.style.color = "#021F31"
        result.style.color = "#021F31"
        mainSectionHeader.style.color = "#021F31"
        resultHeader.style.color = "#021F31"
        wordsRangeHeader.style.color = "#021F31"
        difficultyRangeHeader.style.color = "#021F31"
        timeBar.style.backgroundColor = "#021F31"
        timeBarDecor.style.outlineColor = "#021F31"
        variantRangeHeader.style.color = "#021F31"
    }
}

function elementsState(elements, state){
    let vis = "hidden"
    if (state){
        vis = "visible"
    }

    elements.forEach(element => {
        element.style.visibility = vis
    })
}

function insertLetterAtCursor(letter){
    if (document.selection) {
        userInput.focus()
        let selected = document.selection.createRange()
        selected.text = letter
        selected.moveStart("character", letter.length)
        selected.select()
    }
    else if (userInput.selectionStart || userInput.selectionStart == '0') {
        let startPos = userInput.selectionStart
        let endPos = userInput.selectionEnd
        userInput.value = userInput.value.substring(0, startPos)
            + letter
            + userInput.value.substring(endPos, userInput.value.length)
        userInput.selectionStart = startPos + letter.length
        userInput.selectionEnd = startPos + letter.length
    } else {
        userInput.value += letter
    }
}

function onKeyDown(event){
    if (event.key === "Alt"){
        altHolded = true
    }

    if (event.altKey){
        if (event.key === "a"){
            insertLetterAtCursor("ä")
            userInput.focus()
        }
        else if (event.key === "A"){
            insertLetterAtCursor("Ä")
            userInput.focus()
        }
        else if (event.key === "o"){
            insertLetterAtCursor("ö")
            userInput.focus()
        }
        else if (event.key === "O"){
            insertLetterAtCursor("Ö")
            userInput.focus()
        }
        else if (event.key === "u"){
            insertLetterAtCursor("ü")
            userInput.focus()
        }
        else if (event.key === "U"){
            insertLetterAtCursor("Ü")
            userInput.focus()
        }
        else if (event.key === "s" || event.key === "S"){
            insertLetterAtCursor("ß")
            userInput.focus()
        }
    }
}

function onKeyUp(event){
    if (event.key === "Alt"){
        altHolded = false
    }
}

function getRandomWord(){
    let nextWord

    if (availableWords.length <= 0) {
        availableWords = []

        for (let i = 0; i < currentWordFile.length; i++) {
            const priority = currentWordFile[i].priority

            for (let j = 0; j < priority; j++) {
                availableWords.push(i)
            }
        }
    }

    let randomWordIndex = Random.getNumber(0, availableWords.length - 1)

    nextWord = currentWordFile[availableWords[randomWordIndex]]

    if (currentWord){
        while (nextWord === currentWord){
            nextWord = currentWordFile[availableWords[randomWordIndex]]
        }
    }

    if (nextWord) {
        availableWords.splice(randomWordIndex, 1)
    }

    return nextWord
}

function onLectionLoad(words, lang){
    currentWordFile = words

    isGame = true
    
    displayNextWord()
}

function onPreloadFile(words, lang){
    while (variantRange.children.length > 0){
        variantRange.firstChild.remove()
    }

    let lang1 = "CZ"
    let lang2 = "DE"

    if (lang){
        if (lang[0] !== ""){
            lang1 = lang[0]
        }
        if (lang[1] !== ""){
            lang2 = lang[1]
        }
    }

    let newOption = document.createElement("option")
    newOption.innerText = `${lang1} -> ${lang2}`
    newOption.value = "de"
    variantRange.append(newOption)

    let newOption2 = document.createElement("option")
    newOption2.innerText = `${lang2} -> ${lang1}`
    newOption2.value = "cz"
    variantRange.append(newOption2)
}

function displayNextWord(){
    let nextWord = getRandomWord()

    if (!nextWord){
        displayNextWord()
        return
    }

    if (language === "de"){
        displayWord.innerText = nextWord.czWord
    }
    else{
        displayWord.innerText = nextWord.deWord
    }

    currentWord = nextWord
}

function checkInput(inputString){
    let possibleAnswers = []
    let userAnswers = []

    if (language === "de"){
        possibleAnswers = currentWord.dePossibleAnswers
    }
    else{
        possibleAnswers = currentWord.czPossibleAnswers
    }

    let currentlyBuildedWord = ""
    for (let i = 0; i < inputString.length; i++){
        const letter = inputString.slice(i, i +1)

        if (letter === ","){
            userAnswers.push(currentlyBuildedWord)
            currentlyBuildedWord = ""
            continue
        }

        if (letter === " "){
            if (inputString.slice(i -1, i) === "," || inputString.slice(i +1, i +2) === "("){
                continue
            }
        }

        if (letter === "("){
            userAnswers.push(currentlyBuildedWord)
            currentlyBuildedWord = ""
            continue
        }

        if (letter === ")"){
            userAnswers.push(currentlyBuildedWord)
            currentlyBuildedWord = ""
            continue
        }

        currentlyBuildedWord += letter

        if (i === inputString.length -1) userAnswers.push(currentlyBuildedWord)
    }

    let allAnsweredWordsCorrect = true
    for (let i = 0; i < userAnswers.length; i++){
        const userAnswer = userAnswers[i]
        let isCorrect = false

        for (let j = 0; j < possibleAnswers.length; j++){
            const possibleAnswer = possibleAnswers[j]

            if (possibleAnswer === userAnswer){
                isCorrect = true
                break
            }
        }

        if (!isCorrect) allAnsweredWordsCorrect = false
    }

    if (userAnswers.length < 1) allAnsweredWordsCorrect = false

    return allAnsweredWordsCorrect
}

function onInputChange(){
    const inputString = userInput.value
    const correct = checkInput(inputString)
    
    if (correct){
        answeredWords++

        displayNextWord()

        userInput.value = ""

        currentTime = 0

        if (answeredWords === 7){
            time -= time/12
        }
        else if (answeredWords === 15){
            time -= time/11
        }
        else if (answeredWords === 35){
            time -= time/10
        }
        else if (answeredWords === 50){
            time -= time/8
        }
        else if (answeredWords === 100){
            time -= time/6
        }
    }
}

function startGame(){
    elementsState(menuElements, false)
    elementsState(roundElements, true)

    difficulty = difficultyRange.value

    switch (difficulty){
        case "easy":
            time = 20
            break
        case "normal":
            time = 10
            break
        case "hard":
            time = 7
            break
        default:
            time = 4
            break
    }

    userInput.value = ""
    
    availableWords = []

    currentTime = 0

    answeredWords = 0

    language = variantRange.value

    altHolded = false

    changeTimeBarSize()

    loadLection("..", wordsRange.value, onLectionLoad)
}

function backToMenu(){
    elementsState(resultElements, false)
    elementsState(menuElements, true)
}

function onWordsRangeChange(){
    const selectedItem = wordsRange.value

    loadLection("..", selectedItem, onPreloadFile)
}

function on10Miliseconds(){
    if (isGame){
        currentTime += 0.01

        changeTimeBarSize()

        if (currentTime >= time){
            isGame = false

            elementsState(roundElements, false)
            elementsState(resultElements, true)

            result.innerText = `Počet zodpovězených slov: ${answeredWords}`
        }
    }
}

function main(){
    const navLogo = document.querySelector("#nav-logo")
    navLogo.addEventListener("click", () => {
        window.location.href = "../index.html"
    })

    const lections = getLectionFileNames()
    const primaryLection = lections[0][0]

    loadLection("..", primaryLection, onPreloadFile)

    updateHTMLSelect(wordsRange)

    elementsState(roundElements, false)
    elementsState(resultElements, false)

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

    aUmlautButton.addEventListener("click", () => {
        let letter = "ä"
        if (upperCase) letter = "Ä"

        insertLetterAtCursor(letter)

        userInput.focus()
    })
    oUmlautButton.addEventListener("click", () => {
        let letter = "ö"
        if (upperCase) letter = "Ö"

        insertLetterAtCursor(letter)

        userInput.focus()
    })
    uUmlautButton.addEventListener("click", () => {
        let letter = "ü"
        if (upperCase) letter = "Ü"

        insertLetterAtCursor(letter)

        userInput.focus()
    })
    sharpSButton.addEventListener("click", () => {
        insertLetterAtCursor("ß")

        userInput.focus()
    })
    upperCaseButton.addEventListener("click", () => {
        upperCase = !upperCase

        if (upperCase){
            aUmlautButton.style.setProperty("--before-a", '"Ä"')
            oUmlautButton.style.setProperty("--before-o", '"Ö"')
            uUmlautButton.style.setProperty("--before-u", '"Ü"')
        }
        else{
            aUmlautButton.style.setProperty("--before-a", '"ä"')
            oUmlautButton.style.setProperty("--before-o", '"ö"')
            uUmlautButton.style.setProperty("--before-u", '"ü"')
        }
    })

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("keyup", onKeyUp)
    playButton.addEventListener("click", startGame)
    userInput.addEventListener("input", onInputChange)
    backButton.addEventListener("click", backToMenu)
    wordsRange.addEventListener("change", onWordsRangeChange)

    setInterval(on10Miliseconds, 10)
}

main()