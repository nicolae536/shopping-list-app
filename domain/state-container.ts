import {AsyncStorage} from 'react-native';
import {BehaviorSubject, Observable, from, of} from 'rxjs';
import {filter, first, map, distinctUntilChanged, switchMap, takeUntil, catchError} from 'rxjs/operators';
import {loggerInstance} from '../components/logger';
import {AppStateModel, IStateContainerSerialized} from './app-state-model';
import {NotesList} from './notes-list';

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

    public isReadyFirst$() {
        return this.isReady$().pipe(filter(c => c !== null), first());
    }

    public notesList$(onUnsubscribe?: Observable<any>) {
        const source = this.isReady$()
            .pipe(switchMap(() =>
                this.appState.pipe(map(n => n.notesItems), distinctUntilChanged())
            ));
        return this.autoUnsubscribe(source, onUnsubscribe);
    }

    // @ts-ignore
    public findNotesList(uuid: string): NotesList {
        for (const it of this.appState.value.notesItems) {
            if (it.uuid === uuid) {
                return it;
            }
        }
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

    private autoUnsubscribe<T>(source: Observable<T>, _onUnsubscribe?: Observable<any>): Observable<T> {
        if (_onUnsubscribe) {
            return source.pipe(takeUntil(_onUnsubscribe));
        }

        return source;
    }

    private serializeToStorage(appState: AppStateModel) {
        if (appState.error) {
            return;
        }

        const stateContainerSerialized: IStateContainerSerialized = {
            notesList: appState.notesItems.filter(n => !n.isEmpty()).map(it => it.toSerialized()),
            language: 'en'
        };

        loggerInstance.log('serialized', stateContainerSerialized);
        AsyncStorage.setItem(StateContainer.COLLECTIONS.notesList, JSON.stringify(stateContainerSerialized));
    }
}

export const stateContainer: StateContainer = new StateContainer();
