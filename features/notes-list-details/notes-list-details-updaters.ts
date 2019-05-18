import {NoteItem} from '../../domain/note-item';
import {NotesList} from '../../domain/notes-list';
import {stateContainer} from '../../domain/state-container';

export const notesListDetailsUpdate = {
    activateOrCreateItem: (uuid: string) => stateContainer.pureStateUpdate(appState => {
        return appState.update({
            activeNotesList: appState.notesItems.find(n => n.uuid === uuid) || new NotesList()
        });
    }),
    updateTitle: (newTitle) => stateContainer.pureStateUpdate(appState => {
        console.log('title-update');
        appState.activeNotesList!.title = newTitle;
        return appState;
    }),
    updateNoteItemDescription: (description: string) => stateContainer.pureStateUpdate(appState => {
        if (description.length > 1) {
            const lastItemIndex = appState.activeNotesList!.notesItems.length - 1;

            if (!appState.activeNotesList!.notesItems[lastItemIndex].isEmpty()) {
                appState.activeNotesList!.notesItems.push(new NoteItem());
                // appState.activeNotesList!.notesItems = appState.activeNotesList!.notesItems.sort(NoteItem.noteItemsCompare);
            }
        }

        appState.activeNoteItem!.description = description;
        return appState;
    }),
    updateNoteItemIsDone: (it: NoteItem, isDone: boolean) => stateContainer.pureStateUpdate(appState => {
        it!.isDone = isDone;
        appState.activeNotesList!.notesItems = appState.activeNotesList!.notesItems.sort(NoteItem.noteItemsCompare);
        return appState;
    }),
    cleanState: () => stateContainer.pureStateUpdate(appState => {
        let wasUpdated = false;
        appState.notesItems.forEach((v, index) => {
            if (v.uuid === appState.activeNotesList!.uuid) {
                appState.notesItems[index] = appState.activeNotesList!;
                wasUpdated = true;
            }
        });

        if (!wasUpdated && !appState.activeNotesList!.isEmpty()) {
            appState.notesItems.push(appState.activeNotesList!);
            wasUpdated = true;
        }

        console.log('was-pushed', wasUpdated);

        return appState.update({
            activeNoteItem: null,
            activeNotesList: null
        });
    }),
    setActiveNodeItem: (it: NoteItem) => stateContainer.pureStateUpdate(appState => {
        const lastItemIndex = appState.activeNotesList!.notesItems.length - 1;

        if (!appState.activeNotesList!.notesItems[lastItemIndex].isEmpty() && !it.isEmpty()) {
            appState.activeNotesList!.notesItems.push(new NoteItem());
            // appState.activeNotesList!.notesItems = appState.activeNotesList!.notesItems.sort(NoteItem.noteItemsCompare);
        }

        return appState.update({
            activeNoteItem: it
        });
    })
};