import { Component } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { RouterLink } from '@angular/router';
import { FormControl, Validators, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isError = false;
  formControl = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  constructor(public authService: AuthService) { }

  get email() {
    return this.formControl.get('email');
  }

  get password() {
    return this.formControl.get('password');
  }

  loginWithEmail() {
    this.isError = false;
    this.authService.loginWithEmail(this.formControl.value.email as string, this.formControl.value.password as string).catch(() => {
      this.isError = true;
    });
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  loginAnonymously() {
    this.authService.loginAnonymously();
  }

}
