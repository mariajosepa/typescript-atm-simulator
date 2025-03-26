import { Account }  from './account'

export interface IATM {
   withdrawLimit: number;
   depositLimit : number;
   availableCash : number;
   minimumWithdraw : number;
}

export interface IMessage {
  success : boolean,
  status : string,
}

export class ATM implements IATM {

  public withdrawLimit: number;
  public depositLimit : number;
  public availableCash : number;
  public minimumWithdraw: number;


  constructor(atm : IATM){
    this.withdrawLimit = atm.withdrawLimit
    this.depositLimit = atm.depositLimit
    this.availableCash = atm.availableCash
    this.minimumWithdraw = atm.minimumWithdraw
  }

  public checkPin(pin : string, account : Account) : boolean {
    return pin === account.pin;
  }

  public withdraw(amount : number, account : Account) : IMessage{

    let message : IMessage = {
      success : false,
      status : "You have insufficient funds",
    }
    if (account.balance >= amount && 
      amount <= this.withdrawLimit && 
      amount <= this.availableCash &&
      amount % 20 === 0
    ){
      account.balance -= amount;
      this.availableCash -= amount;
      message.success = true;
      message.status = "Money withdrawn! Please take your money"
    }
    else{
      message.success = false;
      if (amount % 20 !== 0){
        message.status = "Value must be a multiple of $20"
      }
      else if (amount < this.minimumWithdraw){
        message.status = "Minimum withdrawal is $20"
      }
      else if (amount > this.availableCash){
        message.status = "ATM has insufficient funds"
      }
      else if (amount > account.balance){
        message.status = "You have insufficient funds"
      }
      else if (amount > this.withdrawLimit){
        message.status = "You exceeded the withdraw limit"
      }
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