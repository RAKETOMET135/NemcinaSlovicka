import { loadLection, getLectionFileNames, updateHTMLSelect } from "../loader/lection_loader.js"
import { saveData, loadData } from "../loader/data_saver.js"

const mainSection = document.querySelector("#main-section")
const helperSection = document.querySelector("#helper-section")
const statsSection = document.querySelector("#stats-section")
const selectionSection = document.querySelector("#selection-section")
const wordsListPreviewSection = document.querySelector("#words-list-preview")

const wordsListBasicData = document.querySelector("#basic-data")
const wordsListWords = document.querySelector("#words-list-words")

const displayWord = document.querySelector("#display-word")
const userInput = document.querySelector("#user-input")
const submitButton = document.querySelector("#submit-answer")
const ttsButton = document.querySelector("#tts-button")
const repeatWord = document.querySelector("#repeat-word")
const wordsRange = document.querySelector("#words-range")
const allWordsSeenMark = document.querySelector("#all-words-seen-mark")
const wordsListButton = document.querySelector("#words-list-button")
const wordsListButton2 = document.querySelector("#words-list-button2")

const aUmlautButton = document.querySelector("#a-umlaut-button")
const oUmlautButton = document.querySelector("#o-umlaut-button")
const uUmlautButton = document.querySelector("#u-umlaut-button")
const sharpSButton = document.querySelector("#sharp-s-button")
const upperCaseButton = document.querySelector("#upper-case-button")
const skipCorrectAnswerButton = document.querySelector("#skip-correct-answer-button")
const hintButton = document.querySelector("#hint-button")
const flipWordsButton = document.querySelector("#flip-words-button")

const correctText = document.querySelector("#correct")
const incorrectText = document.querySelector("#incorrect")
const streakText = document.querySelector("#streak")
const streakImage = document.querySelector("#streak-img")

let currentWordFile = NaN
let currentFileName = ""
let prevWord
let currentWord
let hint = ""
let language = "de"

let skipCorrectAnswer = false
let submitState = "submit"
let correctColor = "rgb(4, 187, 4)"
let incorrectColor = "rgb(235, 0, 0)"
let hintColor = "rgb(1, 64, 201)"

let upperCase = false
let altHolded = false

let tts = false
let speachText = new SpeechSynthesisUtterance()

let correctData = 0
let incorrect = 0
let streak = 0

let darkMode = false

