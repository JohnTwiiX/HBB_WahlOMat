import { Component } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { RouterLink } from '@angular/router';
import { FormControl, Validators, FormsModule, ReactiveFormsModule, FormGroup, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss', '../login/login.component.scss']
})
export class RegisterComponent {
  formControl = new FormGroup({
    first_name: new FormControl('', { validators: [Validators.required, this.onlyCharsValidator()], updateOn: 'change' }),
    last_name: new FormControl('', { validators: [Validators.required, this.onlyCharsValidator()], updateOn: 'change' }),
    email: new FormControl('', { validators: [Validators.required, Validators.email], updateOn: 'change' }),
    password: new FormControl('', { validators: [Validators.required, Validators.minLength(6)], updateOn: 'change' }),
    confirmPassword: new FormControl('', { validators: [Validators.required], updateOn: 'change' })
  }, { validators: this.passwordMatchValidator });

  isError = false;

  constructor(private authService: AuthService) { }

  get email() {
    return this.formControl.get('email');
  }

  get password() {
    return this.formControl.get('password');
  }

  get confirmPassword() {
    return this.formControl.get('confirmPassword');
  }

  get first_name() {
    return this.formControl.get('first_name')
  }

  get last_name() {
    return this.formControl.get('last_name')
  }

  register() {
    if (this.formControl.valid) {
      const displayname = `${this.formControl.value.first_name?.trim()} ${this.formControl.value.last_name?.trim()}`
      this.authService.registerWithEmail(this.formControl.value.email as string, this.formControl.value.password as string, displayname).catch(() => {
        this.isError = true;
      });
    } else {
      console.log('Form is not valid');
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordsNotMatching: true };
  }

  onlyCharsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valid = /^[a-zA-Z]+$/.test(control.value);
      return valid ? null : { onlyChars: true };
    };
  }
}
