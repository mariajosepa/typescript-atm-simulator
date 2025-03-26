import '../src/styles/main.css'
import "../src/styles/screens.css"
import '../src/styles/cards.css'
import '../src/styles/money.css'
import './dragAndDrop'
import { depositState } from './state/depositState';
import { ATM } from './atm'
import { ATMState, onATMStateChange, setATMState, currentATMState } from './state/atmState'
import { clearCustom, clearPin,extractNumberfromString } from './util'
import { Account } from './account'

const atmScreen = document.getElementById('atm-screen') as HTMLDivElement;
const keypad = document.getElementById('keypad') as HTMLDivElement;
const leftScreenButtons = document.getElementById('atm-left-buttons') as HTMLDivElement;
const rightScreenButtons = document.getElementById('atm-right-buttons') as HTMLDivElement;
const atmBody = document.getElementById('atm-img-container');

const beepSound = new Audio('/assets/key_beep.mp3');
let pressedKey : string  = ''; 
let enteredPin : string = '';
let enteredCustom : string = '';
let selectedAmount : string = '';
let textToDisplay : string = '';
let autoClose : boolean = false;
let returnToMenu : boolean = false;

type ATMMenuKey = keyof typeof ATMState;
const leftScreenButtonOptions : Partial<Record<ATMMenuKey, string[]>> = {
  Menu : ['View Balance','Withdraw','Deposit','Exit'],
  Withdrawing : ['$20', '$40', '$60', ''],
  WithdrawingConfirm : ['','','','yes'],
  WithdrawingCustom : ['','','',''],
  DepositingConfirm : ['','','','yes'],
  ViewingBalance : ['','','',''],

}
const rightScreenButtonOptions : Partial<Record<ATMMenuKey, string[]>> = {
  Menu : ['','','',''],
  Withdrawing : ['$100', '$200', 'other', 'back'],
  WithdrawingConfirm : ['','','','cancel'],
  WithdrawingCustom : ['','','','back'],
  DepositingConfirm : ['','','','cancel'],
  ViewingBalance : ['','','','back'],
}

const atm = {
  withdrawLimit: 1000,
  depositLimit : 1000,
  availableCash : 20000,
  minimumWithdraw : 20,

}

const myATM = new ATM(atm);
const myAccount : Account = {
  pin: '1234',
  balance: 10000
}
//welcome logo
document.addEventListener('DOMContentLoaded',()=>{
  setATMState(ATMState.WaitingForCard);
})

//add functionality to keypad, depending on screen state
keypad?.addEventListener('click', (event) => {
  const target = event.target as HTMLDivElement;
  const targetId = (event.target as HTMLDivElement).id
        
  if (target.classList.contains('keypad-button') || target.classList.contains('keypad-special-button')) {
    beepSound.play(); //add key beep
    pressedKey = target.textContent?.trim() ?? ''; //save immediately pressed key
  }

  if(currentATMState === ATMState.EnteringPin){
    //enter pin
    enterPin(pressedKey);
    //check pin
    if (enteredPin.length === 4){

        if(targetId === 'keypad-ok-button'){
          let isCorrect = myATM.checkPin(enteredPin,myAccount);
          if (isCorrect){
            setTimeout(()=>{console.log('That is correct');setATMState(ATMState.Menu);enteredPin = '';},1000);
          }
          else{
            setTimeout(()=>{console.log("WRONG PING MY GUY");clearPin();enteredPin = '';},1000)
          }
        }
    }
    
  }
  else if(currentATMState === ATMState.WithdrawingCustom){
    //type value
    enterCustom(pressedKey);
    
    if(targetId === 'keypad-ok-button'){
      selectedAmount = enteredCustom;
      enteredCustom = '';
      setATMState(ATMState.WithdrawingMoney);
    }
  }
  else if(currentATMState === ATMState.ViewingBalance){
    if(targetId === 'keypad-ok-button'){
      setATMState(ATMState.RemoveCard);
    }
  } 
}
);
//add funtionality to screen keys depending on screen state
leftScreenButtons?.addEventListener('click',(e) => {
  if (e.target){
    const targetId = (e.target as HTMLDivElement).id;
  
    //Main Menu
    if(currentATMState === ATMState.Menu){
      if(targetId === 'screen-button1' ){
        setATMState(ATMState.CheckingBalance);
      }
      else if(targetId === 'screen-button2' ){
        setATMState(ATMState.Withdrawing);

      }
      else if(targetId === 'screen-button3'){
        setATMState(ATMState.Depositing);

      }
      else if(targetId === 'screen-button4'){
        setATMState(ATMState.RemoveCard);
      }
    }
    //Withdraw money
    else if(currentATMState === ATMState.Withdrawing){

      if( targetId === 'screen-button1' ||
          targetId === 'screen-button2' ||
          targetId === 'screen-button3'
        ){
                  
        let index = extractNumberfromString(targetId) - 1;
        selectedAmount = leftScreenButtonOptions['Withdrawing']?.[index] ?? '';
        setATMState(ATMState.WithdrawingConfirm);
      }
    }
    else if(currentATMState === ATMState.WithdrawingConfirm){
      if( targetId === 'screen-button4'){
        setATMState(ATMState.WithdrawingMoney);
      }
    }
    else if(currentATMState === ATMState.DepositingConfirm){
      if( targetId === 'screen-button4'){
        setATMState(ATMState.DepositingMoney);
      }
    }
  }
 })
