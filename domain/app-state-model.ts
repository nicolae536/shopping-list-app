import {loggerInstance} from '../components/logger';
import {NoteItem} from './note-item';
import {NotesList, SerializedNotesList} from './notes-list';
import {Translations, TranslationsType} from './translations';
import {updateObject} from './updateObject';


export interface IStateContainerSerialized {
    notesList: SerializedNotesList[];
    language: string;
}

export class AppStateModel {
    loading: boolean = false;
    error: boolean = false;
    errorDetails: any = null;
    translations: TranslationsType = Translations.en;
    notesItems: NotesList[] = [];
    activeNotesList: NotesList | null = null;
    activeNoteItem: NoteItem | null = null;

    static fromJson(storeData: string): AppStateModel {
        const appState = new AppStateModel();
        const storeDataAppState: IStateContainerSerialized = JSON.parse(storeData);
        appState.notesItems = Array.isArray(storeDataAppState.notesList) ? storeDataAppState.notesList.map(it => NotesList.from(it)) : [];
        appState.translations = storeDataAppState.language && Translations[storeDataAppState.language]
            ? Translations[storeDataAppState.language] : Translations.en;
        appState.error = false;
        appState.loading = false;
        return appState;
    }

    static empty() {
        return new AppStateModel();
    }

    static loadingEmpty(): AppStateModel {
        const appState = new AppStateModel();
        appState.loading = true;
        return appState;
    }

    static error(errorDetails?: any): AppStateModel {
        const appState = new AppStateModel();
        appState.error = true;
        appState.errorDetails = errorDetails;
        loggerInstance.error('domain.AppStateModel', errorDetails);
        return appState;
    }

    update(newProps: Partial<AppStateModel>) {
        return updateObject(this, newProps, this.swallowClone.bind(this));
    }

    swallowClone() {
        const newIt = new AppStateModel();
        newIt.loading = this.loading;
        newIt.error = this.error;
        newIt.errorDetails = this.errorDetails;
        newIt.translations = this.translations;
        newIt.notesItems = this.notesItems;
        newIt.activeNotesList = this.activeNotesList;
        newIt.activeNoteItem = this.activeNoteItem;

        return newIt;
    }
}