import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { map, delay, takeUntil } from 'rxjs/operators';
import { StorageMap } from '@ngx-pwa/local-storage';
import {Todo} from "../models/todo";

@Injectable({
  providedIn: 'root'
})
export class TodoService implements OnDestroy {
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  private readonly delayTime = 300;
  private unsubscribe$ = new Subject<void>();

  constructor(private localStorage: StorageMap) {
    this.loadTodos();
  }

  private loadTodos() {
    this.localStorage.get('todos').pipe(
      map(todos => Array.isArray(todos) ? todos : []),
      delay(this.delayTime),
      takeUntil(this.unsubscribe$)
    ).subscribe(todos => this.todosSubject.next(todos));
  }

  getTodos(): Observable<Todo[]> {
    return this.todosSubject.asObservable();
  }

  addTodo(todo: Todo) {
    const currentTodos = this.todosSubject.getValue();
    const updatedTodos = [...currentTodos, todo];
    this.todosSubject.next(updatedTodos);

    this.localStorage.set('todos', updatedTodos).pipe(
      delay(this.delayTime),
      takeUntil(this.unsubscribe$)
    ).subscribe(); // Managing side effects
  }

  toggleFavorite(todo: Todo) {
    const updatedTodos = this.todosSubject.getValue().map(t =>
      t === todo ? { ...t, favorite: !t.favorite } : t
    );
    this.todosSubject.next(updatedTodos);

    this.localStorage.set('todos', updatedTodos).pipe(
      delay(this.delayTime),
      takeUntil(this.unsubscribe$)
    ).subscribe();
  }

  removeTodo(todo: Todo) {
    const updatedTodos = this.todosSubject.getValue().filter(t => t !== todo);
    this.todosSubject.next(updatedTodos);

    this.localStorage.set('todos', updatedTodos).pipe(
      delay(this.delayTime),
      takeUntil(this.unsubscribe$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
