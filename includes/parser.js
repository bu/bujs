exports.getTokens = function(raw_tokens, callback) {
	var _tokens = [];

	var _currentState = null;
	var _currentExpr = { operator: null, subject: null, object: null };

	var _stateStack = [];
	var _exprStack = [];

	return iteratorOverTokens(raw_tokens, 0, function() {
		return callback(_tokens);
	});

	function iteratorOverTokens( tokens, index, callback ) {
		if(tokens.length === index) {
			return callback(_tokens);
		}

		var previous_token = ( index > 0 ) ? tokens[index - 1] : null;
		var this_token = tokens[index];
		var next_token = (index <  tokens.length) ? tokens[index + 1] : null;

		var last_stack_token = _tokens[_tokens.length - 1];

		//console.log(_currentState, _currentExpr, this_token);

		if(_currentState === null){
			if(this_token.token === "STRING") {
				if(this_token.string === "var") {
					_currentState = "VAR";
					_currentExpr.operator = "VAR";

					return next();
				}

				if(this_token.string === "//") {
					_currentState = "COMMENT_ONELINE";
					_currentExpr = { operator: "COMMENT", subject: null };

					return next();
				}

				if(this_token.string === "/" && next_token.token === "MULTIPLY" && next_token.string === "*") {
					_currentState = "COMMENT_MANYLINE";
					_currentExpr.operator = "COMMENT";

					return skipNext();
				}

				_currentState = "STRING";
				_currentExpr.subject = this_token;

				return next();
			}

			if(this_token.token === "PARENTHESES") {
				_currentState = "FUNC_CALL";
				_currentExpr.operator = "FUNC_CALL";
				_currentExpr.arguments = [];
				
				// eg. bu(); console.log();
				if(this_token.string === "()") {
					return stay();
				}

				return next();
			}
		}

		if(_currentState === "FUNC_CALL") {
			if(this_token.token === "LINE_DELIMITER") {
				_currentExpr = { operator: null , subject: null, object: null};
				_currentState = null;

				return next();
			}

			if(this_token.token === "PARENTHESES") {
				if(_currentExpr.object !== null) {
					_currentExpr.arguments.push(_currentExpr.object);
					_currentExpr.object = null;
				}

				if(last_stack_token.operator === "GETTER") {
					var _last_token = _tokens.pop();

					_tokens.push({ operator: "FUNC_CALL", subject: _last_token, object: _currentExpr.arguments });

					_currentExpr = { operator: null , subject: null, object: null};
					_currentState = null;

					return next();
				}
			}

			if(this_token.token === "COMMA") {
				_currentExpr.arguments.push(_currentExpr.object);
				_currentExpr.object = null;
			}

			_stateStack.push(_currentState);
			_exprStack.push(_currentExpr);

			_currentState = "EXPR";
			_currentExpr = { operator: null, subject: null, object: null };
			
			if(this_token.token === "COMMA") {
				return next();
			}

			return stay();
		}

		if(_currentState === "STRING") {
			if(this_token.token === "DOT" && next_token.token === "STRING") {
				_currentExpr.object = next_token;
				_currentExpr.operator = "GETTER";

				_tokens.push(_currentExpr);
				
				_currentExpr = { operator: null, subject: null, object: null };
				_currentState = null;

				return skipNext();
			}
			
			// eg. bu();
			if(this_token.token === "PARENTHESES") {
				_currentExpr.operator = "GETTER";

				_tokens.push(_currentExpr);

				_currentState = null;
				_currentExpr = { operator: null, subject: null, object: null };

				return stay();
			}
		}

		if(_currentState === "COMMENT_ONELINE") {
			if(this_token.token === "NEWLINE") {
				_tokens.push(_currentExpr);

				_currentState = null;
				_currentExpr = { operator: null, subject: null, object: null };

				return next();
			}

			if(_currentExpr.subject === null) {
				_currentExpr.subject = this_token;
				return next();
			}

			_currentExpr.subject.string += this_token.string;
			return next();
		}

		if(_currentState === "COMMENT_MANYLINE") {
			if(this_token.token === "MULTIPLY") {
				if(this_token.string === "*" && next_token.token === "STRING" && next_token.string === "/") {
					_currentExpr.subject.token = "STRING";

					_tokens.push(_currentExpr);

					_currentState = null;
					_currentExpr = { operator: null, subject: null, object: null };

					return skipNext();
				}
			}

			if(_currentExpr.subject === null) {
				_currentExpr.subject = this_token;
				return next();
			}

			_currentExpr.subject.string += this_token.string;

			return next();
		}

		if(_currentState === "VAR") {
			if(this_token.token === "EQUAL") {
				_stateStack.push(_currentState);
				_exprStack.push(_currentExpr);

				_currentState = "EXPR";
				_currentExpr = { operator: null, subject: null, object: null };

				return next();
			}

			if(this_token.token === "LINE_DELIMITER") {
				_tokens.push(_currentExpr);

				_currentState = null;
				_currentExpr = { operator: null, subject: null, object: null };

				return next();
			}

			if(this_token.token === "COMMA") {
				_tokens.push(_currentExpr);

				_currentExpr = "VAR";
				_currentExpr = { operator: "VAR", subject: null, object: null };
			}

			if(this_token.token === "STRING") {
				if(_currentExpr.subject === null) {
					_currentExpr.subject = this_token;
					return next();
				}

				_currentExpr.object = this_token;
				return next();
			}
		}

		if(_currentState === "STRING_DELIMITER") {
			if(this_token.token === "STRING_DELIMITER" && this_token.string === _currentExpr.delimiter) {
				var previous_state = _stateStack.pop();
				var previous_expr = _exprStack.pop();
				
				if(previous_expr.subject === null) {
					previous_expr.subject = _currentExpr.subject;
				} else {
					previous_expr.object = _currentExpr.subject;
				}

				_currentExpr = previous_expr;
				_currentState = previous_state;

				return next();
			}
			
			if(_currentExpr.subject === null) {
				_currentExpr.subject = this_token;
				return next();
			}

			_currentExpr.subject.string += this_token.string;
			return next();
		}

		if(_currentState === "EXPR") {
			// back to the last state
			if(this_token.token === "LINE_DELIMITER" || this_token.token === "COMMA" || this_token.token === "PARENTHESES") {
				var previous_state = _stateStack.pop();
				var previous_expr = _exprStack.pop();
				
				// if value only
				if(_currentExpr.operator === null && _currentExpr.object === null) {
					_currentExpr = _currentExpr.subject;
				}
				
				previous_expr.object = _currentExpr;

				_currentExpr = previous_expr;
				_currentState = previous_state;

				return stay();
			}

			if(this_token.token === "PLUS") {
				_currentExpr.operator = "PLUS";
				return next();
			}

			if(this_token.token === "NUMBER") {
				if(_currentExpr.subject === null) {
					_currentExpr.subject = this_token;
					return next();
				} else {
					_currentExpr.object = this_token;
					return next();
				}
			}

			if(this_token.token === "DOT") {
				if(previous_token.token === "NUMBER" && next_token.token === "NUMBER") {
					if(_currentExpr.subject !== null) {
						_currentExpr.subject.string += "." + next_token.string;
						return skipNext();
					}

					_currentExpr.object.string += "." + next_token.string;
					return skipNext();
				}

				if(previous_token.token === "STRING" && next_token.token === "STRING") {
					if(_currentExpr.subject !== null) {
						_currentExpr.subject = { operator: "GETTER", subject: previous_token, object: next_token };

						return skipNext();
					}

					_currentExpr.object = { operator: "GETTER", subject: previous_token, object: next_token };

					return skipNext();


				}
			}

			if(this_token.token === "STRING_DELIMITER") {
				_stateStack.push(_currentState);
				_exprStack.push(_currentExpr);

				_currentState = "STRING_DELIMITER";
				_currentExpr = { operator: "STRING", subject: null, object: null, delimiter: this_token.string };

				return next();
			}

			if(this_token.token === "STRING") {
				if(_currentExpr.subject === null) {
					_currentExpr.subject = this_token;
					return next();
				} else {
					_currentExpr.object = this_token;
					return next();
				}
			}
		}

		return next();

		function stay() {
			return iteratorOverTokens(tokens, index, callback);
		}

		function skipNext() {
			return iteratorOverTokens(tokens, index + 2, callback);
		}

		function next() {
			return iteratorOverTokens(tokens, index + 1, callback);
		}

	};
};
