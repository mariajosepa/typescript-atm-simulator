export function clearPin() : void {
  const pinLines = document.getElementById('pin-lines');
  const children = pinLines?.children;

  if (children){
    for (let i = 0; i < children.length; i++){
      children[i].children[0].innerHTML = '';
    }
  }
}



export function extractValueOptions(id : string) : number {

  const match = id.match(/\d+/); // finds one or more digits
  
  if (match) {
    const number = parseInt(match[0], 10);
    return number
  }

  return 0

}

export function parseMoneyValue(moneyString : string) : number {
  const match = moneyString.match(/\d+/);
  const amount = match ? parseInt(match[0], 10) : 0;

  return 1
}