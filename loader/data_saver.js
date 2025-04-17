export function saveData(data, dataName){
    window.localStorage.setItem(dataName, data)
}

export function loadData(dataName){
    return window.localStorage.getItem(dataName)
}

export function removeData(dataName){
    window.localStorage.removeItem(dataName)
}