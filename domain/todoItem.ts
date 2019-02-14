function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// then to call it, plus stitch in '4' in the third group
export function guid() {
    return (S4() + S4() + '-' + S4() + '-4' + S4().substr(0, 3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase();
};

export class TodoItem {
    uuid: string = guid();
    isDone: boolean = false;
    description: string = '';
    created: Date = new Date();

    isEmpty() {
        return this.description === '';
    }

    clone() {
        const todo = new TodoItem();
        todo.uuid = this.uuid;
        todo.isDone = this.isDone;
        todo.description = this.description;
        todo.created = this.created;

        return todo;
    }

    static from(it: any) {
        console.log('TodoItem', it);
        const todo = new TodoItem();
        todo.uuid = it.uuid;
        todo.isDone = it.isDone;
        todo.description = it.description;
        todo.created = it.created ? new Date(it.created) : new Date();
        return todo;
    }
}

export class TodoListableItem {
    uuid: string = guid();
    title: string = '';
    created: Date = new Date();
    items: TodoItem[] = [new TodoItem()];

    get idDone(): boolean {
        return this.items.filter(it => !it.isDone).length === 0;
    };

    clone() {
        const newIt = new TodoListableItem();
        newIt.uuid = this.uuid;
        newIt.title = this.title;
        newIt.items = this.items;
        newIt.created = this.created;

        return newIt;
    }

    static from(it: any) {
        console.log('TodoListableItem', it);
        const newIt = new TodoListableItem();
        newIt.uuid = it.uuid;
        newIt.title = it.title;
        newIt.items = Array.isArray(it.items) ? it.items.map(it1 => TodoItem.from(it1)) : [];
        newIt.created = it.created ? new Date(it.created) : new Date();

        return newIt;
    }
}