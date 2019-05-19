import {guid} from './guid-generator';
import {updateObject} from './updateObject';

export interface SerializedNoteItem {
    uuid: string;
    isDone: boolean;
    description: string;
    created: Date;
}

export class NoteItem {
    uuid: string = guid();
    isDone: boolean = false;
    created: Date = new Date();
    isEmpty: boolean = true;

    private _description: string = '';

    get description() {
        return this._description;
    };

    set description(value: any) {
        this._description = value;
        this.isEmpty = this.description === '';
    }

    static noteItemsCompare(a: NoteItem, b: NoteItem) {
        if (a.isDone) {
            return 1;
        }

        if (b.isDone) {
            return -1;
        }

        if (a.isEmpty) {
            return 1;
        }

        if (b.isEmpty) {
            return -1;
        }

        return 0;
    }

    static from(it: SerializedNoteItem) {
        const todo = new NoteItem();
        todo.uuid = it.uuid;
        todo.isDone = it.isDone;
        todo.description = it.description;
        todo.created = it.created ? new Date(it.created) : new Date();
        return todo;
    }

    update(newProps: Partial<NoteItem> & { description: string }) {
        return updateObject(this, newProps, this.clone.bind(this));
    }

    toSerialized(): SerializedNoteItem {
        return {
            uuid: this.uuid,
            isDone: this.isDone,
            description: this.description,
            created: this.created
        };
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