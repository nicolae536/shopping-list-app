import {map} from 'rxjs/operators';
import {stateContainer} from '../../domain/state-container';

export const notesListDetailsSelectors = {
    activeItem$: () => stateContainer.isReady$().pipe(
        map(item => item.activeNotesList!)
    )
};