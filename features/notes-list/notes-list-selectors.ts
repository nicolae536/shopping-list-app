import {NoteItem} from '../../domain/note-item';
import {NotesList} from '../../domain/notes-list';
import {stateContainer} from '../../domain/state-container';

export class ViewNoteItem {
    public get visibleItems() {
        return this._visibleItems || [];
    }

    private _visibleItems: NoteItem[];

    constructor(public noteItemRef: NotesList) {
        this._visibleItems = [
            ...noteItemRef.noteItems.filter(v => !v.isEmpty),
            ...noteItemRef.doneNoteItems.filter(v => !v.isEmpty)
        ].splice(0, 6);
    }
}

export const notesListSelectors = {
    notesListView$: () => stateContainer.select$((appState) => appState.notesItems!, noteItems => {
        return noteItems.map(noteItem => new ViewNoteItem(noteItem));
    })
};
