import {NotesList} from '../../domain/notes-list';
import {stateContainer} from '../../domain/state-container';
import {ViewNoteItem} from './notes-list-selectors';

export const notesListUpdaters = {
    removeItem: (it: NotesList) => stateContainer.pureStateUpdate(appstate => {
        return appstate.update({
            notesItems: appstate.notesItems.filter(v => v.uuid !== it.uuid)
        });
    }),
    updateItemsOrder: (items: ViewNoteItem[]) => stateContainer.pureStateUpdate(appstate => {
        return appstate.update({
            notesItems: items.map(it => it.noteItemRef)
        });
    })
};