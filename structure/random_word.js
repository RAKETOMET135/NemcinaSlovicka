import { Random } from "./random.js"

export class WordList {
    constructor(wordList) {
        this.wordList = wordList

        this.currentList = []
    }

    _loadList() {
        this.currentList = []

        for (let i = 0; i < this.wordList.length; i++) {
            const word = this.wordList[i]
            const priority = word.priority

            for (let j = 0; j < priority; j++) {
                this.currentList.push(word)
            }
        }
    }

    _hasDiffWord(currentWord) {
        for (const word of this.currentList) {
            if (word === currentWord) continue

            return true
        }

        return false
    }

    getRandomWord(currentWord) {
        if (this.currentList.length <= 0) {
            this._loadList()
        }

        let randomWordIndex = Random.getNumber(0, this.currentList.length - 1)
        let randomWord = this.currentList[randomWordIndex]
        
        if (!this._hasDiffWord(currentWord) || this.currentList.length <= 1) {
            this.currentList = []

            return randomWord
        }

        if (randomWord !== currentWord) {
            this.currentList.splice(randomWordIndex, 1)

            return randomWord
        }

        for (let i = 0; i < this.currentList.length; i++) {
            const word = this.currentList[i]

            if (word === currentWord) continue

            this.currentList.splice(i, 1)

            return word
        }

        this.currentList.splice(randomWordIndex, 1)

        return randomWord
    }
}
