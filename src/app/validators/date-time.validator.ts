import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const expirationDate = control.get('expirationDate')?.value;
    const expirationTime = control.get('expirationTime')?.value;
    const currentDateTime = new Date();

    if (!expirationDate) {
      return { futureDate: 'Expiration date is required' };
    }

    const expirationDateTime = new Date(expirationDate);

    if (expirationTime) {
      const [hours, minutes] = expirationTime.split(':');
      expirationDateTime.setHours(+hours);
      expirationDateTime.setMinutes(+minutes);
    } else {
      expirationDateTime.setHours(23, 59, 59);
    }

    return expirationDateTime.getTime() >= currentDateTime.getTime()
      ? null
      : { futureDate: 'Expiration date/time cannot be in the past' };
  };
}
