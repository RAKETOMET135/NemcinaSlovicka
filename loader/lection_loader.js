import { word } from "../structure/word.js"
import { loadData, saveData, removeData } from "./data_saver.js"

const fileUploadKey = "&*(^%!^#&^file-upload~!#$%$-nemcina-slovicka-sammy"
let currentPageReloadFileIndex = -1

export function loadExternalFile(onLoadFunction){
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.style.display = "none"
    fileInput.accept = ".json"

    fileInput.onchange = () => {
        if (fileInput.files.length < 0){
            alert("⚠️ Je potřeba vybrat .json soubor")

            return
        }

        const selectedFile = fileInput.files[0]
        const fileReader = new FileReader()

        fileReader.onload = (event) => {
            try {
                const jsonContent = JSON.parse(event.target.result)

                if (!jsonContent.words) {
                    alert("⚠️ Nesprávná struktura souboru")
                    return
                }

                let importedContent = []
                let skippedWords = 0

                for (let i = 0; i < jsonContent.words.length; i++) {
                    const jsonWord = jsonContent.words[i]

                    if (jsonWord.cz === undefined || jsonWord.de === undefined) {
                        skippedWords++

                        continue
                    }

                    const importedWord = new word(jsonWord.cz, jsonWord.de, jsonWord.alt, jsonWord.alt2, jsonWord.priority)

                    importedContent.push(importedWord)
                }

                if (skippedWords > 0) {
                    alert(`⚠️ Soubor obsahuje slova, která nemají "cz" nebo "de" parametr (${skippedWords})`)
                }

                let userFileData = loadData("wordFiles")
                userFileData = JSON.parse(userFileData)

                userFileData.totalFiles += 1
                const fileObject = {
                    fileName: selectedFile.name.slice(0, selectedFile.name.length -5),
                    content: importedContent
                }
                userFileData.files.push(fileObject)

                saveData(JSON.stringify(userFileData), "wordFiles")

                saveData(userFileData.totalFiles - 1, "select-loaded-file")

                //onLoadFunction(importedContent)
            }
            catch (err) {
                alert("⚠️ Nesprávný .json soubor")
            }

            location.reload()
        }

        fileReader.readAsText(selectedFile)
    }

    document.body.append(fileInput)
    fileInput.click()

    fileInput.addEventListener("change", () => {
        fileInput.remove()
    })
}

export function loadLection(webRootPath, fileName, onLoadFunction){
    if (fileName === fileUploadKey){
        loadExternalFile(onLoadFunction)

        return
    }

    if (!fileName.endsWith(".json")){
        let filesData = loadData("wordFiles")
        filesData = JSON.parse(filesData)

        fileName = parseInt(fileName)

        if (!filesData) return
        if (filesData.files === undefined) return

        for (let i = 0; i < filesData.files.length; i++){
            const fileData = filesData.files[i]

            if (i !== fileName) continue

            if (fileData.content === undefined) return

            let wordList = []

            for (let j = 0; j < fileData.content.length; j++){
                const fileWord = fileData.content[j]

                if (fileWord.czWord === undefined || fileWord.deWord === undefined || fileWord.czWord === "" || fileWord.deWord === "") continue

                wordList.push(fileWord)
            }

            if (wordList.length <= 0) return

            let lang1 = "CZ"
            let lang2 = "DE"

            if (fileData.lang1){
                lang1 = fileData.lang1
            }
            if (fileData.lang2){
                lang2 = fileData.lang2
            }

            onLoadFunction(wordList, [lang1, lang2])

            break
        }

        return
    }

    const fullPath = `${webRootPath}/lections/${fileName}`

    let http = new XMLHttpRequest()
    http.open("get", fullPath, true)
    http.send()

    http.onload = function() {
        if (this.readyState === 4 && this.status === 200){
            const data = JSON.parse(this.responseText)

            let wordList = []

            for(let fileWord of data.words){
                const w = new word(fileWord.cz, fileWord.de, fileWord.alt, fileWord.alt2, fileWord.priority)

                wordList.push(w)

                if (fileWord.word_order){
                    w.wordOrder = fileWord.word_order
                }
            }

            let lang1 = "CZ"
            let lang2 = "DE"

            if (data.lang1){
                lang1 = data.lang1
            }
            if (data.lang2){
                lang2 = data.lang2
            }

            onLoadFunction(wordList, [lang1, lang2])
        }
    }
}

export function loadVerbFile(webRootPath, fileName, onLoadFunction){
    const fullPath = `${webRootPath}/verb_files/${fileName}`

    let http = new XMLHttpRequest()
    http.open("get", fullPath, true)
    http.send()

    http.onload = function() {
        if (this.readyState === 4 && this.status === 200){
            const data = JSON.parse(this.responseText)

            let wordList = []

            for(let fileWord of data.words){
                const w = new word(fileWord.cz, fileWord.de, fileWord.alt, fileWord.alt2, fileWord.priority)
                w.perfekt = fileWord.perfekt
                w.updatePerfekt()

                wordList.push(w)
            }

            let lang1 = "CZ"
            let lang2 = "DE"

            if (data.lang1){
                lang1 = data.lang1
            }
            if (data.lang2){
                lang2 = data.lang2
            }

            onLoadFunction(wordList, [lang1, lang2])
        }
    }
}

