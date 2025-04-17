import { loadLection, getLectionFileNames, updateHTMLSelect } from "../loader/lection_loader.js"
import { Random } from "../structure/random.js"
import { loadData, saveData } from "../loader/data_saver.js"

let currentPlayer = "player"

class Computer{
    constructor(){
        this.memory = []
        this.score = 0
        this.moveDelay = 0
        this.wordList = NaN
        this.allCards = []
        this.played = false
    }

    witnessRound(flippedCards){
        flippedCards.forEach(flippedCard => {
            let contains = false

            for (let i = 0; i < this.memory.length; i++){
                const mem = this.memory[i]
    
                if (mem[0] !== flippedCard[0]) continue
    
                contains = true
            }

            if (!contains){
                this.memory.push(flippedCard)
            }
        })
    }

    isMemConnect(mem0, mem1){
        const word1 = mem0[1].textContent
        const word2 = mem1[1].textContent

        for (let i = 0; i < this.wordList.length; i++){
            const w = this.wordList[i]
    
            if (w.czWord === word1 && w.deWord === word2
                ||
                w.czWord === word2 && w.deWord === word1
            ) {
                if (!correctCardsContain(mem0[0]) && !correctCardsContain(mem1[0])){
                    return true
                }
            }
        }

        return false
    }

    playRound(){
        this.played = false

        let playCards = []
        let picked = false

        for (let i = 0; i < this.memory.length; i++){
            const mem0 = this.memory[i]

            if (picked) break

            for (let j = 0; j < this.memory.length; j++){
                const mem1 = this.memory[j]       

                if (mem0[0] === mem1[0]) continue
                if (!this.isMemConnect(mem0, mem1)) continue

                playCards = [mem0, mem1]
                picked = true

                break
            }
        }

        if (picked){
            for (let i = 0; i < playCards.length; i++){
                const playCard = playCards[i]

                setTimeout(() => {
                    if (currentPlayer === "computer"){
                        flipCard(playCard[0], playCard[1], this.wordList, playCard[2])
                    }
                }, 1000 * (i + 1))
            }
        }
        else{
            let firstCard = NaN
            let bigBrain = false

            for (let i = 0; i < 2; i++){
                setTimeout(() => {
                    let cardPicked = false

                    if (bigBrain) return

                    let randomIndex = Random.getNumber(0, this.allCards.length - 1)
                    while (!cardPicked){
                        const card = this.allCards[randomIndex]
    
                        if (correctCardsContain(card[0]) || firstCard[0] === card[0]) {
                            randomIndex = Random.getNumber(0, this.allCards.length - 1)

                            continue
                        }
                        
                        if (currentPlayer === "computer"){
                            flipCard(card[0], card[1], this.wordList, card[2])
                        }

                        firstCard = card

                        if (i === 0){
                            for (let j = 0; j < this.memory.length; j++){
                                const mem = this.memory[j]

                                if (mem[0] === card[0]) continue
                                if (!this.isMemConnect(mem, card)) continue

                                bigBrain = true

                                setTimeout(() => {
                                    if (currentPlayer === "computer"){
                                        flipCard(mem[0], mem[1], this.wordList, mem[2])
                                    }
                                }, 1000)

                                break
                            }
                        }
    
                        cardPicked = true
                        break
                    }
                }, 1000 * (i + 1))
            }
        }

        setTimeout(() => {
            if (!this.played){
                this.playRound()
            }
        }, 10000)
    }
}

const backgroundHelper = document.querySelector("#background-helper")

const gameTime = document.querySelector("#game-time")
const gameScore = document.querySelector("#player-score")
const currentPlayerText = document.querySelector("#current-player")
let score = 0
let seconds = 0
let minutes = 0
let cardsFlipped = []
let correctCards = []
let flipSpeed = 500
let flippedCardsCount = 0
let flipDebounce = false
let gameTimeInterval = -1
let computer = NaN
let localMulti = false
let multiScore = 0
let multiPlayer = 1
let darkMode = false

function onLectionLoad(wordList){
    startGame(wordList)
}

function setGameVisibility(visibility){
    const gameStartSection = document.querySelector("#game-start")
    const gameContentSection = document.querySelector("#game-content")
    const gameScoreSection = document.querySelector("#game-score")

    gameStartSection.style.visibility = visibility[0]
    gameContentSection.style.visibility = visibility[1]
    gameScoreSection.style.visibility = visibility[2]
}

