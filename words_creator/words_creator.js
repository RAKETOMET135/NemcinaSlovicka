import { word } from "../structure/word.js"
import { loadData, saveData } from "../loader/data_saver.js"

const wordContructor = document.querySelector("#word-constructor")
const fileOpener = document.querySelector("#file-opener")
const wordPreview = document.querySelector("#word-preview")
const fileOptions = document.querySelector("#file-options")

const step1 = document.querySelector("#step-1")
const step2new = document.querySelector("#step-2-new")
const step2chose = document.querySelector("#step-2-chose")
const step2open = document.querySelector("#step-2-open")
const step2browser = document.querySelector("#step-2-browser")

const newFileButton = document.querySelector("#new-file")
const openFileButton = document.querySelector("#open-file")
const newFileCreateButton = document.querySelector("#create-new-file")
const jsonImportButton = document.querySelector("#json-import")
const browserImportButton = document.querySelector("#browser-import")
const browserDataLoadButton = document.querySelector("#load-data")
const importFileButton = document.querySelector("#import-file")

const browserDataSelect = document.querySelector("#browser-data")
const jsonFileInput = document.querySelector("#json-file-input")
const wordsContainer = document.querySelector("#file-words-preview")

const removeFileButton = document.querySelector("#remove-file")
const closeFileButton = document.querySelector("#close-file")
const exportFileButton = document.querySelector("#export-file")
const renameFileButton = document.querySelector("#rename-file")

const homeReturnButton = document.querySelector("#home-return")

const step2newMainHeader = document.querySelector("#step-2-new-main-header")
const step2input = document.querySelector("#step-2-new-file-name-input")


let data

let currentFileName = ""
let currentFileContent = []
let currentFileObject = NaN

let darkMode
let renameMode = false

function createNewWordFile(name){
    data.totalFiles += 1

    const fileObject = {
        fileName: name,
        content: currentFileContent
    }

    data.files.push(fileObject)

    currentFileName = name
    currentFileObject = fileObject

    updateWordPreview()
}

function updateWordFileData(){
    if (!data) return

    if (currentFileName === ""){
        createNewWordFile()
    }
    else {
        currentFileObject.content = currentFileContent
    }
}

function createNewWord(){
    const czInput = document.querySelector("#cz-input")
    const deInput = document.querySelector("#de-input")
    const priorityInput = document.querySelector("#priority-input")

    let czText = czInput.value
    let deText = deInput.value
    let priorityText = priorityInput.value

    let priority = parseInt(priorityText) || 1
    if (priority < 1) priority = 1

    const newWord = new word(czText, deText, NaN, NaN, priority)
    
    currentFileContent.push(newWord)

    czInput.value = ""
    deInput.value = ""
    priorityInput.value = ""

    updateWordFileData()
    updateWordPreview()
}

function saveFileData(){
    const filesData = JSON.stringify(data)

    saveData(filesData, "wordFiles")
}

function loadFileData(){
    const filesData = loadData("wordFiles")

    if (!filesData){
        data = {
            totalFiles: 0,
            files: []
        }
    }
    else {
        data = JSON.parse(filesData)
    }
}

function updateWordPreview(){
    wordPreview.style.visibility = "visible"
    fileOptions.style.visibility = "visible"
    homeReturnButton.style.visibility = "hidden"

    const wordPreviewHeader = document.querySelector("#word-preview-header")
    wordPreviewHeader.innerText = "Vytvořená slovíčka (" + currentFileName + ")"

    while (wordsContainer.children.length > 0){
        wordsContainer.firstChild.remove()
    }

    for (let i = 0; i < currentFileContent.length; i++){
        const thisWord = currentFileContent[i]

        let wordElement = document.createElement("div")
        wordsContainer.append(wordElement)

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

        let prSpan = document.createElement("span")
        wordElement.append(prSpan)
        prSpan.style.color = "purple"
        prSpan.style.fontWeight = "bold"
        prSpan.innerText = "Priority: "
        let prDataSpan = document.createElement("span")
        wordElement.append(prDataSpan)
        prDataSpan.style.color = "white"
        prDataSpan.innerText = thisWord.priority

        wordElement.addEventListener("click", () => {
            removeWordFromFileContent(thisWord)
        })
    }
}

