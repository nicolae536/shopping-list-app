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

    isEmpty() {
        return this.description === '';
    }

    clone() {
        const todo = new TodoItem();
        todo.uuid = this.uuid;
        todo.isDone = this.isDone;
        todo.description = this.description;

        return todo;
    }
}

export class ListItem {
    uuid: string = guid();
    title: string = '';
    items: TodoItem[] = [new TodoItem()];

    get idDone(): boolean {
        return this.items.filter(it => !it.isDone).length === 0;
    };

    clone() {
        const newIt = new ListItem();
        newIt.uuid = this.uuid;
        newIt.title = this.title;
        newIt.items = this.items;

        return newIt;
    }
}