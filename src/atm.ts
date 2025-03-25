import { Account }  from './account'
import { ATMState, currentATMState, setATMState } from './state/atmState';

export interface IATM {
  cashLimit : number,
  depositLimit : number
}

export interface IMessage {
  success : boolean,
  status : string,
}

export class ATM implements IATM {

  public cashLimit: number;
  public depositLimit : number;

  constructor(cashLimit : number, depositLimit : number){
    this.cashLimit = cashLimit
    this.depositLimit = depositLimit
  }

  public checkPin(pin : string, account : Account) : boolean {
    return pin === account.pin;
  }

  public withdraw(amount : number, account : Account) : IMessage{

    let message : IMessage = {
      success : false,
      status : "You have insufficient funds",
    }
    if (account.balance >= amount && amount <= this.cashLimit){
      account.balance -= amount;
      this.cashLimit -= amount;
      message.success = true;
      message.status = "Money withdrawn! Please take your money"
    }
    else if (amount > this.cashLimit){
      message.success = false;
      message.status = "ATM has insufficient funds"
    }
    else if (amount > account.balance){
      message.success = false;
      message.status = "You have insufficient funds"
    }
    return message
  }

  public deposit(amount : number, account : Account) : IMessage{

    let message : IMessage = {
      success : true,
      status : "Depositing...",
    }
    if (amount > this.cashLimit){
      account.balance -= amount;
      this.cashLimit -= amount;
      message.success = true;
      message.status = "Withdrawing money..."
    }

    return message

  }
}