export function getVerbFileNames(){
    const verbFileNameList = [
        ["slovesa_lekce15.json", "Lekce 15 - výběr 1"],
        ["slovesa1.json", "Slovesa 1"]
    ]

    let primaryVerbFile = verbFileNameList[0]

    return [primaryVerbFile, verbFileNameList]
}

export function getLectionFileNames(){
    const lectionNameList = [
        ["lekce15vyber1.json", "Lekce 15 - výběr 1"],
        ["spojky.json", "Spojky"],
        ["lekce14gesundheit.json", "Lekce 14 - Gesundheit"],
        ["lekce14vyber.json", "Lekce 14 - výběr 1"],
        ["lekce13_str39-42.json", "Lekce 13 - str 39-42"],
        ["lekce13_str36-38.json", "Lekce 13 - str 36-38"],
        ["lekce12_str27-29.json", "Lekce 12 - str 27-29"],
        ["lekce12_str22-26.json", "Lekce 12 - str 22-26"],
        ["lekce11vyber2.json", "Lekce 11 - výběr 2"],
        ["lekce11vyber.json", "Lekce 11 - výběr 1"],
        ["lekce10vyber3.json", "Lekce 10 - výběr 3"],
        ["lekce10vyber2.json", "Lekce 10 - výběr 2"],
        ["lekce10vyber.json", "Lekce 10 - výběr 1"],
        ["lekce10.json", "Lekce 10"],
        ["lekce9vyber2.json", "Lekce 9 - výběr 2"],
        ["lekce9vyber.json", "Lekce 9 - výběr 1"],
        ["lekce9.json", "Lekce 9"],
        ["lekce8vyber2.json", "Lekce 8 - výběr 2"],
        ["lekce8.json", "Lekce 8"],
        ["lekce8_str107-108.json", "Lekce 8 - str 107-108"],
        ["lekce8_str102-106.json", "Lekce 8 - str 102-106"],
        ["lekce7vyber.json", "Lekce 7 - výběr 1"],
        ["lekce7.json", "Lekce 7"]
    ]

    let primaryList = lectionNameList[0]

    if (currentPageReloadFileIndex >= 0){
        let customeFilesData = loadData("wordFiles")
        customeFilesData = JSON.parse(customeFilesData)

        if (customeFilesData && customeFilesData.files !== undefined) {
            for (let i = 0; i < customeFilesData.files.length; i++) {
                const customFile = customeFilesData.files[i]
    
                if (customFile.content === undefined || customFile.fileName === undefined) continue
                if (currentPageReloadFileIndex !== i) continue

                primaryList = [i.toString(), customFile.name]
            }
        }
    }

    return [primaryList, lectionNameList]
}

export function updateHTMLSelect(htmlSelect){
    const lectionsData = getLectionFileNames()

    while (htmlSelect.children.length > 0){
        htmlSelect.firstChild.remove()
    }

    for (let i = 0; i < lectionsData[1].length; i++){
        const lectionName = lectionsData[1][i]

        const option = document.createElement("option")
        option.value = lectionName[0]
        option.innerText = lectionName[1]

        if (lectionName[0] === lectionsData[0][0] && currentPageReloadFileIndex < 0){
            option.selected = true
        }

        htmlSelect.append(option)
    }

    let customeFilesData = loadData("wordFiles")
    customeFilesData = JSON.parse(customeFilesData)
    if (customeFilesData && customeFilesData.files !== undefined) {
        for (let i = 0; i < customeFilesData.files.length; i++) {
            const customFile = customeFilesData.files[i]

            if (customFile.content === undefined || customFile.fileName === undefined) continue

            const option = document.createElement("option")
            option.value = i
            option.innerText = "Vlastní: " + customFile.fileName

            if (currentPageReloadFileIndex === i){
                option.selected = true
            }

            htmlSelect.append(option)
        }
    }

    const fileUploadOption = document.createElement("option")
    fileUploadOption.value = fileUploadKey
    fileUploadOption.innerText = "Nahrát .json soubor"

    htmlSelect.append(fileUploadOption)
}

export function updateHTMLSelectVerbFile(htmlSelect){
    const verbFilesData = getVerbFileNames()

    while (htmlSelect.children.length > 0){
        htmlSelect.firstChild.remove()
    }

    for (let i = 0; i < verbFilesData[1].length; i++){
        const verbFileName = verbFilesData[1][i]

        const option = document.createElement("option")
        option.value = verbFileName[0]
        option.innerText = verbFileName[1]

        if (verbFileName[0] === verbFilesData[0][0] && currentPageReloadFileIndex < 0){
            option.selected = true
        }

        htmlSelect.append(option)
    }
}

function onLoad(){
    const reloadData = loadData("select-loaded-file")

    if (reloadData !== null){
        const reloadFileIndex = reloadData

        removeData("select-loaded-file")

        currentPageReloadFileIndex = parseInt(reloadFileIndex)
    }
}

onLoad()