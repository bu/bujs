#include <stdio.h>

#include "tokens.h"
#include "token_storage.h"

int main(void) {
	FILE *fp;
	Queue token_cache;

	queue_init(&token_cache);
	
	// previous state
	char previous_state = 0; 
	char current_state = 0;
	int file_pos = 0;

	fp = fopen("ex2.js", "r");

	if(fp == NULL) {
		printf("failed to read file");
		return 1;
	}

	while( !feof(fp) )  {
		char ch = fgetc(fp);
		
		// if we've reach the end of the file, exit
		if( ch == EOF ) {
			break;
		}

		current_state = 0;

		switch(ch) {
			case 10:
			case 13:
				current_state = T_NEWLINE;
			break;

			case 42:
				current_state = T_MULTIPLY;
			break;

			case 32:
			case 9:
				current_state = T_SPACE;
			break;

			case 43:
				current_state = T_PLUS;	
			break;

			case 59:
				current_state = T_LINE_DELIMITER;
			break;

			case 91:
			case 93:
				current_state = T_GETTER_BRACKETS;
			break;

			case 46:
				current_state = T_DOT;
			break;

			case 44:
				current_state = T_COMMA;
			break;

			case 48:
			case 49:
			case 50:
			case 51:
			case 52:
			case 53:
			case 54:
			case 55:
			case 56:
			case 57:
				current_state = T_NUMBER;
			break;

			case 39:
			case 34:
				current_state = T_STRING_DELIMITER;
			break;

			case 123:
			case 125:
				current_state = T_BLOCK_DELIMITER;
			break;

			case 40:
			case 41:
				current_state = T_PARENTHESES;
			break;

			case 61:
				current_state = T_EQUAL;
			break;

			default:
				current_state = T_STRING;
			break;
		}

		if( current_state != previous_state && file_pos > 0 ) {
			char* state_tokens = queue_extract(&token_cache);

			printf("state: %02d, %s\n", previous_state, state_tokens);
		}

		queue_push(&token_cache, ch);

		previous_state = current_state;

		file_pos++;
	}

	return 0;
}
