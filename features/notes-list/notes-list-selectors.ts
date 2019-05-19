import {map, distinctUntilChanged} from 'rxjs/operators';
import {stateContainer} from '../../domain/state-container';

export const notesListSelectors = {
    notesListView$: () => stateContainer.isReady$()
        .pipe(
            map((appState) => appState.notesItems!),
            distinctUntilChanged(),
            map(noteItems => {
                return noteItems.map(noteItem => {
                    const viewValue = noteItem.swallowClone();
                    viewValue.noteItems = [
                        ...viewValue.noteItems.filter(v => !v.isEmpty()),
                        ...viewValue.doneNoteItems.filter(v => !v.isEmpty())
                    ].splice(0, 6);
                    return viewValue;
                });
            })
        )
};
