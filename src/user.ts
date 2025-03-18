interface User {
  password : string,
  balance : number,
}


class User {
  constructor(password : string, balance : number){
    this.password = password;
    this.balance = balance;
  }
}