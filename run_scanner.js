var scanner = require("./scanner");

scanner.getTokens("tests/test1-1.js", function(raw_tokens) {
	console.log(raw_tokens);
});