function removeWordFromFileContent(wordData){
    let wordDataIndex = -1

    for (let i = 0; i < currentFileContent.length; i++){
        const curWordData = currentFileContent[i]

        if (curWordData.czWord !== wordData.czWord) continue
        if (curWordData.deWord !== wordData.deWord) continue
        if (curWordData.priority !== wordData.priority) continue

        wordDataIndex = i

        break
    }

    if (wordDataIndex < 0) return

    currentFileContent.splice(wordDataIndex, 1)

    currentFileObject.content = currentFileContent

    updateWordPreview()
}

function insertLetterAtCursor(letter){
    const czInput = document.querySelector("#cz-input")
    const deInput = document.querySelector("#de-input")

    if (document.activeElement !== czInput && document.activeElement !== deInput) return

    if (document.selection) {
        document.activeElement.focus()
        let selected = document.selection.createRange()
        selected.text = letter
        selected.moveStart("character", letter.length)
        selected.select()
    }
    else if (document.activeElement.selectionStart || document.activeElement.selectionStart == '0') {
        let startPos = document.activeElement.selectionStart
        let endPos = document.activeElement.selectionEnd
        document.activeElement.value = document.activeElement.value.substring(0, startPos)
            + letter
            + document.activeElement.value.substring(endPos, document.activeElement.value.length)
        document.activeElement.selectionStart = startPos + letter.length
        document.activeElement.selectionEnd = startPos + letter.length
    } else {
        document.activeElement.value += letter
    }
}

