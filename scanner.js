var fs = require("fs");

exports.getTokens = function(filename, callback) {
	fs.readFile(filename, "utf-8", function( err, file_content ) {
		// 
		var _previousState = null;

		var states = [],
			_cacheToken = "";
		
		function readByChar(raw_data, offset, callback) {
			if(raw_data.length === offset) {
				return callback();
			}

			var current_char = raw_data.charAt(offset),
				_currentState = "";

			switch(current_char) {
				case " ":
				case "\t":
					_currentState = "SPACE";
				break;

				case "=":
					_currentState = "EQUAL";
				break;

				case "-":
					_currentState = "MINUS";
				break;

				case "+":
					_currentState = "PLUS";
				break;

				case "*":
					_currentState = "MULTIPLY"
				break;

				case "{":
				case "}":
					_currentState = "BLOCK_DELIMITER";
				break;

				case ";":
					_currentState = "LINE_DELIMITER";
				break;

				case "(":
				case ")":
					_currentState = "PARENTHESES";
				break;

				case ",":
					_currentState = "COMMA";
				break;

				case ":":
					_currentState = "COLON";
				break;

				case ".":
					_currentState = "DOT";
				break;

				case "'":
				case '"':
					_currentState = "STRING_DELIMITER";
				break;

				case "\n":
					_currentState = "NEWLINE";
				break;

				default:
					_currentState = "STRING";
				break;
			}

			if( _currentState !== _previousState && offset > 0 ) {
				states.push({ token: _previousState, string: _cacheToken });

				_cacheToken = "";
			}

			_cacheToken += current_char;

			_previousState = _currentState;
			
			return readByChar(raw_data, offset + 1, callback);
		}

		readByChar(file_content, 0, function() {
			callback(states);
		});
	});
};
