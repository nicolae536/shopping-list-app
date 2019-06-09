import {AsyncStorage} from 'react-native';
import {BehaviorSubject, Observable, from, of} from 'rxjs';
import {filter, first, switchMap, catchError, map, distinctUntilChanged} from 'rxjs/operators';
import {loggerInstance} from '../components/logger';
import {AppStateModel, IStateContainerSerialized} from './app-state-model';
import {SerializedNotesList} from './notes-list';

function convertToObservable(newState) {
    if (newState instanceof Observable) {
        return newState;
    }
    if (newState instanceof Promise) {
        return from(newState);
    }

    return of(newState);
}

export class StateContainer {
    private static COLLECTIONS = {
        notesList: '@NotesList'
    };

    private appState: BehaviorSubject<AppStateModel> = new BehaviorSubject(AppStateModel.loadingEmpty());

    constructor() {
        this.deserializeNotesList();
    }

    public isReady$() {
        return this.appState.pipe(filter(c => c !== null));
    }

    public select$<T, U>(selector: (selectFn: AppStateModel) => T, mapFn?: (map: T) => U) {
        return this.isReady$()
            .pipe(
                map(appState => selector(appState)),
                distinctUntilChanged(),
                map(value => {
                    if (mapFn instanceof Function) {
                        return mapFn(value) as U;
                    }

                    return value as T;
                })
            );
    }

    public isReadyFirst$() {
        return this.isReady$().pipe(filter(c => c !== null), first());
    }

    public pureStateUpdate(pureUpdater: (currentState: AppStateModel) => AppStateModel | Observable<AppStateModel> | Promise<any>) {
        this.isReadyFirst$()
            .pipe(
                first(),
                filter(appState => {
                    if (appState.error) {
                        console.error('Tried to update state when state entered in error');
                        return false;
                    }

                    return true;
                }),
                switchMap(currentState => convertToObservable(pureUpdater(currentState))),
                catchError(e => {
                    return of(AppStateModel.error(e));
                })
            ).subscribe((newAppState) => {
            loggerInstance.log('domain.StateContainer', newAppState);
            this.serializeToStorage(newAppState);
            this.appState.next(newAppState);
        });
    }

    getTranslations() {
        return this.appState.value.translations;
    }

    private async deserializeNotesList() {
        const keys = await AsyncStorage.getAllKeys();
        if (keys.indexOf(StateContainer.COLLECTIONS.notesList) === -1) {
            this.appState.next(AppStateModel.empty());
            return;
        }

        try {
            const store = await AsyncStorage.getItem(StateContainer.COLLECTIONS.notesList);
            this.appState.next(AppStateModel.fromJson(<string>store));
        } catch (e) {
            await AsyncStorage.clear();
            this.appState.next(AppStateModel.empty());
        }
    }

    private serializeToStorage(appState: AppStateModel) {
        if (appState.error) {
            return;
        }

        let notesListToSerialize: SerializedNotesList[] = [];
        let isInList = false;
        appState.notesItems.forEach(n => {
            if (n.isEmpty()) {
                return;
            }

            let updateNotesItem = n.toSerialized();
            if (appState.activeNotesList && n.uuid === appState.activeNotesList.uuid) {
                isInList = true;
                updateNotesItem = appState.activeNotesList.toSerialized();
            }

            notesListToSerialize.push(updateNotesItem);
        });

        if (!isInList) {
            notesListToSerialize = [appState.activeNotesList.toSerialized(), ...notesListToSerialize];
        }

        const stateContainerSerialized: IStateContainerSerialized = {
            notesList: notesListToSerialize,
            language: 'en'
        };

        loggerInstance.log('serialized', stateContainerSerialized);
        AsyncStorage.setItem(StateContainer.COLLECTIONS.notesList, JSON.stringify(stateContainerSerialized));
    }
}

export const stateContainer: StateContainer = new StateContainer();
