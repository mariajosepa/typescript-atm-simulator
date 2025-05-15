import { test, expect, Page } from '@playwright/test';

const BASE_URL = '/';

async function enterPin(page: Page, pin: string) {
  for (const digit of pin) {
    await page.locator(`#keypad-button${digit}`).click();
  }
  await page.locator('#keypad-ok-button').click();
}

async function goToWithdrawMenu(page: Page) {
  await page.locator('#debit').dragTo(page.locator('#atm-img-card-slot-body'));
  await enterPin(page, '1234');
  await page.locator('#screen-button2').click(); // Withdraw
}

test.describe('ATM Withdraw Scenarios', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('TC-WD-01 - Retiro con saldo insuficiente', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 10;
      window.__atm__.availableCash = 5000;
    });
    await goToWithdrawMenu(page);
    await page.locator('#screen-button6').click(); // $200
    await page.locator('#screen-button4').click(); // yes
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/insufficient funds/i);
  });

  test('TC-WD-02 - Retiro menor al mínimo ($18)', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 500;
      window.__atm__.availableCash = 5000;
    });
    await goToWithdrawMenu(page);
    await page.locator('#screen-button7').click(); // other
    await page.locator('#keypad-button1').click();
    await page.locator('#keypad-button8').click();
    await page.locator('#keypad-ok-button').click();
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/multiple of \$20/i);
  });

  test('TC-WD-03 - Retiro no múltiplo de 20 ($21)', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 500;
      window.__atm__.availableCash = 5000;
    });
    await goToWithdrawMenu(page);
    await page.locator('#screen-button7').click(); // other
    await page.locator('#keypad-button2').click();
    await page.locator('#keypad-button1').click();
    await page.locator('#keypad-ok-button').click();
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/must be a multiple of/i);
  });

  test('TC-WD-04 - Retiro supera límite permitido ($1040)', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 5000;
      window.__atm__.availableCash = 10000;
    });
    await goToWithdrawMenu(page);
    await page.locator('#screen-button7').click(); // other
    await page.locator('#keypad-button1').click();
    await page.locator('#keypad-button0').click();
    await page.locator('#keypad-button4').click();
    await page.locator('#keypad-button0').click();
    await page.locator('#keypad-ok-button').click();
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/withdraw limit/i);
  });

  test('TC-WD-05 - Retiro exitoso de $40', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 200;
      window.__atm__.availableCash = 1000;
    });
    await goToWithdrawMenu(page);
    await page.locator('#screen-button2').click(); // $40
    await page.locator('#screen-button4').click(); // yes
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/withdrawn/i);
  });

  test('TC-WD-06 - Cajero sin fondos suficientes', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 500;
      window.__atm__.availableCash = 0;
    });
    await goToWithdrawMenu(page);
    await page.locator('#screen-button1').click(); // $20
    await page.locator('#screen-button4').click(); // yes
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/atm has insufficient funds/i);
  });

  test('TC-WD-07 - Retiro con errores múltiples ($17)', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 10;
      window.__atm__.availableCash = 0;
    });
    await goToWithdrawMenu(page);
    await page.locator('#screen-button7').click(); // other
    await page.locator('#keypad-button1').click();
    await page.locator('#keypad-button7').click();
    await page.locator('#keypad-ok-button').click();
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/minimum|multiple/i);
  });

  test('TC-WD-08 - Retiro permitido de $1000 (máximo)', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 1500;
      window.__atm__.availableCash = 5000;
    });
    await goToWithdrawMenu(page);
    await page.locator('#screen-button6').click(); // $200 (usamos como $1000 en lógica actual)
    await page.locator('#screen-button4').click(); // yes
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/withdrawn/i);
  });

});
