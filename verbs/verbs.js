import { loadData, saveData } from "../loader/data_saver.js"
import { getVerbFileNames, loadVerbFile, updateHTMLSelectVerbFile } from "../loader/lection_loader.js"
import { Random } from "../structure/random.js"
import { DataHolder } from "../structure/data_holder.js"

let dataHolder = new DataHolder("website_data")

const wordsRange = document.querySelector("#words-range")
const allWordsSeenMark = document.querySelector("#all-words-seen-mark")
const correctText = document.querySelector("#correct")
const incorrectText = document.querySelector("#incorrect")
const streakText = document.querySelector("#streak")
const streakImage = document.querySelector("#streak-img")
const displayWord = document.querySelector("#display-word")
const deUserInput = document.querySelector("#de-input")
const perfektUserInput = document.querySelector("#perfekt-input")
const submitButton = document.querySelector("#submit-answer")
const ttsButton = document.querySelector("#tts-button")
const aUmlautButton = document.querySelector("#a-umlaut-button")
const oUmlautButton = document.querySelector("#o-umlaut-button")
const uUmlautButton = document.querySelector("#u-umlaut-button")
const sharpSButton = document.querySelector("#sharp-s-button")
const upperCaseButton = document.querySelector("#upper-case-button")
const skipCorrectAnswerButton = document.querySelector("#skip-correct-answer-button")
const repeatWord = document.querySelector("#repeat-word")
const wordsListPreview = document.querySelector("#words-list-preview")
const mainSection = document.querySelector("#main-section")
const helperSection = document.querySelector("#helper-section")
const statsSection = document.querySelector("#stats-section")
const selectionSection = document.querySelector("#selection-section")
const wordsListBasicData = document.querySelector("#basic-data")
const wordsListWords = document.querySelector("#words-list-words")
const wordsListButton = document.querySelector("#words-list-button")
const wordsListButton2 = document.querySelector("#words-list-button2")
const hintButton = document.querySelector("#hint-button")

let currentFileName = ""
let currentWordFile
let sessionDataLoaded = false
let currentWord
let prevWord
let tts = false
let speachText = new SpeechSynthesisUtterance()
let darkMode = false
let correctData = 0
let incorrect = 0
let streak = 0
let availableWords = []
let incorrectWords = []
let skipCorrectAnswer = false
let submitState = "submit"
let correctColor = "rgb(4, 187, 4)"
let incorrectColor = "rgb(235, 0, 0)"
let hintColor = "rgb(1, 64, 201)"
let altHolded = false
let focusInput = null
let upperCase = false
let allWordsSeenMarkVisible = false
let deHint = ""
let perfektHint = ""

