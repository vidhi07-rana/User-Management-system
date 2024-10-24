import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>(this.loadUserFromLocalStorage() || []);
  users$ = this.usersSubject.asObservable();  
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {
    this.loadUsersFromApi(); 
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

    const newUser = { ...user }; 

    this.http.post<User>(this.apiUrl, newUser).subscribe(
        (response) => {
            const updatedUsers = [...users, response]; 
            this.usersSubject.next(updatedUsers);
            this.saveUsersToLocalStorage(updatedUsers);
        },
        (error) => {
            console.error('Failed to add user', error);
        }
    );

    return true; 
}



  updateUser(updatedUser: User) {
    this.http.put<User>(`${this.apiUrl}/${updatedUser.id}`, updatedUser).subscribe(
      () => {
        const users = this.getUser().map(user =>
          user.id === updatedUser.id ? updatedUser : user
        );
        this.usersSubject.next(users);
        this.saveUsersToLocalStorage(users);
      },
      (error) => {
        console.error('Failed to update user', error);
      }
    );
  }

  deleteUser(userId: number) {
    this.http.delete(`${this.apiUrl}/${userId}`).subscribe(
      () => {   
        const users = this.getUser().filter(user => user.id !== userId);
        this.usersSubject.next(users);
        this.saveUsersToLocalStorage(users);
      },
      (error) => {
        console.error('Failed to delete user', error);
      }
    );
  }

  private loadUserFromLocalStorage(): User[] {
    const users = localStorage.getItem('users');
    console.log('Loaded users from localStorage:', users); 
    try {
      const parsedUsers = users ? JSON.parse(users) : [];
      console.log('Parsed users:', parsedUsers); 
      return parsedUsers; 
    } catch (e) {
      console.error('Failed to parse users from localStorage:', e);
      return []; 
    }
  }

  private saveUsersToLocalStorage(users: User[]) {
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

  loadUsersFromApi() {
    this.http.get<User[]>(this.apiUrl).subscribe(
      (users) => {
        this.usersSubject.next(users);
        this.saveUsersToLocalStorage(users);
      },
      (error) => {
        console.error('Failed to load users from API', error);
      }
    );
  }    
}
