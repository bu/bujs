
#define true 1
#define false 0

typedef struct {
	char data;
	struct Node *behind;
} Node;

typedef struct {
	Node *front;
	Node *rear;
	unsigned int size;
} Queue;

void queue_init(Queue* queue);
void queue_push(Queue* queue, char data);
int queue_empty(Queue* queue);

Node* queue_pop(Queue* queue);
char* queue_extract(Queue* queue);
