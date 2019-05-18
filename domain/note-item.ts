import {guid} from './guid-generator';

export class NoteItem {
    uuid: string = guid();
    isDone: boolean = false;
    description: string = '';
    created: Date = new Date();

    static noteItemsCompare(a: NoteItem, b: NoteItem) {
        if (a.isDone) {
            return 1;
        }

        if (b.isDone) {
            return -1;
        }

        if (a.isEmpty()) {
            return 1;
        }

        if (b.isEmpty()) {
            return -1;
        }

        return 0;
    }

    static from(it: any) {
        const todo = new NoteItem();
        todo.uuid = it.uuid;
        todo.isDone = it.isDone;
        todo.description = it.description;
        todo.created = it.created ? new Date(it.created) : new Date();
        return todo;
    }

    isEmpty() {
        return this.description === '';
    }

    clone() {
        const todo = new NoteItem();
        todo.uuid = this.uuid;
        todo.isDone = this.isDone;
        todo.description = this.description;
        todo.created = this.created;

        return todo;
    }
}