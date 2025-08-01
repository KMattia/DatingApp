import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AccountService } from '../service/account-service';
import { ToastService } from '../service/toast-service';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const toast = inject(ToastService);

  if(accountService.currentUser()?.roles.includes('Admin') || accountService.currentUser()?.roles.includes('Moderator'))
  {
    return true;
  }
  else
  {
    toast.error('Enter this area, you cannot');
    return false;
  }
};
