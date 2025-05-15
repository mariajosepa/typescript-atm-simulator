import { test, expect, Page } from '@playwright/test';

const BASE_URL = '/';

async function enterPin(page: Page, pin: string) {
  for (const digit of pin) {
    await page.locator(`#keypad-button${digit}`).click();
  }
  await page.locator('#keypad-ok-button').click();
}

async function goToDepositMenu(page: Page) {
  await page.locator('#debit').dragTo(page.locator('#atm-img-card-slot-body'));
  await enterPin(page, '1234');
  await page.locator('#screen-button3').click(); // Deposit
}

const testCases = [
  { id: 'TC-DP-01 - Rechazar saldo negativo 1', balance: -1, amount: 100, expectAllow: false },
  { id: 'TC-DP-02 - Rechazar saldo negativo 2', balance: -1, amount: 300, expectAllow: false },
  { id: 'TC-DP-03 - Rechazar saldo negativo 2', balance: -1, amount: 1000, expectAllow: false },
  { id: 'TC-DP-04 - Aceptar deposito medio 1', balance: 2, amount: 300, expectAllow: true },
  { id: 'TC-DP-05 - Aceptar deposito maximo 1', balance: 2, amount: 1000, expectAllow: true },
  { id: 'TC-DP-06 - Aceptar deposito minimo 1', balance: 2, amount: 100, expectAllow: true },
  { id: 'TC-DP-07 - Aceptar deposito maximo 2', balance: 0, amount: 1000, expectAllow: true },
  { id: 'TC-DP-08 - Aceptar deposito minimo 2', balance: 0, amount: 100, expectAllow: true },
  { id: 'TC-DP-09 - Aceptar deposito medio 2', balance: 0, amount: 300, expectAllow: true },
  { id: 'TC-DP-10 - Aceptar deposito minimo 3', balance: 100, amount: 100, expectAllow: true },
  { id: 'TC-DP-11 - Aceptar deposito medio 3', balance: 100, amount: 300, expectAllow: true },
  { id: 'TC-DP-12 - Aceptar maximo 3', balance: 100, amount: 1000, expectAllow: true },
  { id: 'TC-DP-13 - Aceptar deposito medio 4', balance: 200, amount: 300, expectAllow: true },
  { id: 'TC-DP-14 - Aceptar deposito minimo 4', balance: 200, amount: 100, expectAllow: true },
  { id: 'TC-DP-15 - Aceptar deposito maximo 3', balance: 200, amount: 1000, expectAllow: true },
];

test.describe('ATM Deposit Scenarios - Full Matrix', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  for (const { id, balance, amount, expectAllow } of testCases) {
    test(`${id} - Deposit $${amount} with balance $${balance} → ${expectAllow ? 'ALLOW' : 'DENY'}`, async ({ page }) => {
      await page.evaluate((bal) => {
        window.__account__.balance = bal;
      }, balance);

      await goToDepositMenu(page);

      await page.locator(`#bill${amount}`).dragTo(page.locator('#atm-img-money-slot-body'));
      await page.waitForTimeout(1000);
      await page.locator('#screen-button4').click();
      await page.waitForTimeout(6000);

      const screen = page.locator('#atm-screen');
      if (expectAllow) {
        await expect(screen).toContainText(/money deposited/i);
      } else {
        await expect(screen).not.toContainText(/money deposited/i);
      }
    });
  }

});
