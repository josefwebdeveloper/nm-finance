import { Injectable, OnDestroy } from '@angular/core';
import { interval, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import {Todo} from "../models/todo";

@Injectable({
  providedIn: 'root'
})
export class TimerService implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor() {}


  getTimeLeftObservable(todos: Todo[]): Observable<{ todo: Todo, timeLeft: string }[]> {
    return interval(1000).pipe(
      takeUntil(this.destroy$),
      map(() => todos.map(todo => ({
        todo,
        timeLeft: this.calculateTimeLeft(todo.expirationDate, todo.expirationTime)
      })))
    );
  }

  private calculateTimeLeft(expirationDate: string, expirationTime?: string): string {
    const expirationDateTime = new Date(expirationDate);

    if (expirationTime) {
      const [hours, minutes] = expirationTime.split(':');
      expirationDateTime.setHours(+hours);
      expirationDateTime.setMinutes(+minutes);
    }

    const now = new Date();
    const timeDiff = expirationDateTime.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
