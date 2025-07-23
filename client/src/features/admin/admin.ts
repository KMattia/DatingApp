import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AccountService } from '../../core/service/account-service';
import { UserManagement } from "./user-management/user-management";
import { PhotoManagement } from "./photo-management/photo-management";

@Component({
  selector: 'app-admin',
  imports: [NgIf, UserManagement, PhotoManagement],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
    protected accountService = inject(AccountService);
    activeTab = 'photo';
    tabs = [
        {label: 'Photo moderation', value: 'photos'},
        {label: 'User moderation', value: 'roles'}
    ]

    setTab(tab: string){
        this.activeTab = tab;
    }
}
