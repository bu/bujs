
exports.getTokens = function(raw_tokens, callback) {
	var _tokens = [];

	var _currentState = null;
	var _currentExpr = [];

	return iteratorOverTokens(raw_tokens, 0, function() {
		return callback(_tokens);
	});

	function iteratorOverTokens( tokens, index, callback ) {
		if(tokens.length === index) {
			return callback();
		}

		var this_token = tokens[index];

		if(this_token.token === "STRING") {
			if(this_token.string === "var" && _currentState === null) {
				_currentState = "T_VAR";
				_currentExpr.push( this_token );
			} else if (this_token.string === "//" && _currentState === null) {
				_currentState = "COMMENT_ONELINE";
				_currentExpr.push( this_token );
			} else if (this_token.string === "/" && _currentState === null) {
				_currentState = "COMMENT_MANYLINE_MAYBE";
				_currentExpr.push(this_token);
			} else if (this_token.string === "/" && _currentState === "COMMENT_MANYLINE_MAYBE") {
				closeExpr();
			} else if (_currentState === null) {
				_currentState = "STRING_UNKNOWN";
				_currentExpr.push( this_token );
			} else if (_currentState === "STRING_UNKNOWN" ) {
				throw new Error("two string");
			} else if (_currentState === "VALUE_ASSIGN") {
				_currentExpr.push(this_token);
			} else if (_currentState === "VALUE_GETTER") {
				closeExpr();
			} else {
				_currentExpr.push(this_token);
			}
		}

		if(this_token.token === "EQUAL") {
			if(_currentState === "STRING_UNKNOWN") {
				_currentState = "VALUE_ASSIGN";
				_currentExpr.push(this_token);
			}
		}

		if(this_token.token === "MULTIPLY") {
			if(_currentState === "COMMENT_MANYLINE_MAYBE") {
				_currentState = "COMMENT_MANYLINE";
				_currentExpr.push(this_token);
			} else {
				_currentState = "COMMENT_MANYLINE_MAYBE";
				_currentExpr.push(this_token);
			}
		}

		if(this_token.token === "PLUS") {
			if(_currentState === "VALUE_ASSIGN") {
				_currentExpr.push(this_token);
			}
		}

		if(this_token.token === "DOT") {
			if(_currentState === "STRING_UNKNOWN") {
				_currentState = "VALUE_GETTER";
				_currentExpr.push(this_token);
			}
		}

		if(this_token.token === "PARENTHESES") {
			if(_currentState === null) {
				_currentState = "ARGUMENT_BLOCK";
				_currentExpr.push(this_token);
			} else if(_currentState === "ARGUMENT_BLOCK") {
				closeExpr();
			} else {
				throw new Error("wired");
			}
		}

		if(this_token.token === "LINE_DELIMITER") {
			if(_currentState === "VALUE_GETTER") {
				closeExpr();
			}

			if(_currentState === "T_VAR") {
				closeExpr();
			}

			if(_currentState === "VALUE_ASSIGN") {
				closeExpr();
			}
		}

		if(this_token.token === "NEWLINE") {
			if(_currentState === "COMMENT_ONELINE") {
				closeExpr();
			}
		}

		return iteratorOverTokens(tokens, index + 1, callback);

		function closeExpr() {
			_currentExpr.push( this_token );
			_tokens.push({ expr_type: _currentState, expr: _currentExpr });
				
			_currentState = null;
			_currentExpr = [];
		}
	}
};
