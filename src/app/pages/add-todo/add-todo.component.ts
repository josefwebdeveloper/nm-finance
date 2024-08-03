import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {Subject, switchMap} from "rxjs";
import {map} from "rxjs/operators";
import {MatError, MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";

import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import {NgxMaterialTimepickerModule} from "ngx-material-timepicker";
import {MatButton} from "@angular/material/button";
import {Todo} from "../../models/todo";
import {MatNativeDateModule} from "@angular/material/core";
import {TodoService} from "../../services/todo.service";
import {futureDateValidator} from "../../validators/date-time.validator";
import {MatCard} from "@angular/material/card";

@Component({
  selector: 'app-add-todo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatDatepickerModule,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    NgxMaterialTimepickerModule,
    MatError,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatButton,
    MatCard
],
  templateUrl: './add-todo.component.html',
  styleUrl: './add-todo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTodoComponent {
  todoForm: FormGroup;
  minDate: Date;

  constructor(private fb: FormBuilder, protected router: Router, private todoService: TodoService) {
    this.minDate = new Date();
    this.todoForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      expirationDate: ['', Validators.required],
      expirationTime: [''],
    }, {validators: futureDateValidator()});
  }

  onSubmit() {
    if (this.todoForm.valid) {
      const todo: Todo = {
        title: this.todoForm.value.title,
        expirationDate: this.todoForm.value.expirationDate,
        expirationTime: this.todoForm.value.expirationTime,
        createdAt: new Date(),
        favorite: false,
      };

      this.todoService.addTodo(todo);
      this.router.navigate(['/list']);
    }
  }
}