function flippedCardsContain(card){
    for (let i = 0; i < cardsFlipped.length; i++){
        const flippedCard = cardsFlipped[i]

        if (flippedCard[0] !== card) continue

        return true
    }

    return false
}

function correctCardsContain(card){
    for (let i = 0; i < correctCards.length; i++){
        const flippedCard = correctCards[i]

        if (flippedCard[0] !== card) continue

        return true
    }

    return false
}

function unflipCards(isCorrectAnswer){
    for (let i = 0; i < cardsFlipped.length; i++){
        const flippedCard = cardsFlipped[i]

        flippedCard[0].style.animation = `rotate ${flipSpeed/1000}s 1 linear forwards`

        setTimeout(() => {
            flippedCard[1].style.visibility = "hidden"
            flippedCard[2].style.visibility = "visible"
            flippedCard[2].style.transform = "rotateY(180deg)"
        }, flipSpeed/2)

        setTimeout(() => {
            flippedCard[0].style.animation = "none"
            flippedCard[2].style.transform = "none"
        }, flipSpeed)

        setTimeout(() =>{
            if (computer && i === 0){
                computer.witnessRound(cardsFlipped)
            }

            cardsFlipped = []
            flippedCardsCount = 0

            if (computer && i === 0 && !isCorrectAnswer){
                if (currentPlayer === "player"){
                    currentPlayer = "computer"

                    currentPlayerText.innerText = "Na řadě: Počítač"
                    currentPlayerText.style.animation = "player-change 1s 1 linear"

                    setTimeout(() => {
                        computer.playRound()
                    }, 1000)
                }
                else{
                    computer.played = true

                    currentPlayer = "player"
                    
                    currentPlayerText.innerText = "Na řadě: Hráč"
                    currentPlayerText.style.animation = "player-change 1s 1 linear"
                }
            }
            else if (localMulti && i === 0 && !isCorrectAnswer){
                if (multiPlayer === 1){
                    multiPlayer = 2
                    currentPlayerText.innerText = "Na řadě: Hráč 2"
                    currentPlayerText.style.animation = "player-change 1s 1 linear"
                }
                else{
                    multiPlayer = 1
                    currentPlayerText.innerText = "Na řadě: Hráč 1"
                    currentPlayerText.style.animation = "player-change 1s 1 linear"
                }
            }

            if (isCorrectAnswer && computer && i === 0 && currentPlayer === "computer"){
                setTimeout(() => {
                    computer.playRound()
                }, 1000)
            }

            setTimeout(() => {
                currentPlayerText.style.animation = "none"
            }, 1000)
        }, flipSpeed + 100)
    }
}

function checkCards(wordList){
    let correct = false

    const word1 = cardsFlipped[0][1].innerText
    const word2 = cardsFlipped[1][1].innerText

    for (let i = 0; i < wordList.length; i++){
        const w = wordList[i]

        if (w.czWord === word1 && w.deWord === word2
            ||
            w.czWord === word2 && w.deWord === word1
        ) {
            if (darkMode && darkMode !== "false"){
                cardsFlipped[0][0].style.backgroundColor = "rgb(22, 22, 22)"
                cardsFlipped[1][0].style.backgroundColor = "rgb(22, 22, 22)"    
            }
            else{
                cardsFlipped[0][0].style.backgroundColor = "#FDFBFD"
                cardsFlipped[1][0].style.backgroundColor = "#FDFBFD"
            }
            cardsFlipped[0][0].style.cursor = "default"
            cardsFlipped[1][0].style.cursor = "default"
            cardsFlipped[0][2].style.display = "none"
            cardsFlipped[1][2].style.display = "none"

            correctCards.push(cardsFlipped[0])
            correctCards.push(cardsFlipped[1])

            if (currentPlayer === "player"){
                if (computer){
                    score++

                    gameScore.innerText = `Tvoje skóre: ${score}`
                }
                else if (!localMulti){
                    score++

                    gameScore.innerText = `Skóre: ${score}`
                }
                else {
                    if (multiPlayer === 1){
                        multiScore++
                    }
                    else{
                        score++
                    }

                    gameScore.innerText = `Hráč 2: ${score}`
                    gameTime.innerText = `Hráč 1: ${multiScore}`
                }
            }
            else if (currentPlayer === "computer"){
                computer.score++
                gameTime.innerText = `Počítač: ${computer.score}`
            }

            correct = true

            if (score >= wordList.length || computer && computer.score + score >= wordList.length || multiScore + score >= wordList.length){
                const finalGameTime = document.querySelector("#final-game-time")
                finalGameTime.innerText = gameTime.innerText
                const finalGameScore = document.querySelector("#final-game-score")
                finalGameScore.innerText = gameScore.innerText
                gameScore.innerText = "Skóre: 0"
                gameTime.innerText = "Čas: 0:00"
                currentPlayerText.style.visibility = "hidden"
                backgroundHelper.style.visibility = "hidden"
                correct = false

                if (gameTimeInterval >= 0){
                    clearInterval(gameTimeInterval)
                }

                setGameVisibility(["hidden", "hidden", "visible"])
            }

            break
        }
    }

    return correct
}