rightScreenButtons?.addEventListener('click',(e) => {
      if(e.target){
        const targetId = (e.target as HTMLDivElement).id;
        if(currentATMState === ATMState.ViewingBalance){
          if(targetId === 'screen-button8'){
            setATMState(ATMState.Menu);
          }
        }
        else if(currentATMState === ATMState.Withdrawing){
          if( targetId === 'screen-button5' ||
              targetId === 'screen-button6'
            ){
    
            let index = extractNumberfromString(targetId) - 5;
            selectedAmount = rightScreenButtonOptions['Withdrawing']?.[index] ?? '';
            setATMState(ATMState.WithdrawingConfirm);
            
          }
          //Custom value input
          else if(targetId === 'screen-button7'){
            setATMState(ATMState.WithdrawingCustom);

          }
          //go back to main menu
          else if(targetId === 'screen-button8'){
            setATMState(ATMState.Menu);
          }
        }
        else if(currentATMState === ATMState.WithdrawingConfirm){
          if( targetId === 'screen-button8'){
            setATMState(ATMState.Withdrawing);
          }
        }
        else if(currentATMState === ATMState.WithdrawingCustom){
          if( targetId === 'screen-button8'){
            enteredCustom = '';
            setATMState(ATMState.Withdrawing);
          }
        }
        else if(currentATMState === ATMState.DepositingConfirm){
          if( targetId === 'screen-button8'){
            setATMState(ATMState.FailedDeposit);
          }
        }

      }
})
atmBody?.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.id === 'new-bills') {
    closeMoneySlot();
    setATMState(ATMState.RemoveCard);
  }
});

