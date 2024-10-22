import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user.service';
import { Router } from '@angular/router';
import { User } from '../user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService, public router:Router) {}

  ngOnInit(): void {
    this.userService.users$.subscribe(users => {
      this.users = users; 
    });
  }

  onEdit(userId: number) {
    this.router.navigate(['/users', userId]);
  }

  onDelete(userId: number) {
    this.userService.deleteUser(userId);
  }
}
