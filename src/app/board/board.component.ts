import { Component } from '@angular/core';
import { FirebaseService } from '../shared/firebase.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../shared/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DialogComponent } from "../dialog/dialog.component";

export interface UserItems {
  Email: string
  canVote: boolean
  display_name: string
  role: string
  uid: string
  voices: string[]
}
@Component({
  selector: 'app-board',
  standalone: true,
  imports: [MatChipsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatProgressSpinnerModule, DialogComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  isDialogOpen = false;

  selectedUser: UserItems | null = null;

  openDialog() {
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }

  userItems!: any;
  users!: any
  choices!: number;
  chipControl = new FormGroup({
    voices: new FormControl([], { validators: [Validators.required, this.validateChips.bind(this)], updateOn: 'change' }),
  });
  selectedChips: any[] = [];
  isLoading: boolean = true;
  sendChoisesBool: boolean = false;
  constructor(private firebaseService: FirebaseService, private authService: AuthService) {
    this.getUserItems();
    // this.getAllUsers();
    this.authService.getFromCollection('candidates').subscribe({
      next: users => {
        console.log(users);

        this.users = users;
      }
    })
  }

  async getUserItems() {
    const user = this.authService.getUser();
    if (user) {
      this.userItems = await this.firebaseService.getUserItems(user);
      console.log(this.userItems);

      this.choices = 4 - this.userItems.voices.length;
      this.chips.setValue(this.userItems.voices)
      this.isLoading = false;
    }
  }

  async getAllUsers() {
    const users = await this.authService.getFromCollection('candidates');
    console.log(users);

    this.users = users
  }

  get chips() {
    return this.chipControl.get('voices') as FormArray;
  }

  clickOnChip(user: any) {
    const chips = this.chips.value as string[];


    if (chips.includes(user)) {
      const index = chips.indexOf(user);
      if (index > -1) {
        chips.splice(index, 1);
        this.chips.setValue(chips);
        this.choices++;
      }
    } else if (this.choices !== 0) {
      chips.push(user);
      this.chips.setValue(chips);
      this.choices--;
    }
    console.log('chips ', chips.length);
    console.log('---- ', this.choices);
  }

  validateChips(control: FormControl): { [key: string]: boolean } | null {
    const chips = control.value as string[];
    return chips.length > this.choices ? { tooManyChips: true } : null;
  }

  sendChoices() {
    const voices = this.chipControl.value.voices as string[]
    const user = this.authService.getUser();
    if (user) {
      this.firebaseService.updateUserItems(user, voices);
    };
    this.sendChoisesBool = true;
  }

  getUsername(uid: string): string {
    for (const user of this.users) {
      if (user.uid === uid) {
        return user.display_name;
      }
    }
    return 'anonym';
  }
}
