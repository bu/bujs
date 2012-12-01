
var scanner = require("./includes/scanner");
var tokener = require("./includes/parser");

scanner.getTokens("tests/test2.js", function(raw_tokens) {
	tokener.getTokens(raw_tokens, function( tokens ) {
		tokens.map(function(token) {
			console.log("OPCODE", token.operator);
			console.log("SUBJECT", token.subject);
			console.log("OBJECT", token.object);
			console.log("-------------------------------------------");
		});
	});
});
