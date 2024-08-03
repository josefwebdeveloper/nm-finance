import {Component, Input} from '@angular/core';
import {interval, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent {
  @Input() expirationDate: string = '';
  @Input() expirationTime?: string;
  timeLeft: string = 'Calculating...';
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.startTimer();
  }

  startTimer() {
    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.timeLeft = this.calculateTimeLeft(this.expirationDate, this.expirationTime);
    });
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