function flipCard(card, cardText, wordList, cardDesign){
    if (flipDebounce) return

    if (correctCardsContain(card)) return
    if (cardsFlipped.length >= 2) return
    if (flippedCardsContain(card)) return
    if (flippedCardsCount >= 2) return

    flipDebounce = true

    flippedCardsCount++
    cardsFlipped.push([card, cardText, cardDesign])

    card.style.animation = `rotate ${flipSpeed/1000}s 1 linear forwards`

    setTimeout(() => {
        cardText.style.visibility = "visible"
        cardText.style.transform = "rotateY(180deg)"
        cardDesign.style.visibility = "hidden"

        setTimeout(() => {
            card.style.animation = "none"
            cardText.style.transform = "none"
            flipDebounce = false
        }, flipSpeed/2)

        if (cardsFlipped.length >= 2){
            setTimeout(() => {
                let correct =  checkCards(wordList)
                unflipCards(correct)
            }, flipSpeed*1.5)
        }
    }, flipSpeed/2)
}

function createCards(wordList){
    const cardsHolder = document.querySelector("#cards")

    let newWordList = []
    wordList.forEach(w => {
        newWordList.push(w.czWord)
        newWordList.push(w.deWord)
    })

    let allCards = []

    for (let i = 0; i < wordList.length * 2; i++){
        const card = document.createElement("div")
        card.classList.add("card")

        const cardContent = document.createElement("p")
        card.append(cardContent)

        const index = Random.getNumber(0, newWordList.length -1)
        cardContent.innerText = newWordList[index]
        newWordList.splice(index, 1)

        const cardDesign = document.createElement("img")
        cardDesign.setAttribute("src", "../images/WebsiteIcon_larger.png")
        card.append(cardDesign)

        card.addEventListener("click", () => {
            if (currentPlayer === "player"){
                flipCard(card, cardContent, wordList, cardDesign)
            }
        })

        cardsHolder.append(card)

        allCards.push([card, cardContent, cardDesign])
    }

    return allCards
}

function startGame(wordList){
    setGameVisibility(["hidden", "visible", "hidden"])
    let allCards = createCards(wordList)
    backgroundHelper.style.visibility = "visible"

    const typeSelect = document.querySelector("#pexeso-type-select")
    if (typeSelect.value === "computer"){
        computer = new Computer()
        computer.wordList = wordList
        computer.allCards = allCards

        gameTime.innerText = "Počítač: 0"
        gameScore.innerText = "Tvoje skóre: 0"
        currentPlayerText.style.visibility = "visible"
        currentPlayerText.innerText = "Na řadě: Hráč"
    }
    else if (typeSelect.value === "solo"){
        gameTimeInterval = setInterval(() => {
            seconds++

            if (seconds >= 60){
                seconds = 0
                minutes++
            }

            let secondString = seconds.toString()
            if (secondString.length === 1) secondString = "0" + secondString

            gameTime.innerText = `Čas: ${minutes}:${secondString}`
        }, 1000)
    }
    else if (typeSelect.value === "local-multi"){
        gameTime.innerText = "Hráč 1: 0"
        gameScore.innerText = "Hráč 2: 0"
        currentPlayerText.style.visibility = "visible"
        currentPlayerText.innerText = "Na řadě: Hráč 1"
        localMulti = true
    }
}

