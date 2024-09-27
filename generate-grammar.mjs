import { openSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { spawn, spawnSync }  from 'node:child_process';



function readDirSyncR(dir) {
    var results = [];
    var list = readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = statSync(file);
        if (stat && stat.isDirectory()) { 
            /* Recurse into a subdirectory */
            results = results.concat(readDirSyncR(file));
        } else { 
            /* Is a file */
            results.push(file);
        }
    });
    return results;
}


function parseCode(fileContents, annotation) {
	return fileContents.filter((line) => {
		return line.indexOf(`${annotation}\n`) == 0
	}).map((line) => {
		return line.substr(`${annotation}\n`.length)
	});
}

function extractAllCode(fileContents, annotation) {
	return parseCode(fileContents, annotation).join("\n");
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceTokens(tokens, contents) {
	for (const tk of tokens) {
		contents = contents.replace(new RegExp(escapeRegExp(tk[0]), 'g'), tk[1]);
	}
	return contents
}

var lexer = [];
// lexer
[
	"./spec/language/tokens.md",
	"./spec/language/identifiers.md",
	"./spec/language/literals.md",
].forEach((file) => {
	var contents = readFileSync(file, {encoding: "utf-8"})
	contents = contents.split("```");
	lexer.push(`//file: ${file}`)
	lexer.push(extractAllCode(contents, "lexer"))
});
writeFileSync("./LanguageLexer.g4", `lexer grammar LanguageLexer;\n` + lexer.join("\n"))

var tokens = [];

lexer.forEach((chunk) => {
	chunk.split("\n").filter((line) => {
		return line.indexOf(" : ") > 0 && line.indexOf(";") > 0
	}).forEach((line) => {
		var parts = line.split(" : ")
		tokens.push([parts[1].substr(0, parts[1].length - 1), parts[0]])
	});
});

console.log("TOKENS!");
console.log(tokens);

var parser = [];
var spec_files = [
	"./spec/language/program.md",
	"./spec/language/identifiers.md",
	"./spec/language/literals.md",
	"./spec/language/type-system.md",
	"./spec/language/functions.md",
	"./spec/memory-management.md",
	"./spec/language/expressions.md",
	// "./spec/generic-programming.md",
	// "./spec/preprocessor-and-metaprogramming.md",
	// "./spec/compiler/compiler-configuration.md",
	"./spec/language/control-flow.md",
	"./spec/language/variables.md",
	"./spec/language/types/array.md",
	// "./spec/language/types/enumerated.md",
];

spec_files.forEach((file) => {
	var contents = readFileSync(file, {encoding: "utf-8"})
	contents = contents.split("```");
	parser.push(`//file: ${file}`)
	parser.push(replaceTokens(tokens, extractAllCode(contents, "syntax")))

	// search for tokens and replace them!
});

writeFileSync("./LanguageParser.g4", `parser grammar LanguageParser;
// options { tokenVocab=LanguageLexer; }
` + parser.join("\n"));


// < core\os\process.language

// readDirSyncR("./spec")
spec_files = [
	// "./spec/language/types/structured.md",
	"./spec/language/functions.md",
]
spec_files.forEach((file) => {
	console.log(`Validating spec file: ${file}`)
	var contents = readFileSync(file, {encoding: "utf-8"})
	contents = contents.split("```");
	parseCode(contents, "language").forEach((text) => {
		if (!text.length) {
			return
		}

		console.log("------------------------")
		console.log(text.split("\n").map((t,idx) => `${idx+1} | ${t}` ).join("\n"))
		console.log("------------------------")
		var tmp_file = "./temp.language";
		writeFileSync(tmp_file, text);
		let fd_stdin = openSync(tmp_file, 'r');
		let antlr4 = spawnSync('antlr4-parse', ['LanguageParser.g4', 'LanguageLexer.g4', 'program', '-gui'], {
		  stdio: [fd_stdin, 1, 2]
		});

		if (antlr4.status != 0) {
			console.log(text)
			process.exit(1);
		}
	});
});




[
	'./tests/syntax-smoke-screen.language',
	'./tests/preprocessor-smoke-screen.language'
].forEach((file) => {

	let fd_stdin = openSync(file, 'r');
	// var fd_stdin = openSync('./tests/syntax/struct-initializer.language', 'r');
	// tokenizer debug
	// let antlr4 = spawn('antlr4-parse', ['LanguageParser.g4', 'LanguageLexer.g4', 'program', '-tokens'], {
	// parser debug
	let antlr4 = spawn('antlr4-parse', ['LanguageParser.g4', 'LanguageLexer.g4', 'program', '-gui'], {
	  stdio: [fd_stdin, 1, 2]
	});
});

/*
//let fd_stdin = openSync('./core/process.language', 'r');
//let fd_stdin = openSync('./core/os.language', 'r');
//let fd_stdin = openSync('./core/index_iterator.language', 'r');
let fd_stdin = openSync('./core/types/allocator.language', 'r');
let antlr4 = spawn('antlr4-parse', ['LanguageParser.g4', 'LanguageLexer.g4', 'packageProgram', '-gui'], {
  stdio: [fd_stdin, 1, 2]
});

*/