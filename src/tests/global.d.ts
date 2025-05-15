import type { ATM } from '../atm';
import type { Account } from '../account';

declare global {
  interface Window {
    __atm__: ATM;
    __account__: Account;
  }
}
