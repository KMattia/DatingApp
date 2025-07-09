import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AccountService } from '../service/account-service';
import { ToastService } from '../service/toast-service';

export const authGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const toast = inject(ToastService);

  if(accountService.currentUser()) return true;
  else{
    toast.error('You shall not pass');
    return false;
  }
};
