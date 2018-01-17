#! /usr/bin/env node

/*eslint-env node, es6*/
/*eslint no-console:0*/
/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/
var fs = require('fs'),
    pathLib = require('path'),
    cheerio = require('cheerio'),
    timestamp = new Date(),
    htmlFiles = [],
    allImages = [],
    currentPath = pathLib.resolve('.');

console.log(currentPath);

//format timestamp
timestamp = (timestamp.getUTCMonth() + 1) + '_'
            + timestamp.getUTCDate() + '_'
            + timestamp.getUTCFullYear();

//make a new folder with the timestamp in the name
var newPath = pathLib.resolve(currentPath, 'Updated_Files_' + timestamp);
fs.mkdirSync(newPath);

//read the folder from the computer and save html files into array
htmlFiles = fs.readdirSync(currentPath)
    .filter(function (file) {
        return pathLib.extname(file) === '.html';
    });

htmlFiles.map(function (file) {
    //read file- html string
    var contents = fs.readFileSync(pathLib.resolve(currentPath, file), 'utf8');
    //parse file with Cheerio
    $ = cheerio.load(contents)
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
            allImages.push(newSrc);
            image.attr('src', newSrc);
        }
    });
    //get all html back from cheerio
    contents = $.html()
    // write html to a new folder (without changing the filenames)
    fs.writeFileSync(pathLib.resolve(newPath, file), contents)
});
var filename = 'all-course-images';

function toUnique(image, i, uniqueImages) {
    return uniqueImages.indexOf(image) === i;
}

fs.writeFileSync(filename + '.csv', toUnique(allImages));
