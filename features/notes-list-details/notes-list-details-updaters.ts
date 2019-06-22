import {LayoutAnimation} from 'react-native';
import {AppStateModel} from '../../domain/app-state-model';
import {NoteItem} from '../../domain/note-item';
import {NotesList} from '../../domain/notes-list';
import {stateContainer} from '../../domain/state-container';

function getNotesListWithUpdatedActiveItem(appState: AppStateModel): NotesList[] {
    let wasUpdated = false;
    let newNotesItems = appState.notesItems.map((noteItem) => {
        if (noteItem.uuid !== appState.activeNotesList!.uuid) {
            return noteItem;
        }

        wasUpdated = true;
        return appState.activeNotesList!.swallowClone();
    });

    if (!wasUpdated && !appState.activeNotesList!.isEmpty()) {
        newNotesItems = [appState.activeNotesList!, ...newNotesItems];
        wasUpdated = true;
    }

    return newNotesItems;
}

function splitDoneAndNoteDoneItems(noteItems: NoteItem[], doneItemsRef: NoteItem[], notDoneItemsRef: NoteItem[]): void {
    noteItems.forEach(ite => {
        if (ite.isDone) {
            doneItemsRef.push(ite);
        } else {
            notDoneItemsRef.push(ite);
        }
    });
}

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
    updateDoneNoteItemDescription: (itemIndex: number, description: string) => stateContainer.pureStateUpdate(appState => {
        const {doneNoteItems} = appState.activeNotesList!;
        doneNoteItems[itemIndex] = doneNoteItems[itemIndex].update({
            description
        });

        return appState.update({
            activeNotesList: appState.activeNotesList!.update({
                doneNoteItems: [...doneNoteItems]
            })
        });
    }),
    updateNotDoneNoteItemDescription: (itemIndex: number, description: string) => stateContainer.pureStateUpdate(appState => {
        const {noteItems} = appState.activeNotesList!;
        noteItems[itemIndex] = noteItems[itemIndex].update({
            description
        });

        const isLastItemEditedAndNotEmpty = description.length > 1 && itemIndex + 1 === appState.activeNotesList!.noteItems.length;
        if (isLastItemEditedAndNotEmpty) {
            noteItems.push(new NoteItem());
        }

        return appState.update({
            activeNotesList: appState.activeNotesList!.update({
                noteItems: [...noteItems]
            })
        });
    }),
    updateNoteItemIsDone: (it: NoteItem, isDone: boolean) => stateContainer.pureStateUpdate(appState => {
        if (!it.description) {
            return appState;
        }

        it!.isDone = isDone;
        const notDoneNoteItems: NoteItem[] = [];
        const doneNoteItems: NoteItem[] = [];
        splitDoneAndNoteDoneItems(appState.activeNotesList!.noteItems, doneNoteItems, notDoneNoteItems);
        splitDoneAndNoteDoneItems(appState.activeNotesList!.doneNoteItems, doneNoteItems, notDoneNoteItems);
        notDoneNoteItems.sort(NoteItem.noteItemsCompare);

        return appState.update({
            activeNotesList: appState.activeNotesList!.update({
                noteItems: notDoneNoteItems,
                doneNoteItems: doneNoteItems
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
        return appState.update({
            activeNoteItem: null,
            activeNotesList: null,
            notesItems: getNotesListWithUpdatedActiveItem(appState)
        });
    }),
    markNoteItemAsActive: (it: NoteItem) => stateContainer.pureStateUpdate(appState => {
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
    }),
    updateDoneNotesListOrder: (data: NoteItem[]) => stateContainer.pureStateUpdate(appState => {
        return appState.update({
            activeNotesList: appState.activeNotesList!.update({
                doneNoteItems: data
            })
        });
    })
};
