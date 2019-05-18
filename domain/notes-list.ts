import {guid} from './guid-generator';
import {NoteItem} from './note-item';
import {updateObject} from './updateObject';

export class NotesList {
    title: string = '';
    uuid: string = guid();
    created: Date = new Date();
    notesItems: NoteItem[] = [new NoteItem()];

    get isDone(): boolean {
        return this.notesItems.filter(it => !it.isDone).length === 0;
    };

    static from(it: any) {
        const newIt = new NotesList();
        newIt.uuid = it.uuid;
        newIt.title = it.title;
        newIt.notesItems = Array.isArray(it.notesItems) ? it.notesItems.map(it1 => NoteItem.from(it1)) : [];
        newIt.created = it.created ? new Date(it.created) : new Date();

        return newIt;
    }

    update(newProps: Partial<NotesList>) {
        return updateObject(this, newProps, this.swallowClone.bind(this));
    }

    swallowClone() {
        const newIt = new NotesList();
        newIt.uuid = this.uuid;
        newIt.title = this.title;
        newIt.notesItems = this.notesItems.map(i => i.clone());
        newIt.created = this.created;

        return newIt;
    }

    deepClone() {
        const newIt = new NotesList();
        newIt.uuid = this.uuid;
        newIt.title = this.title;
        newIt.notesItems = this.notesItems.map(i => i.clone());
        newIt.created = this.created;

        return newIt;
    }

    isEmpty() {
        return !this.title || (this.notesItems.length === 1 && !this.notesItems[0].description && !this.notesItems[0].isDone);
    }
}
