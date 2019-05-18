import {guid} from './guid-generator';
import {NoteItem, SerializedNoteItem} from './note-item';
import {updateObject} from './updateObject';

export interface SerializedNotesList {
    title: string;
    uuid: string;
    created: Date;
    noteItems: SerializedNoteItem[];
    doneNoteItems: SerializedNoteItem[];
}

export class NotesList {
    title: string = '';
    uuid: string = guid();
    created: Date = new Date();
    noteItems: NoteItem[] = [new NoteItem()];
    doneNoteItems: NoteItem[] = [];

    get isDone(): boolean {
        return this.noteItems.filter(it => !it.isDone).length === 0;
    };

    static from(it: SerializedNotesList) {
        const newIt = new NotesList();
        newIt.uuid = it.uuid;
        newIt.title = it.title;
        newIt.noteItems = Array.isArray(it.noteItems) ? it.noteItems.map(it1 => NoteItem.from(it1)) : [];
        newIt.doneNoteItems = Array.isArray(it.doneNoteItems) ? it.doneNoteItems.map(it1 => NoteItem.from(it1)) : [];
        newIt.created = it.created ? new Date(it.created) : new Date();

        return newIt;
    }

    toSerialized(): SerializedNotesList {
        return {
            uuid: this.uuid,
            title: this.title,
            noteItems:this.noteItems.map(it1 => it1.toSerialized()),
            doneNoteItems: this.doneNoteItems.map(it1 => it1.toSerialized()),
            created: this.created ? new Date(this.created) : new Date()
        };
    }

    update(newProps: Partial<NotesList>) {
        return updateObject(this, newProps, this.swallowClone.bind(this));
    }

    swallowClone() {
        const newIt = new NotesList();
        newIt.uuid = this.uuid;
        newIt.title = this.title;
        newIt.noteItems = [...this.noteItems];
        newIt.doneNoteItems = [...this.doneNoteItems];
        newIt.created = this.created;

        return newIt;
    }

    isEmpty() {
        return !this.title || (this.noteItems.length === 1 && !this.noteItems[0].description && !this.noteItems[0].isDone && !this.doneNoteItems.length);
    }
}
