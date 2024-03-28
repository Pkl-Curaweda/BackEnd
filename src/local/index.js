const fs = require('fs')

class LocalJson {
    fileData = undefined
    filePath = undefined

    constructor(path) {
        this.filePath = path
        try {
            const data = fs.readFileSync(this.filePath);
            this.fileData = JSON.parse(data);
        } catch (error) {
            this.fileData = {};
        }
    }

    readData() {
        return this.fileData
    }
    readDataKey(){
        return Object.keys(this.fileData)
    }
    writeData(store) {
        fs.writeFileSync(this.filePath, JSON.stringify(store, null, 2))
    }
    addEntry(data, value) {
        this.fileData[data] = value
        this.writeData(this.fileData)
    }
    deleteEntry(data) {
        if (this.fileData[data]) {
            delete this.fileData[data]
            this.writeData(this.fileData)
        }
    }
}

module.exports = LocalJson