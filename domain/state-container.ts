import {AsyncStorage} from 'react-native';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, first, map, distinctUntilChanged, switchMap, takeUntil} from 'rxjs/operators';
import {AppState, IStateContainerSerialized} from './app-state';
import {NotesList} from './notes-list';

export class StateContainer {
    private static COLLECTIONS = {
        notesList: '@NotesList'
    };

    private appState: BehaviorSubject<AppState> = new BehaviorSubject(AppState.loadingEmpty());

    constructor() {
        this.deserializeNotesList();
    }

    public isReady$() {
        return this.appState.pipe(filter(c => c !== null), first());
    }

    public notesList$(onUnsubscribe?: Observable<any>) {
        const source = this.isReady$()
            .pipe(switchMap(() =>
                this.appState.pipe(map(n => n.notesList), distinctUntilChanged())
            ));
        return this.autoUnsubscribe(source, onUnsubscribe);
    }

    // @ts-ignore
    public findNotesList(uuid: string): NotesList {
        for (const it of this.appState.value.notesList) {
            if (it.uuid === uuid) {
                return it;
            }
        }
    }

    updateOrPushItem(activeItem: NotesList) {
        let {notesList} = this.appState.value;

        for (let idx = 0; idx < notesList.length; idx++) {
            if (notesList[idx].uuid === activeItem.uuid) {
                notesList[idx] = activeItem;
                this.appState.value.notesList = [...notesList];
                this.appState.next(this.appState.value);
                this.serializeToStorage();
                return;
            }
        }

        this.appState.value.notesList = [...notesList];
        this.appState.value.notesList.push(activeItem);
        this.serializeToStorage();
    }

    private async deserializeNotesList() {
        const keys = await AsyncStorage.getAllKeys();
        if (keys.indexOf(StateContainer.COLLECTIONS.notesList) === -1) {
            this.appState.next(AppState.empty());
            return;
        }

        try {
            const store = await AsyncStorage.getItem(StateContainer.COLLECTIONS.notesList);
            this.appState.next(AppState.fromJson(<string>store));
        } catch (e) {
            await AsyncStorage.clear();
            this.appState.next(AppState.empty());
        }
    }

    private autoUnsubscribe<T>(source: Observable<T>, _onUnsubscribe?: Observable<any>): Observable<T> {
        if (_onUnsubscribe) {
            return source.pipe(takeUntil(_onUnsubscribe));
        }

        return source;
    }

    private serializeToStorage() {
        const stateContainerSerialized: IStateContainerSerialized = {
            notesList: this.appState.value.notesList,
            language: 'en'
        };

        AsyncStorage.setItem(StateContainer.COLLECTIONS.notesList, JSON.stringify(stateContainerSerialized));
    }

    getTranslations() {
        return this.appState.value.translations;
    }
}

export const appState: StateContainer = new StateContainer();