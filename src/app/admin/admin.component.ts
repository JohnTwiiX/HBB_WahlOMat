import { Component } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { FirebaseService } from '../shared/firebase.service';
import { UserItems } from '../board/board.component';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { DialogComponent } from "../dialog/dialog.component";

interface VoiceCount {
  voice: string;
  count: number;
}
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MatButtonModule, MatDividerModule, MatProgressBarModule, MatChipsModule, MatIconModule, DialogComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  userItems!: UserItems | null;
  isAdmin: boolean = false;
  pages: 'dashboard' | 'result' | 'addAdmin' = 'dashboard';
  allUsers: any = null;
  result: any = null;

  isDialogOpen = false;

  selectedUser: UserItems | null = null;

  openDialog() {
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
    this.selectedUser = null;
  }

  constructor(private authService: AuthService, private firebaseService: FirebaseService, private router: Router) {
    this.firebaseService.userItems$.subscribe({
      next: value => {
        this.userItems = value;
      },
      error: e => {
        console.error(e);
      }
    })
    this.checkIfAdmin()
  }

  async checkIfAdmin() {
    if (this.userItems && this.userItems.role === 'admin') {
      this.isAdmin = true;
      this.getAllUsers();
    } else {
      const user = this.authService.getUser();
      if (user) {
        const userItems = await this.firebaseService.getUserItems(user)
        if (userItems.role === 'admin') {
          this.isAdmin = true;
          this.getAllUsers();
        }
      }
    }
    if (!this.isAdmin) {
      this.router.navigate(['/board']);
    }
  }

  async clickOnResult() {
    // await this.getAllUsers();
    this.result = this.countVoices();
    this.switchPage('result');
    console.log(this.result.voiceCounts);

  }

  async clickOnAddAdmin() {
    this.switchPage('addAdmin');
    // await this.getAllUsers();
  }

  switchPage(page: 'dashboard' | 'result' | 'addAdmin') {
    this.pages = page;
  }

  async getAllUsers() {
    this.authService.getFromCollection('users').subscribe({
      next: users => {
        this.allUsers = users
      }
    });
  }

  countVoices() {
    let totalCount = 0;
    const voiceMap: { [voice: string]: number } = {};
    const voiceCounts: VoiceCount[] = [];

    this.allUsers.forEach((user: UserItems) => {
      totalCount += user.voices.length;

      user.voices.forEach(voice => {
        if (voiceMap[voice]) {
          voiceMap[voice]++;
        } else {
          voiceMap[voice] = 1;
        }
      });
    });

    for (const voice in voiceMap) {
      if (voiceMap.hasOwnProperty(voice)) {
        voiceCounts.push({ voice, count: voiceMap[voice] });
      }
    }

    // Sortiere die voiceCounts-Liste
    voiceCounts.sort((a, b) => b.count - a.count);

    return {
      totalCount,
      voiceCounts
    };
  }

  getUsername(uid: string): string {
    for (const user of this.allUsers) {
      if (user.uid === uid) {
        return user.display_name;
      }
    }
    return 'anonym';
  }

  clickOnChip(user: UserItems) {
    this.selectedUser = user
    this.openDialog();
  }

  async setUserRole(role: string) {
    if (this.selectedUser) {
      await this.firebaseService.setUserRole(this.selectedUser, role);
      // await this.getAllUsers();
      this.closeDialog();
    }
  }
}
