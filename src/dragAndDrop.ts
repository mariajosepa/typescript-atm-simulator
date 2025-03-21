import {ATMState, setATMState} from './state/atmState'

const cardDebit = document.getElementById('debit');
const cardSlotBody = document.getElementById('atm-img-money-slot-body');
const cardSlot = document.getElementById('atm-img-money-slot');
const atmContainer = document.getElementById('atm-container');

//card drag and drop
atmContainer?.addEventListener('dragover', (e) => {
  e.preventDefault();
})

atmContainer?.addEventListener('drop', (e) => {
  e.preventDefault();
  const dropTarget = e.target as HTMLElement;

  //if card is dragged to drop zone, insert it
  if (dropTarget === cardSlotBody){
    cardSlot?.prepend(cardDebit as HTMLImageElement);
    cardDebit?.classList.add('card-transform');
    setATMState(ATMState.EnteringPin);
  }
  // If not dropped in the slot zone
  else if (!cardSlotBody?.contains(dropTarget)) {
    // Move the card back to its original position
    if (cardDebit){
      atmContainer.appendChild(cardDebit);
      cardDebit.classList.remove('card-transform');
    }
  }
});