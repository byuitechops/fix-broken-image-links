/*eslint-env node, es6*/
/*eslint no-console:0*/
/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/

var fs = require('fs'),
    pathLib = require('path'),
    cheerio = require('cheerio'),
    timestamp = Date.now(),
    htmlFiles = [],
    currentPath = pathLib.resolve('../D2LExport_ART110/');
//make a new folder with the timestamp in the name
var newPath = pathLib.resolve(currentPath, 'Updated_Files' + timestamp);
fs.mkdirSync(newPath);

//read the folder from the computer and save html files into array
htmlFiles = fs.readdirSync(currentPath)
    .filter(function (file) {
        return pathLib.extname(file) === '.html';
    });
//console.log('HTMLFILES', htmlFiles);

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
            console.log(newSrc);
            image.attr('src', newSrc);
        }
    });
    //get all html back from cheerio
    contents = $.html()
    // write html to a new folder (without changing the filenames)
    fs.writeFileSync(pathLib.resolve(newPath, file), contents)
});
