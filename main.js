#! /usr/bin/env node

/*eslint-env node, es6*/
/*eslint no-console:0*/
/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/
var fs = require('fs'),
    pathLib = require('path'),
    cheerio = require('cheerio'),
    dsv = require('d3-dsv'),
    timestamp = Date.now(),
    htmlFiles = [],
    allImages = [],
    currentPath = pathLib.resolve('.');

console.log('current path', currentPath);
//helper function to unique images by object attribute
function makeToUnique(attribute) {
    return function (image, i, originalArray) {
        return originalArray.findIndex((function (findImage) {
            return findImage[attribute] === image[attribute];
        })) === i;
    }
}
//format timestamp - inhibits multiple runs. May use in the future
//timestamp = (timestamp.getUTCMonth() + 1) + '_' +
//    timestamp.getUTCDate() + '_' +
//    timestamp.getUTCFullYear();

//make a new folder with the timestamp in the name
var newPath = pathLib.resolve(currentPath, 'Updated_Files_' + timestamp);
fs.mkdirSync(newPath);

//save html files
htmlFiles = fs.readdirSync(currentPath)
    .filter(function (file) {
        return pathLib.extname(file) === '.html';
    }).map(function (file) {
        var path = pathLib.resolve(currentPath, file);
        var contents = fs.readFileSync(path, 'utf8');
        return {
            name: path,
            contents: contents
        };
    });

var imgSrcs = htmlFiles.reduce(function (imgSrcs, file) {
    //parse file w/Cheerio
    $ = cheerio.load(file.contents)
    images = $('img');
    images.each(function (i, image) {
        image = $(image)
        //remove old source attr
        var source = image.attr('src');
        //takes care of the query string if it exists
        if (source.includes('Course%20Files')) {
            var newSrc = source.replace(/\?.*$/, ''),
                split = newSrc.split('/');
            newSrc = split[0] + '/' + split[split.length - 1];
            imgSrcs.push({
                source: source,
                newSource: newSrc
            });
        }
    });
    return imgSrcs;
}, []);

//check imgSrcs for duplicates
fs.writeFileSync('before.csv', dsv.csvFormat(imgSrcs));
imgSrcs = imgSrcs.filter(makeToUnique('source'));
fs.writeFileSync('after.csv', dsv.csvFormat(imgSrcs));
var nonDuplicates = imgSrcs.every(makeToUnique('newSource'));

//make changes to individual html files
imgSrcs.map(function (file) {
    //get all html back from cheerio
    contents = $.html()
    // write html to a new folder (keeping the filenames)
    fs.writeFileSync(pathLib.resolve(newPath, file), contents)
});
