export class Random{
    static getNumber(rangeMinInclusive, rangeMaxInclusive){
        return rangeMinInclusive + Math.floor(Math.random() * (rangeMaxInclusive - rangeMinInclusive + 1))
    }

    static getFloatNumber(rangeMinInclusive, rangeMaxInclusive){
        return rangeMinInclusive + Math.floor(Math.random() * ((rangeMaxInclusive - rangeMinInclusive + 1) * 100)) / 100
    }
}