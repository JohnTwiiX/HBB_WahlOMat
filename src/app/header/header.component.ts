import { Component } from '@angular/core';
import { FirebaseService } from '../shared/firebase.service';
import { UserItems } from '../board/board.component';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  userItems!: UserItems | null
  constructor(private firebaseService: FirebaseService, private router: Router) {
    this.firebaseService.userItems$.subscribe({
      next: value => {
        this.userItems = value;
      },
      error: e => {
        console.error(e);
      }
    })
  }

  adminPage() {
    this.router.navigate(['/admin']);
  }

  boardPage() {
    this.router.navigate(['/board']);
  }
}
