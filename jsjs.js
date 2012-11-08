
var scanner = require("./includes/scanner");
var tokener = require("./includes/parser");

scanner.getTokens("tests/test1-3.js", function(raw_tokens) {
	tokener.getTokens(raw_tokens, function( tokens ) {
		tokens.map(function(token) {
			console.log(token.operator, token.subject, token.object);
		});
	});
});
