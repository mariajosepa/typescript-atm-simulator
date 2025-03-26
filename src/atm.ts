import { Account }  from './account'

export interface IATM {
   withdrawLimit: number;
   depositLimit : number;
   availableCash : number;
}

export interface IMessage {
  success : boolean,
  status : string,
}

export class ATM implements IATM {

  public withdrawLimit: number;
  public depositLimit : number;
  public availableCash : number;


  constructor(withdrawLimit : number, depositLimit : number, availableCash : number){
    this.withdrawLimit = withdrawLimit
    this.depositLimit = depositLimit
    this.availableCash = availableCash
  }

  public checkPin(pin : string, account : Account) : boolean {
    return pin === account.pin;
  }

  public withdraw(amount : number, account : Account) : IMessage{

    let message : IMessage = {
      success : false,
      status : "You have insufficient funds",
    }
    if (account.balance >= amount && amount <= this.withdrawLimit && amount <= this.availableCash){
      account.balance -= amount;
      this.availableCash -= amount;
      message.success = true;
      message.status = "Money withdrawn! Please take your money"
    }
    else if (amount > this.availableCash){
      message.success = false;
      message.status = "ATM has insufficient funds"
    }
    else if (amount > account.balance){
      message.success = false;
      message.status = "You have insufficient funds"
    }
    else if (amount > this.withdrawLimit){
      message.success = false;
      message.status = "You cannot withdraw that amount"
    }
    return message
  }

  public deposit(amount : number, account : Account) : IMessage{

    let message : IMessage = {
      success : true,
      status : "You have exceeded the deposit amount, please retrieve your money",
    }
    if (amount <= this.depositLimit){
      account.balance += amount;
      this.availableCash += amount;
      message.success = true;
      message.status = "Money Deposited !"
    }

    return message

  }
}