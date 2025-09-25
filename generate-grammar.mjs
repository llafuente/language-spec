// pip install antlr4-tools
import { openSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { spawn, spawnSync }  from 'node:child_process';
import assert from 'node:assert';

// extract lexer and grammer from markdown files
// lexer is marked as "lexer" source code
// syntax is marked as "syntax" source code
// syntax is marked as "syntax" source code
// then it will test documentation examples
// language and language-semantic-error, but it won't check language-syntax-error

const LEXER_FILE = "./LanguageLexer.g4";
const PARSER_FILE = "./LanguageParser.g4";

// reset
try {
	unlinkSync(LEXER_FILE)
	unlinkSync(PARSER_FILE)
} catch (e) {}

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

const fileCache = {};
function readFile(file) {
	if (fileCache[file]) {
		return fileCache[file]
	}

	var contents = readFileSync(file, {encoding: "utf-8"}).split("```")
	assert(contents.length % 2 == 1);

	return (fileCache[file] = contents)
}


function parseCode(fileContents, annotation) {
	const out = []
	for (let i = 0; i < fileContents.length; ++i) {
		const line = fileContents[i];

		if (line.indexOf(`${annotation}\n`) == 0 || line.indexOf(`${annotation}\r\n`) == 0) {
			fileContents.splice(i, 1);
			--i;
			out.push(line.substr(`${annotation}\n`.length))
		}
	}

	return out

	return fileContents.filter((line) => {
		return line.indexOf(`${annotation}\n`) == 0 || line.indexOf(`${annotation}\r\n`) == 0
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
	var contents = readFile(file)

	lexer.push(`//file: ${file}`)
	lexer.push(extractAllCode(contents, "lexer"))
});

writeFileSync(LEXER_FILE, `lexer grammar LanguageLexer;\n` + lexer.join("\n"))

var tokens = [];

lexer.forEach((chunk) => {
	chunk.split("\n").filter((line) => {
		return line.indexOf(" : ") > 0 && line.indexOf(";") > 0
	}).forEach((line) => {
		var parts = line.split(" : ")
		tokens.push([parts[1].substr(0, parts[1].length - 1), parts[0]])
	});
});


//console.log("TOKENS!");
//console.log(tokens);

// order is important for lexer at least!
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
	"./spec/preprocessor-and-metaprogramming.md",
	// "./spec/compiler/compiler-configuration.md",
	"./spec/language/control-flow.md",
	"./spec/language/variables.md",
	"./spec/language/types/array.md",
	"./spec/language/error-handling.md",
	"./spec/language/types/enumerated.md",
  "./spec/language/types/interface.md",
  "./spec/language/types/structured.md",
];

spec_files.forEach((file) => {
	//console.log(file)

	var contents = readFile(file)

	parser.push(`//file: ${file}`)
	parser.push(replaceTokens(tokens, extractAllCode(contents, "syntax")))

	//console.log(parser)
	//process.exit(0)

	// search for tokens and replace them!
});

writeFileSync(PARSER_FILE, `parser grammar LanguageParser;
// options { tokenVocab=LanguageLexer; }
` + parser.join("\n"));


function antlr4(text, option) {
	var tmp_file = "./temp.language";
	writeFileSync(tmp_file, text);
	let fd_stdin = openSync(tmp_file, 'r');
	let result =  spawnSync('C:\\Users\\luis\\.pyenv\\pyenv-win\\shims\\antlr4-parse.bat', [PARSER_FILE, LEXER_FILE, 'program', option], {
	  // stdio: [fd_stdin, 1, 2]
	  stdio: [fd_stdin],
	  encoding: 'utf-8',
	  shell: true,
	});
	console.log(result)

	if (result.error) {
		console.log(result.error);
		process.exit(1)
	}
	
	/*
	console.log(result.stdout)
	let stdout = result.stdout.split("\n").filter((t) => {
		//console.log("**", t, "**")
		if (t.indexOf("program:") !== -1) {
			return false
		}
		return true
	}).join("\n").trim()
	*/
	if (result.stderr) {
		console.log("------------------------")
		console.log(text.split("\n").map((t,idx) => `${idx+1} | ${t}` ).join("\n"))
		console.log("------------------------")
		console.log(result.stderr)
	}
	return result
}


// < core\os\process.language

// readDirSyncR("./spec")
spec_files = [
  "./spec/memory-management.md",
  "./spec/language/type-system.md",
  "./spec/language/types/structured.md",
  "./spec/language/types/interface.md",
  "./spec/language/functions.md",
  "./spec/language/control-flow.md",
  "./spec/language/variables.md",
  "./spec/language/types/array.md",
  "./spec/language/error-handling.md",
  "./spec/language/types/enumerated.md",
]
spec_files.forEach((file) => {
	console.log(`Validating spec file: ${file}`)
	
	var contents = readFile(file);

  ["language", "language-test", "language-semantic-error"].forEach((annotation) => {
  	parseCode(contents, annotation).forEach((text) => {
  		if (!text.length) {
  			return
  		}

  		var result = antlr4(text, "-tree")
  		if (result.status != 0) {
  			console.log(text)
  			process.exit(1);
  		}

  	});
  });

  contents.forEach((l, i) => {
	if (i > 0) {
		const intro = l.split(/(\r\n|\n)/)[0]
		switch (intro) {
			case "language-package": // TODO test it!

			case "language-compiled":
			case "language-syntax-error":
			case "todo-language":
			case "todo-syntax":
			case "output":
			break;
			default:
				assert(intro.length == 0, `unexpected text[${intro.length}]: ${JSON.stringify(intro)}`);
		}
	}
  })
});

[
	'./tests/types.language',
	//'./tests/syntax-smoke-screen.language',
	//'./tests/preprocessor-smoke-screen.language'
].forEach((file) => {
	//antlr4(readFileSync(file, 'utf-8'), "-tree")
  antlr4(readFileSync(file, 'utf-8'), "-trace")
});

/*
//let fd_stdin = openSync('./core/process.language', 'r');
//let fd_stdin = openSync('./core/os.language', 'r');
//let fd_stdin = openSync('./core/index_iterator.language', 'r');
let fd_stdin = openSync('./core/types/allocator.language', 'r');
let antlr4 = spawn('antlr4-parse', [PARSER_FILE, LEXER_FILE, 'packageProgram', '-gui'], {
  stdio: [fd_stdin, 1, 2]
});

*/


// antlr4 -o compiler/cpp -Dlanguage=Cpp LanguageParser.g4 LanguageLexer.g4
// antlr4 -o compiler/python -Dlanguage=Python3 LanguageParser.g4 LanguageLexer.g4