// main screen flow
onATMStateChange((state) => {
  //show start screen
  if(state === ATMState.WaitingForCard){
    atmScreen.className = '';
    atmScreen.innerHTML = '';
    atmScreen.classList.add('start-screen');
    welcome();
  }
  //enter pin
  else if (state === ATMState.EnteringPin){
    atmScreen.className = '';
    atmScreen.classList.add('enter-pin');
    showPinlines();
  }
  //show menu options
  else if(state === ATMState.Menu){
    showOptions('Menu');
  }
  else if(state === ATMState.CheckingBalance){
    showMessage('Consulting balance...','loading-text');
    setTimeout(()=> {
      setATMState(ATMState.ViewingBalance);
    },2000);

  }
  else if(state === ATMState.ViewingBalance){
    showOptions('ViewingBalance');
    viewBalance();
  }
  //Withdraw money
  else if(state === ATMState.Withdrawing){
    showOptions('Withdrawing');
  }
  else if(state === ATMState.WithdrawingCustom){
    inputCustomValue();
    showOptions('WithdrawingCustom');
  }
  else if(state === ATMState.WithdrawingConfirm){
     showOptions('WithdrawingConfirm');
     showMessage(`Are you sure you want to withdraw ${selectedAmount}?`, 'confirm-text');
  }
  else if (state === ATMState.WithdrawingMoney){
    showMessage('Withdrawing money...','loading-text');
    setTimeout(() => {
      const result = myATM.withdraw(parseInt(selectedAmount), myAccount);
      
      if (result.success) {
        autoClose = false; // we don't remove card until user removes card
        openMoneySlotWithdraw();
        textToDisplay = result.status;
        setATMState(ATMState.SuccessfulOperation);
      } else {
        returnToMenu = true; // we don't remove card until user removes card
        textToDisplay = result.status;
        setATMState(ATMState.FailedOperation);
      }
    }, 5000);
    
  }
  else if(state === ATMState.Depositing){
    showMessage('Deposit your money in the slot','confirm-text');
    openMoneySlotDeposit();
  }
  else if(state === ATMState.DepositingProcessing){
    showMessage('Counting Money...','loading-text');
    setTimeout(()=>{
      setATMState(ATMState.DepositingConfirm);
    },3000);
  }
  else if(state === ATMState.DepositingConfirm){
    closeMoneySlotDeposit();
    showOptions('DepositingConfirm');
    showMessage(`Are you sure you want to deposit $${depositState.amount}`,'confirm-text');
  }
  else if(state === ATMState.DepositingMoney){
    showMessage('Depositing money...','loading-text');
    setTimeout(() => {
      const result = myATM.deposit(parseInt(depositState.amount), myAccount);
      autoClose = true;
      if (result.success) {
        textToDisplay = result.status;
        setATMState(ATMState.SuccessfulOperation);
      } else {
        textToDisplay = result.status;
        setATMState(ATMState.FailedOperation);
      }
    }, 5000);

  }
  else if(state === ATMState.FailedDeposit){
    showMessage('Cancelling deposit...', 'error-text');
    setTimeout(() => {
      atmScreen.innerHTML = '';
      showMessage('Deposit cancelled, please collect your money', 'confirm-text');
       openMoneySlotWithdraw();
    }, 3000);

  }
  else if (state === ATMState.SuccessfulOperation){
    showMessage(textToDisplay, 'sucess-text');
    if (autoClose){
      setTimeout(()=>{
        setATMState(ATMState.RemoveCard)
      },2000)
    }
  }
  else if (state === ATMState.FailedOperation){
    showMessage(textToDisplay, 'error-text');
    if (autoClose){
      setTimeout(()=>{
        setATMState(ATMState.RemoveCard)
      },2000)
    }
    else if(returnToMenu){
      setTimeout(()=>{
        setATMState(ATMState.Menu)
      },2000)
    }
  }
  else if(state === ATMState.RemoveCard){
    showMessage('Thank you! Please remove your card', 'sucess-text');
  }
})

//show pin Lines
const showPinlines = () => {
  let pinBoxesHTML = '';
    // Generate 4 pin-boxes dynamically
    for (let i = 0; i < 4; i++) {
      pinBoxesHTML += `
        <div class="pin-box">
          <p></p>
          <div class="pin-box-line">__</div>
        </div>
      `;
    }
    // Inject the whole structure
    atmScreen.innerHTML = `
      <div id="pin-lines">
        ${pinBoxesHTML}
      </div>
      <p class="pin-instruction">Enter your 4-digit PIN, then press [ ok ]</p>
    `;
}
//show welcome message
const welcome = () => {
  const welcomeLogo = document.createElement('img');
  const startMessage = document.createElement('h1');
  welcomeLogo.src = '/assets/logo.png';
  welcomeLogo.id = 'welcome-logo';
  startMessage.classList.add('atm-title');
  startMessage.textContent = 'Insert card';

  atmScreen.append(welcomeLogo);
  atmScreen.append(startMessage);
}
//show input custom value
const inputCustomValue = () => {
  const input = document.createElement('div');
  const message = document.createElement('p');
  input.id = 'custom-value-input';
  message.id = 'custom-value-input-message';
  message.textContent = 'Enter your value, then press [ ok ]';

  atmScreen.append(input);
  atmScreen.append(message);
}

const viewBalance = ()=>{

  const balanceDisplay = document.createElement('div');
  const message = document.createElement('p');
  balanceDisplay.id = 'account-balance-display';
  balanceDisplay.textContent = myAccount.balance.toString();
  message.id = 'account-balance-display-message';
  message.textContent = 'Viewing balance, when you are done, press [ ok ]';

  atmScreen.append(balanceDisplay);
  atmScreen.append(message);

}

