interface ATM {
  password : string,
}

class ATM  {
  constructor(password : string){
    this.password = password;
  }

  public checkPassword(password : string) : boolean {
    return this.password === password;
  }

}