import {Translations, TranslationsType} from './translations';
import {NotesList} from './notes-list';


export interface IStateContainerSerialized {
    notesList: Partial<NotesList>[];
    language: string;
}

export class AppState {
    loading: boolean = false;
    error: boolean = false;
    errorDetails: any = null;
    translations: TranslationsType = Translations.en;
    notesList: NotesList[] = [];

    static fromJson(storeData: string): AppState {
        const appState = new AppState();
        const storeDataAppState: IStateContainerSerialized = JSON.parse(storeData);
        appState.notesList = Array.isArray(storeDataAppState.notesList) ? storeDataAppState.notesList.map(it => NotesList.from(it)) : [];
        appState.translations = storeDataAppState.language && Translations[storeDataAppState.language] ? Translations[storeDataAppState.language] : Translations.en;
        appState.error = false;
        appState.loading = false;
        return appState;
    }

    static empty() {
        return new AppState()
    }

    static loadingEmpty(): AppState {
        const appState = new AppState();
        appState.loading = true;
        return appState;
    }

    static error(errorDetails?: any): AppState {
        const appState = new AppState();
        appState.error = true;
        appState.errorDetails = errorDetails;
        console.log(errorDetails);
        return appState;
    }
}