import { test, expect } from '@playwright/test'

const STORAGE_KEY = 'fractions-kids/v1'

// Answer whatever problem is on screen (correctly or not — these tests verify
// UI flow, not arithmetic) and click through to the next problem.
async function answerAndAdvance(page) {
  const choices = page.locator('.input-wrap .choice')
  if (await choices.count()) {
    await choices.first().click()
  } else {
    // Numpad: set numerator, switch to denominator, set it, then Check.
    await page.locator('.np-key', { hasText: /^1$/ }).click()
    await page.locator('.np-slot').nth(1).click()
    await page.locator('.np-key', { hasText: /^2$/ }).click()
    await page.locator('.np-check').click()
  }
  await page.locator('.next').click()
}

async function playFullSession(page) {
  for (let i = 0; i < 10; i++) {
    await expect(page.locator('.prompt')).toBeVisible()
    await answerAndAdvance(page)
  }
}

test('home screen renders title, smart start, and four skills', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1.title')).toContainText('Fraction Friends')
  await expect(page.locator('.smart-start')).toBeVisible()
  await expect(page.locator('.skill-card')).toHaveCount(4)
})

test('plays a full session and reaches the results screen', async ({ page }) => {
  await page.goto('/')
  await page.locator('.skill-card', { hasText: 'Spot the Fraction' }).click()

  await expect(page.locator('.play-title')).toContainText('Spot the Fraction')
  await expect(page.locator('.qcount')).toContainText('1/10')

  await playFullSession(page)

  await expect(page.locator('.results')).toBeVisible()
  await expect(page.locator('.medal')).toBeVisible()
  await expect(page.getByRole('button', { name: /Play again/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Home/ })).toBeVisible()
})

test('progress persists across a reload', async ({ page }) => {
  await page.goto('/')
  await page.locator('.skill-card', { hasText: 'Bigger or Smaller' }).click()
  await playFullSession(page)
  await expect(page.locator('.results')).toBeVisible()

  await page.reload()
  // 10 answered this session should be reflected on the home strip after reload.
  await expect(page.locator('.strip')).toContainText('Answered: 10')
})

test('Smart Start launches a session for the focus skill', async ({ page }) => {
  await page.goto('/') // fresh storage -> focus skill is the first one (identify)
  await page.locator('.smart-start').click()
  await expect(page.locator('.play-title')).toContainText('Spot the Fraction')
  await expect(page.locator('.prompt')).toBeVisible()
})

test('numpad input works at higher tiers', async ({ page }) => {
  // Seed a tier-3 Add & Subtract level before the app boots so the first
  // problem uses typed (numpad) input rather than multiple choice.
  await page.addInitScript(
    ([key]) => {
      localStorage.setItem(
        key,
        JSON.stringify({ version: 1, skills: { addsub: { tier: 3, total: 0, correct: 0, bestStreak: 0 } } }),
      )
    },
    [STORAGE_KEY],
  )
  await page.goto('/')
  await page.locator('.skill-card', { hasText: 'Add & Subtract' }).click()

  await expect(page.locator('.numpad')).toBeVisible()
  await page.locator('.np-key', { hasText: /^1$/ }).click()
  await page.locator('.np-slot').nth(1).click()
  await page.locator('.np-key', { hasText: /^2$/ }).click()
  await page.locator('.np-check').click()

  // Either outcome is fine — we're confirming the numpad submits and grades.
  await expect(page.locator('.feedback')).toBeVisible()
  await expect(page.locator('.next')).toBeVisible()
})
