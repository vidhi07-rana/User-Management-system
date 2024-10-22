import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from './user/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>(this.loadUserFromLocalStorage());
  users$ = this.usersSubject.asObservable();

  constructor() {
    if (this.usersSubject.getValue().length === 0) {
      const dummyUsers = [ 
        { id: 1, FirstName: 'John', LastName: 'Doe', Address: 'NY', Email: 'john@example.com', Phone: '1234567890' },
      ];

      const users: User[] = dummyUsers.map(user => ({
        id: user.id,
        firstName: user.FirstName,
        lastName: user.LastName,
        address: user.Address,
        email: user.Email,
        phone: user.Phone,
      }));

      this.usersSubject.next(users);
      this.saveUsersToLocalStorage(); 
    }
  }

  getUser() {
    return this.usersSubject.getValue();
  }

  getUserById(id: number) {
    return this.getUser().find(user => user.id === id);
  }

  addUser(user: User) {
    const users = this.getUser();

  const userExists = users.some(
    existingUser =>
      existingUser.email === user.email || existingUser.phone === user.phone
  );

  if (userExists) {
    return false; 
  }

 
  this.usersSubject.next([...users, user]);
  this.saveUsersToLocalStorage();
  return true; 
  }

  updateUser(updatedUser: User) {
    const users = this.getUser().map(user =>
      user.id === updatedUser.id ? updatedUser : user
    );
    this.usersSubject.next(users);
    this.saveUsersToLocalStorage();
  }

  deleteUser(userId: number) {
    const users = this.getUser().filter(user => user.id !== userId);
    this.usersSubject.next(users);
    this.saveUsersToLocalStorage()
  }

  private loadUserFromLocalStorage(): User[] {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }

  private saveUsersToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(this.usersSubject.getValue()));
  }
  checkUserExists(email: string, phone: string): string | null {
    const users = this.getUser();
  
    if (users.some(user => user.email === email)) {
      return 'Email already exists';
    }
    
    if (users.some(user => user.phone === phone)) {
      return 'Phone number already exists';
    }
  
    return null;
  }
}
