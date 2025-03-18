import '../src/styles/main.css';
const atmScreen = document.getElementById('atm-screen') as HTMLDivElement;
const keypad = document.getElementById('keypad') as HTMLDivElement;
const beepSound = new Audio('/assets/key_beep.mp3');


//show start screen
document.addEventListener("DOMContentLoaded", () => {

  const welcomeLogo = document.createElement('img');
  welcomeLogo.src = '/assets/logo.png';
  welcomeLogo.id = 'welcome-logo';
  atmScreen.append(welcomeLogo);

});

//add beeping sound to keys
keypad?.addEventListener('click', (event) => {
  const target = event.target as HTMLDivElement;
  console.log(target);
  if (target.classList.contains('keypad-button') || target.classList.contains('keypad-special-button')) {
    beepSound.play();
  }
}
);
