#include <stdlib.h>

#include "token_storage.h"

void queue_init(Queue* queue) {
	queue->front = NULL;
	queue->rear = NULL;
	queue->size = 0;
}

void queue_push(Queue* queue, char data) {
	Node* new_node;
	new_node = (Node*) malloc( sizeof(Node) );

	new_node->data = data;
	new_node->behind = NULL;
	
	if(queue->rear != NULL) {
		queue->rear->behind = (struct Node*) new_node;
	}

	if(queue->front == NULL) {
		queue->front = new_node;
	}

	queue->rear = new_node;
	queue->size++;
}

int queue_empty(Queue* queue)  {
	if(queue->front == NULL && queue->rear == NULL) {
		return true;
	}

	return false;
}

Node* queue_pop(Queue* queue) {
	Node *this_node;

	if(queue->front == NULL) {
		queue->rear = NULL;
		
		return NULL;
	}

	this_node = queue->front;

	queue->front = (Node*) this_node->behind;

	this_node->behind = NULL;

	queue->size--;

	return this_node;
}

char* queue_extract(Queue* queue) {
	Node *this_node;
	char *queue_chars;

	queue_chars = (char*) malloc( queue->size + 1 );

	unsigned int position = 0;

	while( queue_empty(queue) == false ) {
		this_node = queue_pop(queue);

		if(this_node == NULL) {
			break;
		}

		queue_chars[position] = this_node->data;
		
		// as we don't need this space anymore, we release it
		free(this_node);
		
		position++;
	}

	return queue_chars;
}


