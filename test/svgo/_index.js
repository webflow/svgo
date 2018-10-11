'use strict';

var FS = require('fs'),
    PATH = require('path'),
    EOL = require('os').EOL,
    regEOL = new RegExp(EOL, 'g'),
    SVGO = require(process.env.COVERAGE ?
                   '../../lib-cov/svgo':
                   '../../lib/svgo');

describe('indentation', function() {

    it('should create indent with 2 spaces', function() {

        var filepath = PATH.resolve(__dirname, './test.svg'),
            svgo;

        FS.readFile(filepath, 'utf8', function(err, data) {
            if (err) {
                throw err;
            }

            var splitted = normalize(data).split(/\s*@@@\s*/),
                orig     = splitted[0],
                should   = splitted[1];

            svgo = new SVGO({
                full    : true,
                plugins : [],
                js2svg  : { pretty: true, indent: 2 }
            });

            var result = svgo.optimize(orig, {path: filepath});

            normalize(result.data).should.be.equal(should);
        });

    });

});

function normalize(file) {
    return file.trim().replace(regEOL, '\n');
}
