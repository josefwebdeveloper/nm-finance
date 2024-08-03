import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Todo } from "../../models/todo";
import { Subject } from "rxjs";
import { TodoService } from "../../services/todo.service";
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from "rxjs/operators";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatCard, MatCardTitle } from "@angular/material/card";
import { DatePipe, NgClass } from "@angular/common";
import { MatList, MatListItem } from "@angular/material/list";
import { MatLine } from "@angular/material/core";
import { MatIcon } from "@angular/material/icon";
import { MatDivider } from "@angular/material/divider";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatCheckbox } from "@angular/material/checkbox";
import { TimerService } from "../../services/timer.service";

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    MatButton,
    MatCard,
    MatCardTitle,
    MatList,
    MatListItem,
    MatLine,
    MatIconButton,
    MatIcon,
    DatePipe,
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
  styleUrls: ['./todo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent implements OnInit, OnDestroy {
  todos: Todo[] = [];
  todayTodos: Todo[] = [];
  otherTodos: Todo[] = [];
  favoriteTodos: Todo[] = [];
  timeLeftMap: Map<Todo, string> = new Map();
  showFavorites: boolean = false;
  private destroy$ = new Subject<void>();
  private favoriteClicks$ = new Subject<Todo>();

  constructor(
    private todoService: TodoService,
    private cdr: ChangeDetectorRef,
    private timerService: TimerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to task updates
    this.todoService.getTodos().pipe(
      takeUntil(this.destroy$)
    ).subscribe(todos => {
      this.todos = todos;
      this.todayTodos = this.filterTodayTodos(todos);
      this.otherTodos = this.filterOtherTodos(todos);
      this.favoriteTodos = this.filterFavoriteTodos(todos);
      this.startTimer();
    });

    this.favoriteClicks$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(todo => this.todoService.toggleFavorite(todo));

    // Subscribe to route changes
    this.route.url.pipe(takeUntil(this.destroy$)).subscribe(url => {
      this.showFavorites = url.some(segment => segment.path === 'favorite');
      this.cdr.markForCheck();
    });
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

  filterFavoriteTodos(todos: Todo[]): Todo[] {
    return todos.filter(todo => todo.favorite);
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

  isTimeCritical(todo: Todo): boolean {
    const timeLeft = this.timeLeftMap.get(todo);
    if (!timeLeft) return false;
    const [hours, minutes, seconds] = timeLeft.split(/[hm\s]/).map(Number);
    return hours === 0 && (minutes < 60 || (minutes === 0 && seconds <= 0));
  }
}
