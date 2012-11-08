
var scanner = require("./scanner");
var tokener = require("./tokener");

var string_tokens = [
	"break",
	"case",
	"catch",
	"continue",
	"debugger",
	"default",
	"delete",
	"do",
	"else",
	"finally",
	"for",
	"function",
	"if",
	"in",
	"instanceof",
	"new",
	"return",
	"switch",
	"this",
	"throw",
	"try",
	"typeof",
	"var",
	"void",
	"while",
	"with"
];

var memory_space = {};

scanner.getTokens("tests/test1.js", function(raw_tokens) {
	tokener.getTokens(raw_tokens, function( tokens ) {
		
		









		console.log(tokens);
	});
});
