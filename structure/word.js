export class word{
    constructor(czWord, deWord, altWord, alt2Word, priority){
        this.czWord = czWord
        this.deWord = deWord
        this.alts = [altWord, alt2Word]
        this.perfekt = null
        this.perfektPossibleAnswers = []
        this.correct = 0
        this.incorrect = 0
        this.timesDisplayed = 0
        this.timesHintUsed = 0
        this.chance = 0
        this.streak = 0
        this.maxStreak = 0

        if (priority){
            this.priority = priority
        }
        else{
            this.priority = 1
        }

        for (let index = 0; index < 2; index++){
            let possibleAnswers = []
            let correctWordString

            if (index === 0){
                for (let i = 0; i < this.alts.length; i++){
                    const alt = this.alts[i]
        
                    if (!alt) continue
                    if (alt === "") continue
        
                    possibleAnswers.push(alt)
                }
        
                correctWordString = this.deWord
            }
            else{
                correctWordString = this.czWord
            }
        
            let currentlyBuildedWord = ""
            for (let i = 0; i < correctWordString.length; i++){
                const letter = correctWordString.slice(i, i +1)
        
                if (letter === ","){
                    possibleAnswers.push(currentlyBuildedWord)
                    currentlyBuildedWord = ""
                    continue
                }
        
                if (letter === " "){
                    if (correctWordString.slice(i -1, i) === "," || correctWordString.slice(i +1, i +2) === "("){
                        continue
                    }
                }
        
                if (letter === "("){
                    possibleAnswers.push(currentlyBuildedWord)
                    currentlyBuildedWord = ""
                    continue
                }
        
                if (letter === ")"){
                    possibleAnswers.push(currentlyBuildedWord)
                    currentlyBuildedWord = ""
                    continue
                }
        
                currentlyBuildedWord += letter
        
                if (i === correctWordString.length -1) possibleAnswers.push(currentlyBuildedWord)
            }

            if (index === 0){
                this.dePossibleAnswers = possibleAnswers
            }
            else{
                this.czPossibleAnswers = possibleAnswers
            }
        }
    }

    updatePerfekt(){
        if (!this.perfekt) return

        let possibleAnswers = []
        let correctWordString = this.perfekt

        let currentlyBuildedWord = ""
        for (let i = 0; i < correctWordString.length; i++) {
            const letter = correctWordString.slice(i, i + 1)

            if (letter === ",") {
                possibleAnswers.push(currentlyBuildedWord)
                currentlyBuildedWord = ""
                continue
            }

            if (letter === " ") {
                if (correctWordString.slice(i - 1, i) === "," || correctWordString.slice(i + 1, i + 2) === "(") {
                    continue
                }
            }

            if (letter === "(") {
                possibleAnswers.push(currentlyBuildedWord)
                currentlyBuildedWord = ""
                continue
            }

            if (letter === ")") {
                possibleAnswers.push(currentlyBuildedWord)
                currentlyBuildedWord = ""
                continue
            }

            currentlyBuildedWord += letter

            if (i === correctWordString.length - 1) possibleAnswers.push(currentlyBuildedWord)
        }

        this.perfektPossibleAnswers = possibleAnswers
    }
}