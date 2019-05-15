import {guid} from './guid-generator';

export class NoteItem {
    uuid: string = guid();
    isDone: boolean = false;
    description: string = '';
    created: Date = new Date();

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

    static from(it: any) {
        const todo = new NoteItem();
        todo.uuid = it.uuid;
        todo.isDone = it.isDone;
        todo.description = it.description;
        todo.created = it.created ? new Date(it.created) : new Date();
        return todo;
    }
}