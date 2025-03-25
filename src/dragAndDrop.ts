import {ATMState, setATMState, currentATMState} from './state/atmState'

const cardDebit = document.getElementById('debit');
const cardSlotBody = document.getElementById('atm-img-card-slot-body');
const cardSlot = document.getElementById('atm-img-card-slot');
const bill = document.getElementById('bill');
const billSlotBody = document.getElementById('atm-img-money-slot-body');
const moneySlot = document.getElementById('atm-img-money-slot');
const atmContainer = document.getElementById('atm-container');


cardDebit?.addEventListener('dragstart', (e) => {
  e.dataTransfer?.setData('text/plain', (e.target as HTMLElement).id);
});
bill?.addEventListener('dragstart', (e) => {
  e.dataTransfer?.setData('text/plain', (e.target as HTMLElement).id);
});

//card drag and drop
cardSlotBody?.addEventListener('dragover', (e) => {
  e.preventDefault();
})

atmContainer?.addEventListener('dragover', (e) => {
  e.preventDefault();
});

atmContainer?.addEventListener('drop', (e) => {
  e.preventDefault();

  const draggedId = e.dataTransfer?.getData('text/plain');
  const dropTarget = e.target as HTMLElement;

  if (currentATMState === ATMState.RemoveCard){
   
    // If not dropped in the slot zone
    if (cardDebit && 
      !cardSlotBody?.contains(dropTarget) && 
      draggedId === 'debit'){
      // Move the card back to its original position
      atmContainer.appendChild(cardDebit);
      cardDebit.classList.remove('card-transform');
      setATMState(ATMState.WaitingForCard);
    }

  }
  else if(currentATMState === ATMState.WaitingForCard){
    //If card is dragged to drop zone, insert it
    if (dropTarget === cardSlotBody && draggedId === 'debit'){
      cardSlot?.prepend(cardDebit as HTMLImageElement);
      cardDebit?.classList.add('card-transform');
      setATMState(ATMState.EnteringPin);
    }

  }



});