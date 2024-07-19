import { Injectable } from '@angular/core';
import {
  Auth, authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  User,
  sendEmailVerification,
  updateProfile
} from '@angular/fire/auth';
import { CollectionReference, Firestore, collection, collectionData, doc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';
import { UserItems } from '../board/board.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;
  private usersCollection: CollectionReference<any>;
  private candidatesCollection: CollectionReference<any>;

  private timeIsOver = false;

  constructor(private auth: Auth, private firestore: Firestore, private router: Router, private firebaseService: FirebaseService) {
    this.user$ = authState(this.auth);
    this.usersCollection = collection(this.firestore, 'users');
    this.candidatesCollection = collection(this.firestore, 'candidates');

  }

  async registerWithEmail(email: string, password: string, displayName: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      this.sendVerification();
      if (user) {
        await updateProfile(user, { displayName });
        this.setTimeInStorage();
        this.router.navigate(['/verified']);
      }
    } catch (error) {
      console.error('Registration error: ', error);
      throw error;
    }
  }

  async loginWithEmail(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
    this.setTimeInStorage();
    this.router.navigate(['/board']);
  }

  async loginWithGoogle(): Promise<void> {
    const user = (await signInWithPopup(this.auth, new GoogleAuthProvider())).user;
    console.log(user);
    await this.googleLoginCheck(user);
    this.setTimeInStorage();
    this.router.navigate(['/verified']);
  }

  async loginAnonymously(): Promise<void> {
    const user = await signInAnonymously(this.auth);
    this.setAnonymousLoginFlag(user.user.uid);
    this.setTimeInStorage();
    this.router.navigate(['/board']);
  }

  async googleLoginCheck(user: User) {
    if (user) {
      const userDocRef = doc(this.firestore, `users/${this.firebaseService.getStorageName(user.uid, user.displayName || 'anonym user')}`);
      console.log(userDocRef);

      const docSnapshot = await getDoc(userDocRef);
      console.log(docSnapshot.exists());

      if (!docSnapshot.exists()) {
        await this.firebaseService.setUserItems(user, {
          'display_name': user.displayName,
          'Email': user.email,
          'voices': [],
          'canVote': true,
          'role': 'user',
          'uid': user.uid
        });
      }
    }
  }

  async checkEmailVerificationAndAssignRole(): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        await this.firebaseService.setUserItems(user, {
          'display_name': user.displayName,
          'Email': user.email,
          'voices': [],
          'canVote': true,
          'role': 'user',
          'uid': user.uid
        });
        this.router.navigate(['/board']);  // or wherever you want to redirect the user
      } else {
        this.router.navigate(['/verified']);
      }
    }
  }

  isAlreadyAnonymouslyLoggedIn(): boolean {
    return localStorage.getItem('anonymousUserId') !== null;
  }

  setAnonymousLoginFlag(userId: string): void {
    localStorage.setItem('anonymousUserId', userId);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    localStorage.removeItem('loginTime');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): Observable<User | null> {
    return this.user$.pipe(
      map(user => user)
    );
  }

  async sendVerification() {
    const user = this.auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
      console.log('Verification email sent.');
    }
  }


  setTimeInStorage() {
    const loginTimestamp = Date.now();
    localStorage.setItem('loginTime', JSON.stringify(loginTimestamp));
  }

  getUser() {
    return this.auth.currentUser
  }

  isAnonymous(): Observable<boolean> {
    return authState(this.auth).pipe(
      map((user: User | null) => user ? user.isAnonymous : false)
    );
  }

  getCollection(col: 'candidates' | 'users') {
    if (col === 'candidates') {
      return this.candidatesCollection
    } else {
      return this.usersCollection
    }
  }

  getFromCollection(col: 'candidates' | 'users') {
    const colConnection = this.getCollection(col);
    return collectionData(colConnection) as Observable<UserItems[]>;
  }

  setTimeOver() {
    this.timeIsOver = true;
  }

  isTimeOver() {
    return this.timeIsOver;
  }
}
