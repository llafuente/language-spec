// pip install antlr4-tools
// deno run --allow-read --allow-write --allow-env --allow-run .\generate-grammar.ts

import {
  openSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import assert from "node:assert";
import path from "node:path";
import process from "node:process";

// extract lexer and grammer from markdown files
// lexer is marked as "lexer" source code
// syntax is marked as "syntax" source code
// syntax is marked as "syntax" source code
// then it will test documentation examples
// language and language-semantic-error, but it won't check language-syntax-error

const COMPILER_PATH = "./compiler/typescript/";
const LEXER_FILE = "./LanguageLexer.g4";
const PARSER_FILE = "./LanguageParser.g4";

// reset
try {
  unlinkSync(LEXER_FILE);
  unlinkSync(PARSER_FILE);
} catch (e) {}

function readDirSyncR(dir: string) {
  let results: string[] = [];
  const list = readdirSync(dir);
  list.forEach(function (file) {
    file = dir + "/" + file;
    const stat = statSync(file);
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

const fileCache: any = {};
function readFile(file: string): string[] {
  if (fileCache[file]) {
    return fileCache[file];
  }

  const contents = readFileSync(file, { encoding: "utf-8" }).split("```");
  assert(contents.length % 2 == 1);

  return (fileCache[file] = contents);
}

function parseCode(fileContents: string[], annotation: string) {
  const out = [];
  for (let i = 0; i < fileContents.length; ++i) {
    const line = fileContents[i];

    if (
      line.indexOf(`${annotation}\n`) == 0 ||
      line.indexOf(`${annotation}\r\n`) == 0
    ) {
      fileContents.splice(i, 1);
      --i;
      out.push(line.substr(`${annotation}\n`.length));
    }
  }

  return out;
}

function extractAllCode(fileContents: string[], annotation: string) {
  return parseCode(fileContents, annotation).join("\n");
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function replaceTokens(tokens: string[][], contents: string) {
  for (const tk of tokens) {
    contents = contents.replace(new RegExp(escapeRegExp(tk[0]), "g"), tk[1]);
  }
  return contents;
}

console.log("LEXER");

const lexer: string[] = [];
// lexer
[
  "./spec/language/tokens.md",
  "./spec/language/identifiers.md",
  "./spec/language/literals.md",
  "./spec/language/regular-expressions.md",
].forEach((file) => {
  const contents = readFile(file);

  lexer.push(`//file: ${file}`);
  lexer.push(extractAllCode(contents, "lexer"));
});

const lexerContents = `lexer grammar LanguageLexer;\n` + lexer.join("\n");
writeFileSync(LEXER_FILE, lexerContents);
console.log(`writed ${LEXER_FILE}`);

// extract all tokens to replace it's value in the grammar
const tokens: string[][] = [];

lexer.forEach((chunk) => {
  chunk.split("\n").filter((line) => {
    return line.indexOf(" : ") > 0 && line.indexOf(";") > 0;
  }).forEach((line) => {
    const parts = line.split(" : ");
    tokens.push([parts[1].substr(0, parts[1].length - 1), parts[0]]);
  });
});

console.log(`Found ${tokens.length} tokens`);

console.log(`Parser`);

// order is important for lexer at least!
const parser: string[] = [];
let spec_files = readDirSyncR("./spec")
console.log(spec_files)

spec_files.forEach((file) => {
  //console.log(file)

  const contents = readFile(file);

  parser.push(`//file: ${file}`);
  parser.push(replaceTokens(tokens, extractAllCode(contents, "syntax")));

  //console.log(parser)
  //process.exit(0)

  // search for tokens and replace them!
});

writeFileSync(
  PARSER_FILE,
  `parser grammar LanguageParser;
options { tokenVocab=LanguageLexer; }
` + parser.join("\n"),
);

console.log(`writed ${PARSER_FILE}`);

console.log("COMPILER");
{
  const compile = new Deno.Command(
    "C:\\Users\\luis\\.pyenv\\pyenv-win\\shims\\antlr4.bat",
    {
      args: [
        "-o",
        "compiler/typescript",
        "-Dlanguage=TypeScript",
        PARSER_FILE,
        LEXER_FILE,
      ],
      stdout: "piped",
    },
  );
  const { code, stdout, stderr } = await compile.output();
  console.log(
    `Compile: ${code}\nstdout: ${new TextDecoder().decode(stdout)}\nstderr:${
      new TextDecoder().decode(stderr)
    }`,
  ); // Check if the command executed successfully
  if (code != 0) {
    process.exit(0);
  }

  // fix sloppy-imports
  for (
    const file of [
      path.join(COMPILER_PATH, "LanguageParserListener.ts"),
      path.join(COMPILER_PATH, "LanguageParser.ts"),
    ]
  ) {
    Deno.writeTextFileSync(
      file,
      Deno.readTextFileSync(file).replaceAll(".js\"", ".ts\""),
    );
  }
}
// cat .\temp.language | antlr4-parse.bat .\LanguageLexer.g4 .\LanguageParser.g4 program -gui
// cat .\temp.language | antlr4-parse.bat .\LanguageLexer.g4 .\LanguageParser.g4 program -tree
// deno run --allow-read .\compiler\typescript\compiler.ts .\temp.language
async function run_compiler(text: string) {
  const tmp_file = "./temp.language";
  writeFileSync(tmp_file, text);

  return new Deno.Command("deno", {
    args: [
      "run",
      "--allow-read",
      path.join(COMPILER_PATH, "compiler.ts"),
      "./temp.language",
    ],
    cwd: "C:\\Users\\luis\\Desktop\\git\\language-spec",
  });
}

// < core\os\process.language

const snippets: {file: string, text: string}[] = [];

spec_files = readDirSyncR("./spec")

spec_files.forEach((file) => {
  console.log(`Validating spec file: ${file}`);

  const contents = readFile(file);

  ["language", "language-test", "language-semantic-error"].forEach(
    (annotation) => {
      parseCode(contents, annotation).forEach(async (text) => {
        if (!text.length) {
          return;
        }

        snippets.push({text, file});
      });
    },
  );

  contents.forEach((l: string, i: number) => {
    if (i > 0) {
      const intro = l.split(/(\r\n|\n)/)[0];
      switch (intro) {
        case "language-package": // TODO test it!
        case "language-compiled":
        case "language-syntax-error":
        case "language-proprossal":
        case "language-propossal":        
        case "todo-language":
        case "todo-language-semantic-error":          
        case "todo-syntax":
        case "json":          
        case "output":
          break;
        default:
          assert(
            intro.length == 0,
            `unexpected text[${intro.length}]: ${JSON.stringify(intro)}`,
          );
      }
    }
  });
});

[
  "./examples/abc.language",
]
.forEach((file) => {
  console.log(`Validating example file: ${file}`);

  const text = readFileSync(file, { encoding: "utf-8" });
  snippets.push({text, file});
});




for (const snippet of snippets) {
  console.log(`Validating file: ${snippet.file}`);

  const command = await run_compiler(snippet.text);
  const { code, stdout, stderr } = await command.output();
  
  if (code != 0) {
    console.log(snippet.text);
    console.log(
      `Compile: ${code}\nstdout: ${new TextDecoder().decode(stdout)}\nstderr:${
        new TextDecoder().decode(stderr)
      }`,
    );
    console.log(snippet.file)
    process.exit(1);
  }
}

/*
[
	'./tests/types.language',
	//'./tests/syntax-smoke-screen.language',
	//'./tests/preprocessor-smoke-screen.language'
].forEach((file) => {
	//antlr4(readFileSync(file, 'utf-8'), "-tree")
  console.log(antlr4(openSync(file, 'r'), "-tree"))
});
*/

// single file test
// let fd_stdin = openSync('./core/process.language', 'r');
// let fd_stdin = openSync('./core/os.language', 'r');
// let fd_stdin = openSync('./core/index_iterator.language', 'r');
// let fd_stdin = openSync('./core/types/allocator.language', 'r');
// let antlr4 = spawn('antlr4-parse', [PARSER_FILE, LEXER_FILE, 'packageProgram', '-gui'], { stdio: [fd_stdin, 1, 2]});

// generate compilers
// antlr4 -o compiler/cpp -Dlanguage=Cpp LanguageParser.g4 LanguageLexer.g4
// spawn('C:\\Users\\luis\\.pyenv\\pyenv-win\\shims\\antlr4.bat', ["-o", "compiler/cpp", "-Dlanguage=Cpp", PARSER_FILE, LEXER_FILE], { stdio: 'pipe', shell: true, });

// antlr4 -o compiler/python -Dlanguage=Python3 LanguageParser.g4 LanguageLexer.g4
// spawn('C:\\Users\\luis\\.pyenv\\pyenv-win\\shims\\antlr4.bat', ["-o", "compiler/python", "-Dlanguage=Python3", PARSER_FILE, LEXER_FILE], { stdio: 'pipe', shell: true, });

// antlr4 -o compiler/javascript -Dlanguage=JavaScript LanguageParser.g4 LanguageLexer.g4
// spawn('C:\\Users\\luis\\.pyenv\\pyenv-win\\shims\\antlr4.bat', ["-o", "compiler/javascript", "-Dlanguage=JavaScript", PARSER_FILE, LEXER_FILE], { stdio: 'pipe', shell: true, });

// antlr4 -o compiler/javascript -Dlanguage=TypeScript LanguageParser.g4 LanguageLexer.g4
