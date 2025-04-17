import { loadData, saveData } from "./data_saver.js"

function checkDarkModeData(){
    let darkMode = loadData("darkMode")

    if (darkMode === null) return
    if (darkMode === "false" || darkMode === "true") return

    saveData("false", "darkMode")

    location.reload()
}

function checkWordFilesData(){
    let filesData = loadData("wordFiles")
    filesData = JSON.parse(filesData)

    filesData.totalFiles = filesData.files.length
}

function checkData(){
    checkDarkModeData()
    checkWordFilesData()
}

checkData()