function onWordFileLoad(newWordFile){
    currentWordFile = newWordFile

    updateStats()

    displayNextWord()
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

function sayWord(usedWord){
    window.speechSynthesis.cancel()

    if (language === "de"){
        speachText.text = usedWord.czWord
        speachText.lang = "cs-CS"
    }
    else{
        speachText.text = usedWord.deWord
        speachText.lang = "de-DE"
    }

    window.speechSynthesis.speak(speachText)
}

function changeTTS(){
    tts = !tts

    if (tts){
        displayWord.style.color = "#021F31"
        ttsButton.style.setProperty("--before-image", 'url("../images/NoVoiceIcon.png")')
        repeatWord.style.visibility = "visible"

        sayWord(currentWord)
    }
    else{
        displayWord.style.color = "white"
        ttsButton.style.setProperty("--before-image", 'url("../images/VoiceIcon.png")')
        repeatWord.style.visibility = "hidden"
    }
}

function updateWordsData(correct){
    for (let i = 0; i < currentWordFile.length; i++){
        const thisWord = currentWordFile[i]

        if (thisWord.czWord === currentWord.czWord){
            if (correct && hint === ""){
                currentWordFile[i].correct += 1
                currentWordFile[i].streak += 1

                if (currentWordFile[i].maxStreak < currentWordFile[i].streak) {
                    currentWordFile[i].maxStreak = currentWordFile[i].streak
                }

                correctData++
                streak++
            }
            else if (correct){
                currentWordFile[i].timesHintUsed += 1
            }
            else {
                currentWordFile[i].incorrect += 1
                currentWordFile[i].streak = 0

                incorrect++
                streak = 0
            }
        }
    }
}

function updateStats(){
    correctText.innerText = correctData.toString()
    incorrectText.innerText = incorrect.toString()
    streakText.innerText = streak.toString()

    const streakScale = 1 * (streak/30) +1
    streakImage.style.transform = "scale(" + streakScale + ", " + streakScale + ")"

    let allSeen = true
    for (let i = 0; i < currentWordFile.length; i++){
        const wordFileWord = currentWordFile[i]

        if (wordFileWord.timesDisplayed > 0) continue

        allSeen = false
        break
    }

    if (allSeen){
        allWordsSeenMark.style.visibility = "visible"
    }
}

function submitAnswer(){
    if (submitState === "submit"){
        const userText = userInput.value
        const correct = checkInput(userText)

        updateWordsData(correct)
        updateStats()

        if (correct){
            if (skipCorrectAnswer){
                displayNextWord()

                return
            }

            userInput.style.color = correctColor
        }
        else{
            let correctAnswer = currentWord.dePossibleAnswers[0]

            if (language === "cz"){
                correctAnswer = currentWord.czPossibleAnswers[0]
            }

            userInput.value += " --> " + correctAnswer
            userInput.style.color = incorrectColor
        }

        submitState = "submitted"
        userInput.readOnly = true
        submitButton.style.setProperty("--before-content", '"➔"')
    }
    else{
        submitState = "submit"
        userInput.readOnly = false
        userInput.style.color = "white"
        submitButton.style.setProperty("--before-content", '"✓"')

        displayNextWord()
    }
}

function displayNextWord(){
    let pickedWord

    let totalWordChance = 0
    let usedWordChance = 0

    for (let i = 0; i < currentWordFile.length; i++){
        const thisWord = currentWordFile[i]

        let wordUserSuccess = 1000 - (Math.abs(thisWord.incorrect - thisWord.correct) *50)

        if (thisWord.correct > thisWord.incorrect) wordUserSuccess = 1000
        if (wordUserSuccess < 1) wordUserSuccess = 10

        const wordDisplaySuccess = thisWord.timesDisplayed + 1

        let wordChance = 100000 / wordUserSuccess / wordDisplaySuccess

        if (thisWord === prevWord){
            wordChance = 0
        }
        else if (prevWord){
            if (thisWord.czWord === prevWord.czWord){
                wordChance = 0
            }
        }

        wordChance *= thisWord.priority

        thisWord.chance = wordChance
        totalWordChance += wordChance
    }

    const chosedNumber = Math.floor(Math.random() * totalWordChance +1)

    for (let i = 0; i < currentWordFile.length; i++){
        const thisWord = currentWordFile[i]

        if (thisWord.chance === 0) continue

        if (chosedNumber > usedWordChance && chosedNumber <= usedWordChance + thisWord.chance){
            pickedWord = thisWord

            break
        }

        usedWordChance += thisWord.chance
    }

    let chanceForIncorrect = Math.floor(Math.random() * 2)
    if (chanceForIncorrect === 0){
        let allIncorrectWords = []

        for (let i = 0; i < currentWordFile.length; i++){
            const thisWord = currentWordFile[i]

            if (thisWord.incorrect > thisWord.correct && currentWord !== thisWord){
                allIncorrectWords.push(thisWord)
            }
        }

        if (allIncorrectWords.length > 0) pickedWord = allIncorrectWords[Math.floor(Math.random() * allIncorrectWords.length)]
    }

    if (tts){
        sayWord(pickedWord)
    }

    for (let i = 0; i < currentWordFile.length; i++){
        const thisWord = currentWordFile[i]

        if (thisWord.czWord === pickedWord.czWord){
            currentWordFile[i].timesDisplayed += 1
        }
    }

    if (language === "de"){
        displayWord.innerText = pickedWord.czWord
    }
    else{
        displayWord.innerText = pickedWord.deWord
    }
   
    userInput.value = ""

    currentWord = pickedWord
    prevWord = pickedWord

    hint = ""
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

function giveHint(){
    if (submitState === "submitted") return

    userInput.style.color = hintColor

    let correctAnswer
    if (language === "de"){
        correctAnswer = currentWord.dePossibleAnswers[0]
    }
    else{
        correctAnswer = currentWord.czPossibleAnswers[0]
    }

    if (hint.length === 0){
        const before = correctAnswer.slice(0, 4)

        if (before === "der " || before === "die " || before === "das "){
            hint = before
        }
        else{
            hint = correctAnswer.slice(0, 1)
        }
    }
    else{
        hint = correctAnswer.slice(0, hint.length +1)
    }

    userInput.value = hint
    userInput.focus()
}

function flipWords(){
    if (submitState === "submit"){
        for (let i = 0; i < currentWordFile.length; i++){
            const thisWord = currentWordFile[i]
    
            if (thisWord.czWord === currentWord.czWord){
                currentWordFile[i].timesDisplayed -= 1
            }
        }
    }

    submitState = "submit"
    userInput.readOnly = false
    userInput.style.color = "white"
    submitButton.style.setProperty("--before-content", '"✓"')

    if (language === "de"){
        language = "cz"
    }
    else{
        language = "de"
    }

    displayNextWord()
}

function onKeyDown(event){
    if (event.key === "Enter"){
        submitAnswer()
    }
    else if (event.key === "Alt"){
        altHolded = true
    }

    if (altHolded){
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

function onWordsRangeChange(){
    const selectedItem = wordsRange.value

    if (currentFileName === selectedItem) return

    currentFileName = selectedItem

    correctData = 0
    incorrect = 0
    streak = 0

    allWordsSeenMark.style.visibility = "hidden"

    loadLection("..", currentFileName, onWordFileLoad)
}

function displayWordsListUserStats(){
    let totalCorrectWords = 0
    let totalIncorrectWords = 0
    let totalHintUsedWords = 0
    let toatlDisplayedWords = 0

    for (let i = 0; i < currentWordFile.length; i++){
        const thisWord = currentWordFile[i]

        totalCorrectWords += thisWord.correct
        totalIncorrectWords += thisWord.incorrect
        totalHintUsedWords += thisWord.timesHintUsed
        toatlDisplayedWords += thisWord.timesDisplayed
    }

    while (wordsListBasicData.firstChild) wordsListBasicData.firstChild.remove()

    let c = document.createElement("span")
    wordsListBasicData.append(c)
    c.innerText = "( "
    c.style.color = correctColor
    c.style.fontWeight = "bold"

    let cImg = document.createElement("img")
    wordsListBasicData.append(cImg)
    cImg.src = "../images/Correct.png"
    cImg.style.width = "16px"
    cImg.style.height = "16px"
    cImg.style.position = "relative"
    cImg.style.top = "2.5px"

    let c2 = document.createElement("span")
    wordsListBasicData.append(c2)
    c2.innerText = " " + totalCorrectWords + " ) "
    c2.style.color = correctColor
    c2.style.fontWeight = "bold"


    let i = document.createElement("span")
    wordsListBasicData.append(i)
    i.innerText = "( "
    i.style.color = incorrectColor
    i.style.fontWeight = "bold"

    let iImg = document.createElement("img")
    wordsListBasicData.append(iImg)
    iImg.src = "../images/Incorrect.png"
    iImg.style.width = "16px"
    iImg.style.height = "16px"
    iImg.style.position = "relative"
    iImg.style.top = "2.5px"

    let i2 = document.createElement("span")
    wordsListBasicData.append(i2)
    i2.innerText = " " + totalIncorrectWords + " ) "
    i2.style.color = incorrectColor
    i2.style.fontWeight = "bold"


    let h = document.createElement("span")
    wordsListBasicData.append(h)
    h.innerText = "( "
    h.style.color = hintColor
    h.style.fontWeight = "bold"

    let hImg = document.createElement("img")
    wordsListBasicData.append(hImg)
    hImg.src = "../images/QuestionMarkIcon.png"
    hImg.style.width = "16px"
    hImg.style.height = "16px"
    hImg.style.position = "relative"
    hImg.style.top = "2.5px"

    let h2 = document.createElement("span")
    wordsListBasicData.append(h2)
    h2.innerText = " " + totalHintUsedWords + " ) "
    h2.style.color = hintColor
    h2.style.fontWeight = "bold"


    let d = document.createElement("span")
    wordsListBasicData.append(d)
    d.innerText = "( "
    d.style.color = "yellow"
    d.style.fontWeight = "bold"

    let dImg = document.createElement("img")
    wordsListBasicData.append(dImg)
    dImg.src = "../images/EyeIcon.png"
    dImg.style.width = "16px"
    dImg.style.height = "16px"
    dImg.style.position = "relative"
    dImg.style.top = "2.5px"

    let d2 = document.createElement("span")
    wordsListBasicData.append(d2)
    d2.innerText = " " + toatlDisplayedWords + " ) "
    d2.style.color = "yellow"
    d2.style.fontWeight = "bold"
}

function addListWordsToPreview(){
    while (wordsListWords.firstChild) wordsListWords.firstChild.remove()

    for (let i = 0; i < currentWordFile.length; i++){
        const thisWord = currentWordFile[i]

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

        let correctStart = document.createElement("span")
        wordElement.append(correctStart)
        correctStart.style.color = correctColor
        correctStart.style.fontWeight = "bold"
        correctStart.innerText = " ("

        let correctImage = document.createElement("img")
        wordElement.append(correctImage)
        correctImage.src = "../images/Correct.png"
        correctImage.style.width = "16px"
        correctImage.style.height = "16px"
        correctImage.style.marginLeft = "5px"
        correctImage.style.position = "relative"
        correctImage.style.top = "2.5px"

        let correct = document.createElement("span")
        wordElement.append(correct)
        correct.style.color = correctColor
        correct.style.fontWeight = "bold"
        correct.innerText = " " + thisWord.correct + " )"


        let incorrectStart = document.createElement("span")
        wordElement.append(incorrectStart)
        incorrectStart.style.color = incorrectColor
        incorrectStart.style.fontWeight = "bold"
        incorrectStart.innerText = " ("

        let incorrectImage = document.createElement("img")
        wordElement.append(incorrectImage)
        incorrectImage.src = "../images/Incorrect.png"
        incorrectImage.style.width = "16px"
        incorrectImage.style.height = "16px"
        incorrectImage.style.marginLeft = "5px"
        incorrectImage.style.position = "relative"
        incorrectImage.style.top = "2.5px"

        let incorrect = document.createElement("span")
        wordElement.append(incorrect)
        incorrect.style.color = incorrectColor
        incorrect.style.fontWeight = "bold"
        incorrect.innerText = " " + thisWord.incorrect + " )"


        let hintStart = document.createElement("span")
        wordElement.append(hintStart)
        hintStart.style.color = hintColor
        hintStart.style.fontWeight = "bold"
        hintStart.innerText = " ("

        let hintImage = document.createElement("img")
        wordElement.append(hintImage)
        hintImage.src = "../images/QuestionMarkIcon.png"
        hintImage.style.width = "16px"
        hintImage.style.height = "16px"
        hintImage.style.marginLeft = "5px"
        hintImage.style.position = "relative"
        hintImage.style.top = "2.5px"

        let hint = document.createElement("span")
        wordElement.append(hint)
        hint.style.color = hintColor
        hint.style.fontWeight = "bold"
        hint.innerText = " " + thisWord.timesHintUsed + " )"


        let eyeStart = document.createElement("span")
        wordElement.append(eyeStart)
        eyeStart.style.color = "yellow"
        eyeStart.style.fontWeight = "bold"
        eyeStart.innerText = " ("

        let eyeImage = document.createElement("img")
        wordElement.append(eyeImage)
        eyeImage.src = "../images/EyeIcon.png"
        eyeImage.style.width = "16px"
        eyeImage.style.height = "16px"
        eyeImage.style.marginLeft = "5px"
        eyeImage.style.position = "relative"
        eyeImage.style.top = "2.5px"

        let eye = document.createElement("span")
        wordElement.append(eye)
        eye.style.color = "yellow"
        eye.style.fontWeight = "bold"
        eye.innerText = " " + thisWord.timesDisplayed + " )"

        if (thisWord.timesDisplayed < 1){
            for (let j = 0; j < wordElement.childNodes.length; j++){
                const textElement = wordElement.childNodes[j]

                textElement.style.opacity = "0.1"
            }
        }
    }
}

function openWordListPreview(){
    mainSection.style.visibility = "hidden"
    helperSection.style.visibility = "hidden"
    statsSection.style.visibility = "hidden"
    selectionSection.style.visibility = "hidden"

    wordsListPreviewSection.style.visibility = "visible"

    displayWordsListUserStats()
    addListWordsToPreview()
}

function closeWordListPreview(){
    mainSection.style.visibility = "visible"
    helperSection.style.visibility = "visible"
    statsSection.style.visibility = "visible"
    selectionSection.style.visibility = "visible"

    wordsListPreviewSection.style.visibility = "hidden"
}

function changeMode(){
    const nav = document.querySelector("nav")
    const navLogoText = document.querySelector("#nav-logo-text")
    const wordsRangeHeader = document.querySelector("#words-range-header")
    const wordsListHeader = document.querySelector("#words-list-header")

    if (darkMode && darkMode !== "false"){
        document.body.style.backgroundColor = "rgb(22, 22, 22)"
        nav.style.backgroundColor = "rgb(22, 22, 22)"
        navLogoText.style.color = "white"
        wordsRangeHeader.style.color = "white"
        wordsListHeader.style.color = "white"
    }
    else{
        document.body.style.backgroundColor = "#FDFBFD"
        nav.style.backgroundColor = "#FDFBFD"
        navLogoText.style.color = "#021F31"
        wordsRangeHeader.style.color = "#021F31"
        wordsListHeader.style.color = "#021F31"    
    }
}

function main(){
    const navLogo = document.querySelector("#nav-logo")
    navLogo.addEventListener("click", () => {
        window.location.href = "../index.html"
    })

    submitButton.addEventListener("click", submitAnswer)
    ttsButton.addEventListener("click", changeTTS)
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("keyup", onKeyUp)
    repeatWord.addEventListener("click", () => {
        sayWord(currentWord)
    })

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
    skipCorrectAnswerButton.addEventListener("click", () => {
        skipCorrectAnswer = !skipCorrectAnswer

        if (skipCorrectAnswer){
            skipCorrectAnswerButton.style.setProperty("--before-skip", '"||"')
        }
        else{
            skipCorrectAnswerButton.style.setProperty("--before-skip", '"≪"')
        }
    })
    hintButton.addEventListener("click", giveHint)
    flipWordsButton.addEventListener("click", flipWords)
    wordsListButton.addEventListener("click", openWordListPreview)
    wordsListButton2.addEventListener("click", closeWordListPreview)

    speachText.volume = 1
    repeatWord.style.visibility = "hidden"

    const lections = getLectionFileNames()
    const primaryLection = lections[0]

    updateHTMLSelect(wordsRange)

    currentFileName = primaryLection[0]
    wordsRange.addEventListener("change", onWordsRangeChange)

    loadLection("..", lections[0][0], onWordFileLoad)

    allWordsSeenMark.style.visibility = "hidden"
    wordsListPreviewSection.style.visibility = "hidden"

    darkMode = loadData("darkMode")
    if (!darkMode || darkMode === NaN) {
        saveData(false, "darkMode")
        darkMode = false
    }

    const darkModeButton = document.querySelector("#dark-mode")

    if (darkMode && darkMode !== "false"){
        darkModeButton.setAttribute("src", "../images/sun.png")
    }
    else {
        darkModeButton.setAttribute("src", "../images/moon.png")
    }

    darkModeButton.addEventListener("click", () => {
        darkMode = !darkMode
        saveData(darkMode, "darkMode")

        if (darkMode && darkMode !== "false"){
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