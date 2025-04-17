export class DataHolder{
    constructor(holderName){
        this.holderName = holderName
        this.data = []
    }

    getDataEntries(dataName){
        let entries = []

        for (let i = 0; i < this.data.length; i++){
            const data = this.data[i]

            if (data[0] !== dataName) continue

            entries.push(data)
        }

        return entries
    }

    getDataEntriesCount(dataName){
        let entriesCount = 0

        for (let i = 0; i < this.data.length; i++){
            const data = this.data[i]

            if (data[0] !== dataName) continue

            entriesCount++
        }

        return entriesCount
    }

    addData(dataName, dataValue){
        const data = [dataName, dataValue]

        this.data.push(data)
    }

    removeData(dataName){
        for (let i = 0; i < this.getDataEntriesCount(dataName); i++){
            let dataIndex = -1

            for (let j = 0; j < this.data.length; j++){
                const data = this.data[j]

                if (data[0] !== dataName) continue

                dataIndex = j

                break
            }

            if (dataIndex < 0) continue

            this.data.splice(dataIndex, 1)
        }
    }

    updateData(dataName, dataValue){
        for (let i = 0; i < this.data.length; i++){
            let data = this.data[i]

            if (data[0] !== dataName) continue

            data[1] = dataValue
        }
    }

    exportToJSONString(){
        const JSONString = JSON.stringify(this.data)

        return JSONString
    }

    loadContentFromJSONString(JSONString){
        const JSONData = JSON.parse(JSONString)

        this.data = JSONData
    }

    saveData(){
        const JSONString = this.exportToJSONString()

        window.localStorage.setItem(this.holderName, JSONString)
    }

    loadData(){
        const JSONString = window.localStorage.getItem(this.holderName)

        if (JSONString === null) return

        this.loadContentFromJSONString(JSONString)
    }
}