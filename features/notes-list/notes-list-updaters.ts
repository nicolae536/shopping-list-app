import {NotesList} from '../../domain/notes-list';
import {stateContainer} from '../../domain/state-container';

export const notesListUpdaters = {
    removeItem: (it: NotesList) => stateContainer.pureStateUpdate(appstate => {
        return appstate.update({
            notesItems: appstate.notesItems.filter(v => v.uuid !== it.uuid)
        });
    })
};