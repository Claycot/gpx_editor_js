var fs = require('fs');

//open file as text
var filePath = 'C:/Users/Clay/Documents/Programming/gpx_editor_js/test/Morning_Ride.gpx';
var fileContents = fs.readFileSync(filePath, { encoding: 'utf-8' });

//get first time string from the search index
function getTimeString(inputFile, searchIndex) {
    var startIndex = inputFile.indexOf("<time>", searchIndex);
    if (startIndex !== -1) {
        startIndex += "<time>".length;

        var endIndex = inputFile.indexOf("</time>", startIndex);
        return {
            "timeString": inputFile.slice(startIndex, endIndex),
            "startIndex": startIndex,
            "endIndex": endIndex
        };
    }
    else {
        return {
            "timeString": null,
            "startIndex": -1,
            "endIndex": -1
        }
    }
}

//convert a time string to an object
function timeStringToObject(inputString) {
    return new Date(inputString);
}

//convert a time object into a string of varying formats
function timeObjectToString(inputObject, formatType) {
    if (Object.prototype.toString.call(inputObject) !== '[object Date]') {
        return null;
    }

    switch(formatType) {
        case "datetime": 
            return inputObject.toString();
        case "date": 
            return inputObject.toDateString();
        case "utc": 
            return inputObject.toUTCString();
        case "iso":
            return inputObject.toISOString();
        default:
            return null;
    }
}

//print the starting data and time for the user
var firstTime = getTimeString(fileContents, 0);
if (firstTime.timeString !== null) {
    var firstTimeObject = timeStringToObject(firstTime.timeString);
    console.log("The GPS file currently begins at " + timeObjectToString(firstTimeObject, "datetime"));
}

//ask what time the activity should start
console.log("What time should the GPS file start?");
var newTimeObject = timeStringToObject("2019-07-18T13:26:18.000Z");
console.log("The GPS file will now start at " + timeObjectToString(newTimeObject, "datetime"));

//calculate the difference in time between desired and given
var timeOffset = newTimeObject.getTime() - firstTimeObject.getTime();
console.log("Going to offset the GPS file by " + timeOffset);

//offset all lines where dates exist
searchIndex = 0;
while (searchIndex < fileContents.length) {
    let oldTimeObject = getTimeString(fileContents, searchIndex);

    if (oldTimeObject.timeString === null) {
        break;
    }
    else {
        //offset the current line
        const timeObject = timeStringToObject(oldTimeObject.timeString);
        const newTime = timeObject.getTime() + timeOffset;
        const newTimeObject = timeStringToObject(newTime);
        fileContents = fileContents.substring(0, oldTimeObject.startIndex) + timeObjectToString(newTimeObject, "iso") + fileContents.substring(oldTimeObject.endIndex);

        //tell the search to start at the end of the last found string
        searchIndex = oldTimeObject.endIndex;
    }
}

//save file with new name
var fileParts = filePath.split(".");
fileParts[fileParts.length - 2] += "_shifted";
var filePathNew = fileParts.join(".");
fs.writeFileSync(filePathNew, fileContents);