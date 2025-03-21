export interface IAccount {
  pin : string,
  balance : number,
}

export class Account implements IAccount{
  public pin : string;
  public balance : number;

  constructor(pin : string, balance : number){
    this.pin = pin;
    this.balance = balance;
  }
}


