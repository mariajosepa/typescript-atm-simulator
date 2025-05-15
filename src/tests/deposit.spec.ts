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

test.describe('ATM Deposit Scenarios', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('TC-DP-01 - Rechazar depósito con saldo negativo', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = -1;
    });
    await goToDepositMenu(page);
    await page.locator('#bill100').dragTo(page.locator('#atm-img-money-slot-body'));
    await page.waitForTimeout(1000);
    await page.locator('#screen-button4').click(); // yes
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/money deposited/i);
  });

  test('TC-DP-02 - Depósito permitido con saldo positivo ($300)', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 2;
    });
    await goToDepositMenu(page);
    await page.locator('#bill300').dragTo(page.locator('#atm-img-money-slot-body'));
    await page.waitForTimeout(1000);
    await page.locator('#screen-button4').click(); // yes
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/money deposited/i);
  });

  test('TC-DP-03 - Depósito de $1000 con saldo bajo', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 2;
    });
    await goToDepositMenu(page);
    await page.locator('#bill1000').dragTo(page.locator('#atm-img-money-slot-body'));
    await page.waitForTimeout(1000);
    await page.locator('#screen-button4').click(); // yes
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/money deposited/i);
  });

  test('TC-DP-04 - Depósito mínimo con saldo bajo ($100)', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 2;
    });
    await goToDepositMenu(page);
    await page.locator('#bill100').dragTo(page.locator('#atm-img-money-slot-body'));
    await page.waitForTimeout(1000);
    await page.locator('#screen-button4').click();
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/money deposited/i);
  });

  test('TC-DP-05 - Depósito de $1000 con saldo cero', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 0;
    });
    await goToDepositMenu(page);
    await page.locator('#bill1000').dragTo(page.locator('#atm-img-money-slot-body'));
    await page.waitForTimeout(1000);
    await page.locator('#screen-button4').click();
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/money deposited/i);
  });

  test('TC-DP-06 - Depósito de $300 con saldo cero', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 0;
    });
    await goToDepositMenu(page);
    await page.locator('#bill300').dragTo(page.locator('#atm-img-money-slot-body'));
    await page.waitForTimeout(1000);
    await page.locator('#screen-button4').click();
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/money deposited/i);
  });

  test('TC-DP-07 - Depósito mínimo con saldo cero', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 0;
    });
    await goToDepositMenu(page);
    await page.locator('#bill100').dragTo(page.locator('#atm-img-money-slot-body'));
    await page.waitForTimeout(1000);
    await page.locator('#screen-button4').click();
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/money deposited/i);
  });

  test('TC-DP-08 - Depósito máximo con saldo bajo', async ({ page }) => {
    await page.evaluate(() => {
      window.__account__.balance = 100;
    });
    await goToDepositMenu(page);
    await page.locator('#bill1000').dragTo(page.locator('#atm-img-money-slot-body'));
    await page.waitForTimeout(1000);
    await page.locator('#screen-button4').click();
    await page.waitForTimeout(6000);
    await expect(page.locator('#atm-screen')).toContainText(/money deposited/i);
  });

});
