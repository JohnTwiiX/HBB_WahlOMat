import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-is-verified',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  templateUrl: './is-verified.component.html',
  styleUrl: './is-verified.component.scss'
})
export class IsVerifiedComponent implements OnInit, OnDestroy {
  private intervalId: any;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.checkEmailVerificationAndAssignRole();
    this.intervalId = setInterval(() => {
      this.authService.checkEmailVerificationAndAssignRole();
    }, 5000);
  }

  sendVerification() {
    this.authService.sendVerification();
  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed to avoid memory leaks
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