let altHolded = false
function onKeyDown(event){
    if (event.key === "Alt"){
        altHolded = true
    }

    if (altHolded){
        if (event.key === "a"){
            insertLetterAtCursor("ä")
        }
        else if (event.key === "A"){
            insertLetterAtCursor("Ä")
        }
        else if (event.key === "o"){
            insertLetterAtCursor("ö")
        }
        else if (event.key === "O"){
            insertLetterAtCursor("Ö")
        }
        else if (event.key === "u"){
            insertLetterAtCursor("ü")
        }
        else if (event.key === "U"){
            insertLetterAtCursor("Ü")
        }
        else if (event.key === "s" || event.key === "S"){
            insertLetterAtCursor("ß")
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
    const wordPreviewHeader = document.querySelector("#word-preview-header")

    if (darkMode && darkMode !== "false"){
        document.body.style.backgroundColor = "rgb(22, 22, 22)"
        nav.style.backgroundColor = "rgb(22, 22, 22)"
        navLogoText.style.color = "white"
        wordPreviewHeader.style.color = "white"
    }
    else{
        document.body.style.backgroundColor = "#FDFBFD"
        nav.style.backgroundColor = "#FDFBFD"
        navLogoText.style.color = "#021F31"
        wordPreviewHeader.style.color = "#021F31"
    }
}

function renameFile(newFileName){
    if (currentFileName === "") return
    if (!data) return
    if (data.files === undefined) return

    let fileIndex = -1

    for (let i = 0; i < data.files.length; i++){
        const fileData = data.files[i]

        if (fileData !== currentFileObject) continue

        fileIndex = i
    }

    if (fileIndex < 0) return

    data.files[fileIndex].fileName = newFileName
    currentFileName = newFileName

    const wordPreviewHeader = document.querySelector("#word-preview-header")
    wordPreviewHeader.innerText = "Vytvořená slovíčka (" + currentFileName + ")"
}

function removeFile(){
    if (currentFileName === "") return
    if (!data) return
    if (data.files === undefined) return

    let fileIndex = -1

    for (let i = 0; i < data.files.length; i++){
        const fileData = data.files[i]

        if (fileData !== currentFileObject) continue

        fileIndex = i
    }

    if (fileIndex < 0) return

    data.files.splice(fileIndex, 1)
    data.totalFiles--

    currentFileName = ""
    currentFileContent = []
    currentFileObject = NaN

    wordContructor.style.visibility = "hidden"
    wordPreview.style.visibility = "hidden"
    fileOptions.style.visibility = "hidden"
    fileOpener.style.visibility = "visible"
    step1.style.visibility = "visible"
}

function main(){
    const navLogo = document.querySelector("#nav-logo")
    navLogo.addEventListener("click", () => {
        window.location.href = "../index.html"
    })

    const createButton = document.querySelector("#create-button")
    createButton.addEventListener("click", createNewWord)

    wordContructor.style.visibility = "hidden"
    step2new.style.visibility = "hidden"
    step2open.style.visibility = "hidden"
    step2chose.style.visibility = "hidden"
    step2browser.style.visibility = "hidden"
    wordPreview.style.visibility = "hidden"
    fileOptions.style.visibility = "hidden"
    homeReturnButton.style.visibility = "hidden"

    newFileButton.addEventListener("click", () => {
        step1.style.visibility = "hidden"
        step2new.style.visibility = "visible"
        homeReturnButton.style.visibility = "visible"
    })
    newFileCreateButton.addEventListener("click", () => {
        if (!renameMode){
            step2new.style.visibility = "hidden"
            wordContructor.style.visibility = "visible"
            fileOpener.style.visibility = "hidden"

            const userInput = step2input.value

            createNewWordFile(userInput)

            step2input.value = ""
        }
        else {  
            renameMode = false

            step2newMainHeader.innerText = "Vytvořit soubor"
            newFileCreateButton.style.setProperty("--button-text", '"Vytvořit"')

            step2new.style.visibility = "hidden"
            fileOpener.style.visibility = "hidden"
            wordContructor.style.visibility = "visible"
            fileOptions.style.visibility = "visible"
            wordPreview.style.visibility = "visible"

            const userInput = step2input.value
            step2input.placeholder = ""

            renameFile(userInput)

            step2input.value = ""

            homeReturnButton.style.visibility = "hidden"
        }
    })
    openFileButton.addEventListener("click", () => {
        step1.style.visibility = "hidden"
        step2chose.style.visibility = "visible"
        homeReturnButton.style.visibility = "visible"
    })
    jsonImportButton.addEventListener("click", () => {
        step2chose.style.visibility = "hidden"
        step2open.style.visibility = "visible"
    })
    browserImportButton.addEventListener("click", () => {
        step2chose.style.visibility = "hidden"
        step2browser.style.visibility = "visible"

        while (browserDataSelect.children.length > 0){
            browserDataSelect.firstChild.remove()
        }

        for (let i = 0; i < data.files.length; i++){
            const fileData = data.files[i]

            if (!fileData.fileName) continue

            const option = document.createElement("option")
            option.value = i
            option.innerText = fileData.fileName

            if (i === data.files.length -1){
                option.selected = true
            }

            browserDataSelect.append(option)
        }

        const step2browserHeader = document.querySelector("#step-2-browser-header")

        if (browserDataSelect.children.length <= 0){
            browserDataSelect.style.display = "none"
            step2browserHeader.innerText = "Nemáte žádná data"
        }
        else {
            browserDataSelect.style.display = "block"
            step2browserHeader.innerText = "Načíst data z prohlížeče"
        }
    })
    browserDataLoadButton.addEventListener("click", () => {
        if (browserDataSelect.children.length <= 0) return

        const fileIndex = browserDataSelect.value
        const fileToLoad = data.files[fileIndex]
        
        currentFileName = fileToLoad.fileName
        currentFileObject = fileToLoad
        currentFileContent = fileToLoad.content
        
        step2browser.style.visibility = "hidden"
        fileOpener.style.visibility = "hidden"
        wordContructor.style.visibility = "visible"

        updateWordPreview()
    })

    let selectedJSONFile = null
    importFileButton.addEventListener("click", () => {
        if (!selectedJSONFile){
            alert("⚠️ Je potřeba vybrat .json soubor")
            return
        }

        const fileReader = new FileReader()
        fileReader.onload = function(event) {
            try {
                const jsonContent = JSON.parse(event.target.result)

                if (!jsonContent.words){
                    alert("⚠️ Nesprávná struktura souboru")
                    return
                }

                let importedContent = []
                let skippedWords = 0

                for (let i = 0; i < jsonContent.words.length; i++){
                    const jsonWord = jsonContent.words[i]

                    if (jsonWord.cz === undefined || jsonWord.de === undefined){
                        skippedWords++

                        continue
                    }

                    const importedWord = new word(jsonWord.cz, jsonWord.de, jsonWord.alt, jsonWord.alt2, jsonWord.priority)

                    importedContent.push(importedWord)
                }

                data.totalFiles += 1
                const fileObject = {
                    fileName: selectedJSONFile.name.slice(0, selectedJSONFile.name.length -5),
                    content: importedContent
                }
            
                data.files.push(fileObject)
            
                currentFileName = fileObject.fileName
                currentFileObject = fileObject
                currentFileContent = fileObject.content

                if (skippedWords > 0){
                    alert(`⚠️ Soubor obsahuje slova, která nemají "cz" nebo "de" parametr (${skippedWords})`)
                }

                step2open.style.visibility = "hidden"
                fileOpener.style.visibility = "hidden"
                wordContructor.style.visibility = "visible"

                updateWordPreview()
            }
            catch (err) {
                alert("⚠️ Nesprávný .json soubor")
            }
        }
        fileReader.readAsText(selectedJSONFile)
    })
    jsonFileInput.addEventListener("change", (event) => {
        selectedJSONFile = event.target.files[0]
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

    loadFileData()

    window.addEventListener("beforeunload", saveFileData)
    document.addEventListener("visibilitychange", saveFileData)

    setInterval(() => {
        saveFileData()
    }, 300000)

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("keyup", onKeyUp)

    let removeState = 0
    removeFileButton.addEventListener("click", () => {
        if (removeState === 0){
            removeState = 1

            removeFileButton.style.setProperty("--remove-text-content", '"Potvrdit"')

            setTimeout(() => {
                removeState = 0

                removeFileButton.style.setProperty("--remove-text-content", '"Odstranit soubor"')
            }, 3000)
        }
        else {
            removeState = 0

            removeFileButton.style.setProperty("--remove-text-content", '"Odstranit soubor"')

            removeFile()
        }
    })
    
    closeFileButton.addEventListener("click", () => {
        currentFileName = ""
        currentFileContent = []
        currentFileObject = NaN

        wordContructor.style.visibility = "hidden"
        wordPreview.style.visibility = "hidden"
        fileOptions.style.visibility = "hidden"
        fileOpener.style.visibility = "visible"
        step1.style.visibility = "visible"
    })

    exportFileButton.addEventListener("click", () => {
        let object = {
            words: []
        }

        for (let i = 0; i < currentFileContent.length; i++){
            const part = currentFileContent[i]

            let partObject

            if (part.priority === 1){
                partObject = {
                    cz: part.czWord,
                    de: part.deWord
                }
            }
            else{
                partObject = {
                    cz: part.czWord,
                    de: part.deWord,
                    priority: part.priority
                }
            }

            object.words.push(partObject)
        }

        try {
            const blob = new Blob([JSON.stringify(object, null, 2)], { type: "application/json" })
            const downloadURL = URL.createObjectURL(blob)
    
            const a = document.createElement("a")
            a.href = downloadURL
            a.download = currentFileName + ".json"
            a.click()
            URL.revokeObjectURL(downloadURL)
        }
        catch (err){
            alert("⚠️ Něco se pokazilo")
        }
    })

    renameFileButton.addEventListener("click", () => {
        wordContructor.style.visibility = "hidden"
        wordPreview.style.visibility = "hidden"
        fileOptions.style.visibility = "hidden"
        fileOpener.style.visibility = "visible"
        step2new.style.visibility = "visible"

        step2newMainHeader.innerText = "Přejmenovat soubor"
        newFileCreateButton.style.setProperty("--button-text", '"Přejmenovat"')

        step2input.placeholder = currentFileName
        step2input.value = currentFileName

        renameMode = true

        homeReturnButton.style.visibility = "visible"
    })

    homeReturnButton.addEventListener("click", () => {
        if (renameMode){
            renameMode = false
            step2newMainHeader.innerText = "Vytvořit soubor"
            newFileCreateButton.style.setProperty("--button-text", '"Vytvořit"')

            step2new.style.visibility = "hidden"
            fileOpener.style.visibility = "hidden"
            wordContructor.style.visibility = "visible"
            fileOptions.style.visibility = "visible"
            wordPreview.style.visibility = "visible"

            step2input.placeholder = ""
            step2input.value = ""

            homeReturnButton.style.visibility = "hidden"
        }
        else {
            if (step2new.style.visibility === "visible"){
                step2new.style.visibility = "hidden"
                homeReturnButton.style.visibility = "hidden"
                step1.style.visibility = "visible"
            }
            else if (step2chose.style.visibility === "visible"){
                step2chose.style.visibility = "hidden"
                homeReturnButton.style.visibility = "hidden"
                step1.style.visibility = "visible"
            }
            else if (step2open.style.visibility === "visible"){
                step2open.style.visibility = "hidden"
                step2chose.style.visibility = "visible"
            }
            else if (step2browser.style.visibility == "visible"){
                step2browser.style.visibility = "hidden"
                step2chose.style.visibility = "visible"
            }
        }
    })
}

main()