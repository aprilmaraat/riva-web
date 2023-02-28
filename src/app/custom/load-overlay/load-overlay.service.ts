import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadService {
    private subject = new Subject<boolean>();
    private subjectContent = new Subject<boolean>();
    
    onLoad(): Observable<boolean>{
        return this.subject.asObservable();
    }

    onContentLoad(): Observable<boolean>{
        return this.subjectContent.asObservable();
    }

    load(load: boolean){
        this.subject.next(load);
    }

    loadContent(load: boolean){
        this.subjectContent.next(load);
    }
}