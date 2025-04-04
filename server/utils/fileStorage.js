const fs = require('fs');
const path = require('path');
const { json } = require('stream/consumers');


function readFile(fileName) {
    return new Promise((resolve, reject) => {
        //creates the path of the file
        const filePath = path.join(__dirname, '..', 'data', fileName);

        //read the file asynchronously
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                const jsonData = JSON.parse(data);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        })
    })
}

function writeFile(fileName, newData) {
    return new Promise((resolve, reject) => {

        const filePath = path.join(__dirname, '..', 'data', fileName);

        fs.readFile(filePath, 'utf8', (err, fileData) => {
            let jsonData = [];

            if (!err && fileData) {
                try {
                    jsonData = JSON.parse(fileData);
                }
                catch (error) {
                    reject(error);
                    return;
                }
            }


            jsonData.push(newData);

            try {
                //convert the data to a json string
                const jsonStringify = JSON.stringify(jsonData, null, 2);

                fs.writeFile(filePath, jsonStringify, 'utf8', (err) => {

                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    });
}


function updateFile(fileName, itemId, updateData) {
    return new Promise((resolve, reject) => {

        const filePath = path.join(__dirname, '..', 'data', fileName);

        fs.readFile(filePath, (err, data) => {

            if (err) {
                reject(err);
                return;
            }
            try {

                let jsonData = JSON.parse(data);

                const index = jsonData.findIndex(item => item.id === itemId)

                if (index !== -1) {

                    jsonData[index] = { ...jsonData[index], ...updateData };

                    const jsonString = JSON.stringify(jsonData, null, 2);

                    fs.writeFile(filePath, jsonString, 'utf8', (err) => {

                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(jsonData);

                    });
                }
                else {
                    reject(new Error(`Item with ID ${itemId} not found`));

                }
            }
            catch (error) {
                reject(error);
            }
        });
    });
}



function deleteFile(fileName, itemId) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, '..', 'data', fileName);

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                let jsonData = JSON.parse(data);

                // Find the index of the item to delete
                const index = jsonData.findIndex(item => item.id === itemId);

                if (index === -1) {
                    reject(new Error(`Item with ID ${itemId} not found`));
                    return;
                }

                // Remove the item from the array
                jsonData.splice(index, 1);

                // Write the updated array back to the file
                const jsonString = JSON.stringify(jsonData, null, 2);

                fs.writeFile(filePath, jsonString, 'utf8', (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(jsonData);
                });
            } catch (error) {
                reject(error);
            }
        });
    });
}


module.exports = { readFile, writeFile, updateFile, deleteFile };