//show screen options depending on Atm state
const showOptions = (key : ATMMenuKey) => {

    atmScreen.classList.add('show-options');

    leftScreenButtonOptions[key]?.forEach((text,index)=>{
      let option = document.createElement('div');
      option.classList.add('screen-option');
      option.id = 'screen-option' + (index + 1);
      if(text !== ''){
        option.textContent = text;
      }
      else{
        option.classList.add('no-show');
      }
      atmScreen.appendChild(option);
    })
    rightScreenButtonOptions[key]?.forEach((text,index)=>{
      let option = document.createElement('div')
      option.classList.add('screen-option');
      option.id = 'screen-option' + (index + 4 + 1);
      if(text !== ''){
        option.textContent = text;
      }
      else{
        option.classList.add('no-show');
        option.style.pointerEvents = 'none'; 
      }
      atmScreen.appendChild(option);
    })
}
//show message
const showMessage = (text : string, id : string) => {
  let message = document.createElement('p');
  message.id = id
  message.textContent = text;
  atmScreen.appendChild(message);
}
//open money slot to withdraw money
const openMoneySlotWithdraw = () => {
  const newBill = document.createElement('img');
  const moneySlot = document.getElementById('atm-img-money-slot');
  const moneySlotBody = document.getElementById('atm-img-money-slot-body');
  newBill.src = '/assets/new-bills.png'; 
  newBill.alt = 'Cash bill';       
  newBill.id = 'new-bills';
  atmBody?.appendChild(newBill);
  if (moneySlot && moneySlotBody){
    moneySlot.classList.add('open');
    moneySlotBody.classList.add('open');
  }
}
//close money slot after withdrawing money
const closeMoneySlot = () => {
  const newBill = document.getElementById('new-bills');
  const moneySlot = document.getElementById('atm-img-money-slot');
  const moneySlotBody = document.getElementById('atm-img-money-slot-body');
  if (moneySlot && moneySlotBody){
    moneySlot.classList.remove('open');
    moneySlotBody.classList.remove('open');
  }
  newBill?.remove();
}
//open money slot for a deposit
const openMoneySlotDeposit = () => {
  const moneySlot = document.getElementById('atm-img-money-slot');
  const moneySlotBody = document.getElementById('atm-img-money-slot-body');
  if (moneySlot && moneySlotBody){
    moneySlot.classList.add('open');
    moneySlotBody.classList.add('open');
  }
}
//close money slot after depositing money
const closeMoneySlotDeposit = () => {
  const moneySlot = document.getElementById('atm-img-money-slot');
  const moneySlotBody = document.getElementById('atm-img-money-slot-body');
  if (moneySlot && moneySlotBody){
    moneySlot.classList.remove('open');
    moneySlotBody.classList.remove('open');
  }
}
//enter pin
const enterPin = (num : string) => {
  if (isNaN(Number(num))){
    if(num === 'clear'){
      enteredPin = '';
      clearPin();
    }
    else if(num === 'cancel'){
      enteredPin = '';
      clearPin();
      setATMState(ATMState.RemoveCard);
    }
    return
  }
  //insert asterisks
  if (enteredPin.length < 4){
    let insertSpot = enteredPin.length;
    enteredPin += num;
    console.log(enteredPin);
    const pinLines = document.getElementById('pin-lines');
    if (pinLines){
      pinLines.children[insertSpot].children[0].innerHTML = '*';
    }
  }
}
//enter custom value
const enterCustom = (num : string) => {
  if (isNaN(Number(num))){
    if(num === 'clear'){
      enteredCustom = '';
      clearCustom();
    }
    else if(num === 'cancel'){
      enteredCustom = '';
      clearCustom();
      setATMState(ATMState.RemoveCard);
    }
    return
  }
  else {
    //insert asterisks
    if (enteredCustom.length < 4){
      enteredCustom += num;
      console.log(enteredCustom);
      const inputBox = document.getElementById('custom-value-input') as HTMLDivElement;
      inputBox.innerText = enteredCustom;
     
    }

  }
  
}

