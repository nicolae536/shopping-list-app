import {loggerInstance} from '../../components/logger';
import {NoteItem} from '../../domain/note-item';
import {NotesList} from '../../domain/notes-list';
import {stateContainer} from '../../domain/state-container';

export const notesListDetailsUpdate = {
    activateOrCreateItem: (uuid: string) => stateContainer.pureStateUpdate(appState => {
        const itemToActivate = appState.notesItems.find(n => n.uuid === uuid);
        return appState.update({
            activeNotesList: itemToActivate ? itemToActivate.swallowClone() : new NotesList()
        });
    }),
    updateTitle: (newTitle) => stateContainer.pureStateUpdate(appState => {
        return appState.update({
            activeNotesList: appState.activeNotesList!.update({
                title: newTitle
            })
        });
    }),
    updateNoteItemDescription: (itemIndex: number, description: string) => stateContainer.pureStateUpdate(appState => {
        const updatedNoteItem = appState.activeNoteItem!.update({
            description
        });

        const isLastItemNotEmpty = description.length > 1 && itemIndex + 1 === appState.activeNotesList!.noteItems.length;
        const newNoteItems = appState.activeNotesList!.noteItems.map(it => {
            return it.uuid === updatedNoteItem.uuid
                ? updatedNoteItem
                : it.clone();
        });
        if (isLastItemNotEmpty) {
            newNoteItems.push(new NoteItem());
        }

        return appState.update({
            activeNotesList: appState.activeNotesList!.update({
                noteItems: newNoteItems
            }),
            activeNoteItem: updatedNoteItem
        });
    }),
    updateNoteItemIsDone: (it: NoteItem, isDone: boolean) => stateContainer.pureStateUpdate(appState => {
        if (!it.description) {
            return appState;
        }

        it!.isDone = isDone;
        const newNoteItems: NoteItem[] = [];
        const newDoneNoteItems: NoteItem[] = [];
        appState.activeNotesList!.noteItems.forEach(ite => {
            if (ite.isDone) {
                newDoneNoteItems.push(ite);
            } else {
                newNoteItems.push(ite);
            }
        });
        appState.activeNotesList!.doneNoteItems.forEach(ite => {
            if (ite.isDone) {
                newDoneNoteItems.push(ite);
            } else {
                newNoteItems.push(ite);
            }
        });
        newNoteItems.sort(NoteItem.noteItemsCompare);
        return appState.update({
            activeNotesList: appState.activeNotesList!.update({
                noteItems: newNoteItems,
                doneNoteItems: newDoneNoteItems
            })
        });
    }),
    removeItem: (it: NoteItem) => stateContainer.pureStateUpdate(appState => {
        let {doneNoteItems, noteItems} = appState.activeNotesList!;
        if (it.isDone) {
            doneNoteItems = doneNoteItems.filter(v => v.uuid !== it.uuid);
        } else {
            noteItems = noteItems.filter(v => v.uuid !== it.uuid);
        }
        return appState.update({
            activeNotesList: appState.activeNotesList!.update({
                doneNoteItems: doneNoteItems,
                noteItems: noteItems
            })
        });
    }),
    cleanState: () => stateContainer.pureStateUpdate(appState => {
        let wasUpdated = false;

        const newNotesItems = appState.notesItems.map((v, index) => {
            if (v.uuid === appState.activeNotesList!.uuid) {
                appState.notesItems[index] = appState.activeNotesList!;
                wasUpdated = true;
                return appState.activeNotesList!.swallowClone();
            }

            return v;
        });

        if (!wasUpdated && !appState.activeNotesList!.isEmpty()) {
            newNotesItems.push(appState.activeNotesList!);
            wasUpdated = true;
        }

        loggerInstance.log('features.NotesListDetailsUpdaters', wasUpdated);

        return appState.update({
            activeNoteItem: null,
            activeNotesList: null,
            notesItems: newNotesItems
        });
    }),
    setActiveNodeItem: (it: NoteItem) => stateContainer.pureStateUpdate(appState => {
        const lastItemIndex = appState.activeNotesList!.noteItems.length - 1;

        if (!appState.activeNotesList!.noteItems[lastItemIndex].isEmpty && !it.isEmpty) {
            appState.activeNotesList!.noteItems.push(new NoteItem());
        }

        return appState.update({
            activeNoteItem: it
        });
    }),
    updateNotesListOrder: (data: NoteItem[]) => stateContainer.pureStateUpdate(appState => {
        return appState.update({
            activeNotesList: appState.activeNotesList!.update({
                noteItems: data
            })
        });
    })
};