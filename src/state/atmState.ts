export enum ATMState {
  WaitingForCard,
  EnteringPin,
  Menu,
  ViewingBalance,
  Withdrawing,
  WithdrawingConfirm,
  WithdrawingMoney,
  SuccessfulOperation,
  FailedOperation,
  RemoveCard,
  Depositing,
  SessionEnded
}

export type ATMStateListener = (newState: ATMState) => void;
const listeners: ATMStateListener[] = [];

export function onATMStateChange(callback: ATMStateListener) {
  listeners.push(callback);
}

export function renderScreen(){
  const atmScreen = document.getElementById('atm-screen');
  if (atmScreen) atmScreen.innerHTML = ''; // update content
  }
// Shared variable to hold the current state
export let currentATMState: ATMState = ATMState.WaitingForCard;

// Function to update state
export function setATMState(newState : ATMState) : void {
  renderScreen();
  currentATMState = newState;
  console.log("ATM state is now:", ATMState[currentATMState]);
  listeners.forEach(listener => listener(currentATMState));
  
}