function onWordFileLoad(words, lang){
    currentWordFile = words

    updateStats()

    displayNextWord()

    if (sessionDataLoaded) return

    sessionDataLoaded = true

    loadSessionData()
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

function onWordsRangeChange(){
    const selectedItem = wordsRange.value

    if (currentFileName === selectedItem) return

    currentFileName = selectedItem

    correctData = 0
    incorrect = 0
    streak = 0

    allWordsSeenMark.style.visibility = "hidden"

    loadVerbFile("..", currentFileName, onWordFileLoad)
}

function loadSessionData(){
    let sessionPageData = window.sessionStorage.getItem("page_data_verbs")

    if (sessionPageData === null) return

    sessionPageData = JSON.parse(sessionPageData)

    currentWordFile = sessionPageData.wordsList
    currentFileName = sessionPageData.wordCategory
    streak = sessionPageData.wordStreak
    correctData = sessionPageData.wordCorrect
    incorrect = sessionPageData.wordIncorrect
    prevWord = sessionPageData.prevWord
    deUserInput.value = sessionPageData.userText
    deUserInput.style.color = sessionPageData.userTextColor
    perfektUserInput.value = sessionPageData.userText2
    perfektUserInput.style.color = sessionPageData.userText2Color
    availableWords = sessionPageData.availableWords
    incorrectWords = sessionPageData.incorrectWords
    deHint = sessionPageData.deHint
    perfektHint = sessionPageData.perfektHint

    updateStats()

    wordsRange.value = currentFileName

    currentWord = sessionPageData.wordDisplayed

     if (currentWord.perfektPossibleAnswers && currentWord.perfektPossibleAnswers[0]){
        perfektUserInput.style.display = "block"
        deUserInput.style.translate = "none"
    }
    else{
        perfektUserInput.style.display = "none"
        deUserInput.style.translate = "0 50%"
    }

    displayWord.innerText = currentWord.czWord

    submitState = sessionPageData.submitState

    if (submitState === "submitted"){
        deUserInput.readOnly = true
        perfektUserInput.readOnly = true
        submitButton.style.setProperty("--before-content", '"➔"')
    }
}

function changeTTS(){
    tts = !tts

    if (tts){
        displayWord.style.color = "#021F31"
        ttsButton.style.setProperty("--before-image", 'url("../images/NoVoiceIcon.png")')
        repeatWord.style.visibility = "visible"

        if (currentWord){
            sayWord(currentWord)
        }
    }
    else{
        displayWord.style.color = "white"
        ttsButton.style.setProperty("--before-image", 'url("../images/VoiceIcon.png")')
        repeatWord.style.visibility = "hidden"
    }

    dataHolder.updateData("tts", tts)
}

function sayWord(usedWord){
    window.speechSynthesis.cancel()

    if (usedWord.czWord) {
        speachText.text = usedWord.czWord
        speachText.lang = "cs-CS"

        window.speechSynthesis.speak(speachText)
    }
}

function getRandomWord(){
    let nextWord

    if (availableWords.length <= 0){
        availableWords = []
        
        for (let i = 0; i < currentWordFile.length; i++){
            const priority = currentWordFile[i].priority

            for (let j = 0; j < priority; j++){
                availableWords.push(i)
            }
        }
    }

    let randomWordIndex = Random.getNumber(0, availableWords.length -1)

    nextWord = currentWordFile[availableWords[randomWordIndex]]

    if (currentWord){
        while (nextWord === currentWord){
            randomWordIndex = Random.getNumber(0, availableWords.length -1)

            nextWord = currentWordFile[availableWords[randomWordIndex]]
        }
    }

    if (nextWord){
        availableWords.splice(randomWordIndex, 1)
    }

    return nextWord
}

function getNextWord(){
    let nextWord
    let chanceForIncorrect = Random.getNumber(0, 1)

    if (incorrectWords.length <= 0) chanceForIncorrect = 0

    if (chanceForIncorrect === 0){
        nextWord = getRandomWord()
    }
    else{
        for (let i = 0; i < incorrectWords.length; i++){
            let pickedWord = incorrectWords[i]

            if (pickedWord === prevWord) continue

            nextWord = pickedWord

            incorrectWords.splice(i, 1)

            break
        }

        if (!nextWord) nextWord = getRandomWord()
    }

    return nextWord
}

function displayNextWord(){
    let pickedWord

    pickedWord = getNextWord()
    
    if (!pickedWord){
        displayNextWord()

        return
    }

    if (tts && sessionDataLoaded){
        sayWord(pickedWord)
    }

    for (let i = 0; i < currentWordFile.length; i++){
        const thisWord = currentWordFile[i]
        
        if (!pickedWord) continue

        if (thisWord.czWord === pickedWord.czWord){
            currentWordFile[i].timesDisplayed += 1
        }
    }

    displayWord.innerText = pickedWord.czWord
   
    deUserInput.value = ""
    deUserInput.style.color = "white"
    perfektUserInput.value = ""
    perfektUserInput.style.color = "white"
    
    deHint = ""
    perfektHint = ""

    currentWord = pickedWord
    prevWord = pickedWord

    if (pickedWord.perfektPossibleAnswers && pickedWord.perfektPossibleAnswers[0]){
        perfektUserInput.style.display = "block"
        deUserInput.style.translate = "none"
    }
    else{
        perfektUserInput.style.display = "none"
        deUserInput.style.translate = "0 50%"
    }
}

function updateWordsData(correct){
    for (let i = 0; i < currentWordFile.length; i++){
        const thisWord = currentWordFile[i]

        if (thisWord.czWord === currentWord.czWord){
            if (correct && deHint === "" && perfektHint === ""){
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

function checkInput(deInputString, perfektInputString){
    let deCorrect = checkInputSingle(deInputString, false)
    let perfektCorrect = true

    if (currentWord.perfektPossibleAnswers && currentWord.perfektPossibleAnswers[0]) {
        perfektCorrect = checkInputSingle(perfektInputString, true)
    }

    return deCorrect && perfektCorrect
}

function checkInputSingle(inputString, isPerfekt){
    let possibleAnswers = []
    let userAnswers = []

    possibleAnswers = currentWord.dePossibleAnswers

    if (isPerfekt){
        possibleAnswers = currentWord.perfektPossibleAnswers
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

function submitAnswer(){
    if (submitState === "submit"){
        const deUserText = deUserInput.value
        const perfektUserText = perfektUserInput.value
        const correct = checkInput(deUserText, perfektUserText)

        updateWordsData(correct)
        updateStats()

        if (correct){
            if (skipCorrectAnswer){
                displayNextWord()

                deUserInput.focus()

                return
            }

            deUserInput.style.color = correctColor
            perfektUserInput.style.color = correctColor
        }
        else{
            if (!checkInputSingle(deUserInput.value, false)){
                let deCorrectAnswer = currentWord.dePossibleAnswers[0]

                deUserInput.value += " --> " + deCorrectAnswer
            }

            if (currentWord.perfektPossibleAnswers && currentWord.perfektPossibleAnswers[0]){
                if (!checkInputSingle(perfektUserInput.value, true)) {
                    let perfektCorrectAnswer = currentWord.perfektPossibleAnswers[0]

                    perfektUserInput.value += " --> " + perfektCorrectAnswer
                }
            }

            deUserInput.style.color = incorrectColor
            perfektUserInput.style.color = incorrectColor

            incorrectWords.push(currentWord)
        }

        submitState = "submitted"
        deUserInput.readOnly = true
        perfektUserInput.readOnly = true
        submitButton.style.setProperty("--before-content", '"➔"')
    }
    else{
        submitState = "submit"
        deUserInput.readOnly = false
        deUserInput.style.color = "white"
        perfektUserInput.readOnly = false
        perfektUserInput.style.color = "white"
        submitButton.style.setProperty("--before-content", '"✓"')

        displayNextWord()
    }
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

    let lang1 = "cz"
    let lang2 = "de"

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
        czSpan.innerText = `${lang1}: `
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
        deSpan.innerText = ` ${lang2}: `
        let deWordSpan = document.createElement("span")
        wordElement.append(deWordSpan)
        deWordSpan.style.color = "white"
        deWordSpan.innerText = thisWord.deWord

        if (thisWord.perfektPossibleAnswers && thisWord.perfektPossibleAnswers[0]) {
            let zima7 = document.createElement("br")
            wordElement.append(zima7)

            let perfektSpan = document.createElement("span")
            wordElement.append(perfektSpan)
            perfektSpan.style.color = "purple"
            perfektSpan.style.fontWeight = "bold"
            perfektSpan.innerText = " perfekt: "
            let perfektWordSpan = document.createElement("span")
            wordElement.append(perfektWordSpan)
            perfektWordSpan.style.color = "white"
            perfektWordSpan.innerText = thisWord.perfektPossibleAnswers[0]
        }

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

    if (allWordsSeenMark.style.visibility === "visible"){
        allWordsSeenMark.style.visibility = "hidden"
        allWordsSeenMarkVisible = true
    }
    else {
        allWordsSeenMarkVisible = false
    }

    wordsListPreview.style.visibility = "visible"

    displayWordsListUserStats()
    addListWordsToPreview()
}

function closeWordListPreview(){
    mainSection.style.visibility = "visible"
    helperSection.style.visibility = "visible"
    statsSection.style.visibility = "visible"
    selectionSection.style.visibility = "visible"

    if (allWordsSeenMarkVisible){
        allWordsSeenMark.style.visibility = "visible"
    }

    wordsListPreview.style.visibility = "hidden"
}

function insertLetterAtCursor(letter){
    if (document.selection) {
        focusInput.focus()
        let selected = document.selection.createRange()
        selected.text = letter
        selected.moveStart("character", letter.length)
        selected.select()
    }
    else if (focusInput.selectionStart || focusInput.selectionStart == '0') {
        let startPos = focusInput.selectionStart
        let endPos = focusInput.selectionEnd
        focusInput.value = focusInput.value.substring(0, startPos)
            + letter
            + focusInput.value.substring(endPos, focusInput.value.length)
        focusInput.selectionStart = startPos + letter.length
        focusInput.selectionEnd = startPos + letter.length
    } else {
        focusInput.value += letter
    }
}

function onKeyDown(event){
    if (event.key === "Enter"){
        if (deUserInput.readOnly){
            submitAnswer()

            deUserInput.focus()
        }
        else{
            if (deUserInput === document.activeElement) {
                if (currentWord.perfektPossibleAnswers && currentWord.perfektPossibleAnswers[0]){
                    perfektUserInput.focus()
                }
                else {
                    submitAnswer()
                }
            }
            else if (perfektUserInput === document.activeElement) {
                submitAnswer()
            }
        }
    }
    else if (event.key === "Alt"){
        altHolded = true
    }

    if (altHolded && focusInput){
        if (event.key === "a"){
            insertLetterAtCursor("ä")
            focusInput.focus()
        }
        else if (event.key === "A"){
            insertLetterAtCursor("Ä")
            focusInput.focus()
        }
        else if (event.key === "o"){
            insertLetterAtCursor("ö")
            focusInput.focus()
        }
        else if (event.key === "O"){
            insertLetterAtCursor("Ö")
            focusInput.focus()
        }
        else if (event.key === "u"){
            insertLetterAtCursor("ü")
            focusInput.focus()
        }
        else if (event.key === "U"){
            insertLetterAtCursor("Ü")
            focusInput.focus()
        }
        else if (event.key === "s" || event.key === "S"){
            insertLetterAtCursor("ß")
            focusInput.focus()
        }
    }
}

function onKeyUp(event){
    if (event.key === "Alt"){
        altHolded = false
    }
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

function saveDataHolderData(){
    dataHolder.saveData()

    let sessionPageData = {
        wordsList: currentWordFile,
        wordCategory: currentFileName,
        wordStreak: streak,
        wordDisplayed: currentWord,
        submitState: submitState,
        userText: deUserInput.value,
        userTextColor: deUserInput.style.color,
        userText2: perfektUserInput.value,
        userText2Color: perfektUserInput.style.color,
        wordCorrect: correctData,
        wordIncorrect: incorrect,
        prevWord: prevWord,
        availableWords: availableWords,
        incorrectWords: incorrectWords,
        deHint: deHint,
        perfektHint: perfektHint
    }

    window.sessionStorage.setItem("page_data_verbs", JSON.stringify(sessionPageData))
}

function giveHint(){
    if (submitState === "submitted") return

    focusInput.style.color = hintColor

    let isPerfekt = false

    if (focusInput === perfektUserInput) isPerfekt = true

    let correctAnswer = currentWord.dePossibleAnswers[0]

    if (isPerfekt) correctAnswer = currentWord.perfektPossibleAnswers[0]

    if (!isPerfekt){
        if (deHint.length === 0) {
            const before = correctAnswer.slice(0, 4)

            if (before === "hat " || before === "ist ") {
                deHint = before
            }
            else {
                deHint = correctAnswer.slice(0, 1)
            }
        }
        else {
            deHint = correctAnswer.slice(0, deHint.length + 1)
        }

        focusInput.value = deHint
    }
    else{
        if (perfektHint.length === 0) {
            const before = correctAnswer.slice(0, 4)

            if (before === "hat " || before === "ist ") {
                perfektHint = before
            }
            else {
                perfektHint = correctAnswer.slice(0, 1)
            }
        }
        else {
            perfektHint = correctAnswer.slice(0, perfektHint.length + 1)
        }

        focusInput.value = perfektHint
    }

    focusInput.focus()
}

function main(){
    dataHolder.loadData()

    const navLogo = document.querySelector("#nav-logo")
    navLogo.addEventListener("click", () => {
        window.location.href = "../index.html"
    })
    submitButton.addEventListener("click", submitAnswer)
    ttsButton.addEventListener("click", changeTTS)
    repeatWord.addEventListener("click", () => {
        sayWord(currentWord)
    })
    repeatWord.style.visibility = "hidden"
    wordsListButton.addEventListener("click", openWordListPreview)
    wordsListButton2.addEventListener("click", closeWordListPreview)
    hintButton.addEventListener("click", giveHint)

    const verbFiles = getVerbFileNames()
    const primaryVerbFile = verbFiles[0]

    updateHTMLSelectVerbFile(wordsRange)

    currentFileName = primaryVerbFile[0]
    wordsRange.addEventListener("change", onWordsRangeChange)

    loadVerbFile("..", verbFiles[0][0], onWordFileLoad)

    allWordsSeenMark.style.visibility = "hidden"

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

        focusInput.focus()
    })
    oUmlautButton.addEventListener("click", () => {
        let letter = "ö"
        if (upperCase) letter = "Ö"

        insertLetterAtCursor(letter)

        focusInput.focus()
    })
    uUmlautButton.addEventListener("click", () => {
        let letter = "ü"
        if (upperCase) letter = "Ü"

        insertLetterAtCursor(letter)

        focusInput.focus()
    })
    sharpSButton.addEventListener("click", () => {
        insertLetterAtCursor("ß")

        focusInput.focus()
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

        dataHolder.updateData("upper-case", upperCase)
    })
    skipCorrectAnswerButton.addEventListener("click", () => {
        skipCorrectAnswer = !skipCorrectAnswer

        if (skipCorrectAnswer){
            skipCorrectAnswerButton.style.setProperty("--before-skip", '"||"')
        }
        else{
            skipCorrectAnswerButton.style.setProperty("--before-skip", '"≪"')
        }

        dataHolder.updateData("skip-correct-answer", skipCorrectAnswer)
    })

    let upperCaseData = dataHolder.getDataEntries("upper-case")
    if (upperCaseData.length > 0){
        if (upperCaseData[0][1]){
            upperCase = true
            aUmlautButton.style.setProperty("--before-a", '"Ä"')
            oUmlautButton.style.setProperty("--before-o", '"Ö"')
            uUmlautButton.style.setProperty("--before-u", '"Ü"')
        }
    }
    else {
        dataHolder.addData("upper-case", false)
    }

    let skipCorrectAnswerData = dataHolder.getDataEntries("skip-correct-answer")
    if (skipCorrectAnswerData.length > 0){
        if (skipCorrectAnswerData[0][1]){
            skipCorrectAnswer = true
            skipCorrectAnswerButton.style.setProperty("--before-skip", '"||"')
        }
    }
    else {
        dataHolder.addData("skip-correct-answer", false)
    }

    speachText.volume = 1
    wordsListPreview.style.visibility = "hidden"

    let ttsData = dataHolder.getDataEntries("tts")
    if (ttsData.length > 0){
        if (ttsData[0][1]){
            changeTTS()
        }
    }
    else {
        dataHolder.addData("tts", false)
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("keyup", onKeyUp)
    focusInput = deUserInput
    deUserInput.addEventListener("focus", () => {
        focusInput = deUserInput
    })
    perfektUserInput.addEventListener("focus", () => {
        focusInput = perfektUserInput
    })

    window.addEventListener("beforeunload", saveDataHolderData)
    document.addEventListener("visibilitychange", saveDataHolderData)

    setTimeout(() => {
        saveDataHolderData()
    }, 300000)
}

main()