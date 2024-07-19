import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc, addDoc, deleteDoc, setDoc, getDoc, DocumentData, query, getDocs, } from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserItems } from '../board/board.component';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private userItemsSubject: BehaviorSubject<UserItems | null> = new BehaviorSubject<UserItems | null>(null);
  public userItems$: Observable<UserItems | null> = this.userItemsSubject.asObservable();

  constructor(private firestore: Firestore) { }

  async setUserItems(user: User, userItem: any): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${this.getStorageName(user.uid, user.displayName || 'anonym user')}`);

    const docSnapshot = await getDoc(userDocRef);

    if (docSnapshot.exists()) {
      console.log('Document already exists');
    } else {
      await setDoc(userDocRef, userItem);
      console.log('Document successfully written!');
    }
  }

  getStorageName(uid: string, displayName: string) {
    let first_name = displayName.split(' ')[0]
    return `${first_name}-${uid}`
  }

  async getAllUsers(): Promise<DocumentData[]> {
    const usersCollection = collection(this.firestore, 'users');
    const usersQuery = query(usersCollection);

    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.docs.map(doc => doc.data());
  }

  async getUserItems(user: User) {
    const userDocRef = doc(this.firestore, `users/${this.getStorageName(user.uid, user.displayName || 'anonym user')}`);
    let userItemsResult = await getDoc(userDocRef);
    let userItemsData = userItemsResult.data()
    this.userItemsSubject.next(userItemsData as UserItems)
    return userItemsData as UserItems;
  }

  async updateUserItems(user: User, voices: string[]) {
    const userDocRef = doc(this.firestore, `users/${this.getStorageName(user.uid, user.displayName || 'anonym user')}`);
    await updateDoc(userDocRef, {
      ['voices']: voices,
      ['canVote']: false
    });
  }

  async setUserRole(user: UserItems, role: string) {
    const userDocRef = doc(this.firestore, `users/${this.getStorageName(user.uid, user.display_name || 'anonym user')}`);
    await updateDoc(userDocRef, {
      ['role']: role
    });
  }
}
