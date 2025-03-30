export function clearPin() : void {
  const pinLines = document.getElementById('pin-lines');
  const children = pinLines?.children;

  if (children){
    for (let i = 0; i < children.length; i++){
      children[i].children[0].innerHTML = '';
    }
  }
}
export function clearCustom() : void {
  const input = document.getElementById('custom-value-input') as HTMLDivElement;
  input.innerText = '';
}
export function clearCustomPin() : void {
  const input = document.getElementById('custom-pin-input') as HTMLDivElement;
  input.innerText = '';
}

export function extractNumberfromString(moneyString : string) : number {
  const match = moneyString.match(/\d+/);
  const amount = match ? parseInt(match[0], 10) : 0;
  return amount
}