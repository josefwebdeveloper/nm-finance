import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Todo} from "../../models/todo";
import {debounceTime, Subject} from "rxjs";
import {TodoService} from "../../services/todo.service";
import {takeUntil} from "rxjs/operators";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardTitle} from "@angular/material/card";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {MatList, MatListItem} from "@angular/material/list";
import {MatLine} from "@angular/material/core";
import {MatIcon} from "@angular/material/icon";
import {MatDivider} from "@angular/material/divider";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatCheckbox} from "@angular/material/checkbox";
import {TimerService} from "../../services/timer.service";

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    MatButton,
    MatCard,
    NgIf,
    MatCardTitle,
    MatList,
    MatListItem,
    MatLine,
    MatIconButton,
    MatIcon,
    DatePipe,
    NgForOf,
    MatDivider,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatCheckbox,
    MatCellDef,
    MatHeaderCellDef,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderRowDef,
    NgClass
  ],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent implements OnInit, OnDestroy{
  todos: Todo[] = [];
  todayTodos: Todo[] = [];
  otherTodos: Todo[] = [];
  timeLeftMap: Map<Todo, string> = new Map();
  showFavorites: boolean = false;
  private destroy$ = new Subject<void>();
  private favoriteClicks$ = new Subject<Todo>();

  constructor(
    private todoService: TodoService,
    private cdr: ChangeDetectorRef,
    private timerService: TimerService) {}

  ngOnInit(): void {
    this.todoService.getTodos().pipe(
      takeUntil(this.destroy$)
    ).subscribe(todos => {
      this.todos = todos;
      this.todayTodos = this.filterTodayTodos(todos);
      this.otherTodos = this.filterOtherTodos(todos);
      this.startTimer();
    });

    this.favoriteClicks$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(todo => this.todoService.toggleFavorite(todo));
  }

  startTimer() {
    this.timerService.getTimeLeftObservable(this.todos).pipe(
      takeUntil(this.destroy$)
    ).subscribe(updatedTimes => {
      updatedTimes.forEach(({ todo, timeLeft }) => {
        this.timeLeftMap.set(todo, timeLeft);
      });
      this.cdr.markForCheck();
    });
  }

  filterTodayTodos(todos: Todo[]): Todo[] {
    const currentDate = new Date().toDateString();
    return todos.filter(todo => new Date(todo.expirationDate).toDateString() === currentDate);
  }

  filterOtherTodos(todos: Todo[]): Todo[] {
    const currentDate = new Date().toDateString();
    return todos.filter(todo => new Date(todo.expirationDate).toDateString() !== currentDate);
  }

  toggleFavorite(todo: Todo) {
    this.favoriteClicks$.next(todo);
  }

  removeTodo(todo: Todo) {
    this.todoService.removeTodo(todo);
  }

  toggleView() {
    this.showFavorites = !this.showFavorites;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
