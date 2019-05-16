import {guid} from './guid-generator';
import {NoteItem} from './note-item';

export class NotesList {
  title: string = '';
  uuid: string = guid();
  created: Date = new Date();
  items: NoteItem[] = [new NoteItem()];

  constructor() {
  }

  get isDone(): boolean {
    return this.items.filter(it => !it.isDone).length === 0;
  };

  static from(it: any) {
    const newIt = new NotesList();
    newIt.uuid = it.uuid;
    newIt.title = it.title;
    newIt.items = Array.isArray(it.notesList) ? it.notesList.map(it1 => NoteItem.from(it1)) : [];
    newIt.created = it.created ? new Date(it.created) : new Date();

    return newIt;
  }

  clone() {
    const newIt = new NotesList();
    newIt.uuid = this.uuid;
    newIt.title = this.title;
    newIt.items = this.items;
    newIt.created = this.created;

    return newIt;
  }
}
