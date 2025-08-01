import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/service/account-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../core/service/toast-service';
import { themes } from '../theme';
import { BusyService } from '../../core/service/busy-service';
import { HasRole } from '../../shared/directives/has-role';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive, HasRole],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav implements OnInit {
    protected accountService = inject(AccountService);
    protected busyService = inject(BusyService);
    private router = inject(Router);
    private toast = inject(ToastService);
    protected creds: any = {}
    protected selectedTheme = signal<string>(localStorage.getItem('theme') || 'light');
    protected themes = themes;
    protected loading = signal(false);

    ngOnInit(): void {
        document.documentElement.setAttribute('data-theme', this.selectedTheme());
    }

    handleSelectedTheme(theme :string)
    {
        this.selectedTheme.set(theme);
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        const elem = document.activeElement as HTMLDivElement;
        if(elem) elem.blur;
    }

    handleSelectUserItem() {
        const elem = document.activeElement as HTMLDivElement;
        if(elem) elem.blur;
    }

    login(){
        this.loading.set(true);
        this.accountService.login(this.creds).subscribe({
            next: () => {
                    this.router.navigateByUrl('/members');
                    this.toast.success('Logged in successfully');
                    this.creds = {};
                },
            error: error => {
                this.toast.error(error.error)
            },
            complete: () => this.loading.set(false)
        })
    }

    logout() {
        this.accountService.logout();
        this.router.navigateByUrl('/');
    }
}
