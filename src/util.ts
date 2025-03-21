export function clearPin() : void {
  const pinLines = document.getElementById('pin-lines');
  const children = pinLines?.children;

  if (children){
    for (let i = 0; i < children.length; i++){
      children[i].children[0].innerHTML = '';
    }

  }
  
  
}