function changeMode(){
    const nav = document.querySelector("nav")
    const navLogoText = document.querySelector("#nav-logo-text")
    const gameStartHeader = document.querySelector("#game-start-header")
    const pexesoSelectHeader = document.querySelector("#pexeso-select-header")
    const pexesoTypeHeader = document.querySelector("#pexeso-type-header")
    const backgroundHelperHeader = document.querySelector("#background-helper-header")
    const gameScoreHeader = document.querySelector("#game-score-header")
    const gameResultsHeader = document.querySelector("#results-header")
    const finalGameTime = document.querySelector("#final-game-time")
    const finalGameScore = document.querySelector("#final-game-score")

    if (darkMode && darkMode !== "false"){
        document.body.style.backgroundColor = "rgb(22, 22, 22)"
        nav.style.backgroundColor = "rgb(22, 22, 22)"
        navLogoText.style.color = "white"
        gameStartHeader.style.color = "white"
        pexesoSelectHeader.style.color = "white"
        pexesoTypeHeader.style.color = "white"
        backgroundHelperHeader.style.color = "white"
        gameTime.style.color = "white"
        gameScore.style.color = "white"
        currentPlayerText.style.color = "white"
        backgroundHelper.style.backgroundColor = "rgb(22, 22, 22)"
        gameScoreHeader.style.color = "white"
        gameResultsHeader.style.color = "white"
        finalGameTime.style.color = "white"
        finalGameScore.style.color = "white"

        for (let i = 0; i < correctCards.length; i++){
            const correctCard = correctCards[i]

            correctCard[0].style.backgroundColor = "rgb(22, 22, 22)"
        }

        document.documentElement.style.setProperty("--scrollbar-color", "white")
    }
    else{
        document.body.style.backgroundColor = "#FDFBFD"
        nav.style.backgroundColor = "#FDFBFD"
        navLogoText.style.color = "#021F31"
        gameStartHeader.style.color = "#021F31"
        pexesoSelectHeader.style.color = "#021F31"
        pexesoTypeHeader.style.color = "#021F31"
        backgroundHelperHeader.style.color = "#021F31"
        gameTime.style.color = "#021F31"
        gameScore.style.color = "#021F31"
        currentPlayerText.style.color = "#021F31"
        backgroundHelper.style.backgroundColor = "#FDFBFD"
        gameScoreHeader.style.color = "#021F31"
        gameResultsHeader.style.color = "#021F31"
        finalGameTime.style.color = "#021F31"
        finalGameScore.style.color = "#021F31"

        for (let i = 0; i < correctCards.length; i++){
            const correctCard = correctCards[i]

            correctCard[0].style.backgroundColor = "#FDFBFD"
        }

        document.documentElement.style.setProperty("--scrollbar-color", "#021F31")
    }
}

function main(){
    setGameVisibility(["visible", "hidden", "hidden"])

    const pexesoLectionSelect = document.querySelector("#pexeso-lection-select")

    updateHTMLSelect(pexesoLectionSelect)

    const navLogo = document.querySelector("#nav-logo")
    navLogo.addEventListener("click", () => {
        window.location.href = "../index.html"
    })

    const startButton = document.querySelector("#start-button")
    startButton.addEventListener("click", () => {
        loadLection("..", pexesoLectionSelect.value, onLectionLoad)
    })

    const menuButton = document.querySelector("#menu-button")
    menuButton.addEventListener("click", () => {
        setGameVisibility(["visible", "hidden", "hidden"])
        correctCards = []
        flippedCardsCount = 0
        cardsFlipped = []
        flipDebounce = false
        score = 0
        seconds = 0
        minutes = 0
        gameTimeInterval = -1
        currentPlayer = "player"
        currentPlayerText.style.visibility = "hidden"
        localMulti = false
        multiScore = 0

        if (computer){
            computer = null
            computer = NaN
        }

        const cardsHolder = document.querySelector("#cards")
        while (cardsHolder.children.length > 0){
            cardsHolder.firstChild.remove()
        }
    })

    backgroundHelper.style.visibility = "hidden"
    currentPlayerText.style.visibility = "hidden"

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