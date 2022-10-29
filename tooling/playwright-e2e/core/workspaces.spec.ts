import { expect } from '@playwright/test';

import { withBangle as test } from '../fixture-with-bangle';
import {
  clickItemInPalette,
  createNewNote,
  createWorkspace,
  getItemsInPalette,
  getPrimaryEditorHandler,
  getWsPathsShownInFilePalette,
  openWorkspacePalette,
  runOperation,
  sleep,
  waitForNotification,
} from '../helpers';

test.beforeEach(async ({ bangleApp }, testInfo) => {
  await bangleApp.open();
});

test.describe('workspaces', () => {
  test('Create a new workspace when already in a workspace and go back', async ({
    page,
    baseURL,
  }) => {
    const wsName1 = await createWorkspace(page);
    const n1 = await createNewNote(page, wsName1, 'file-1');
    const n2 = await createNewNote(page, wsName1, 'file-2');

    const wsPathsOfWsName1 = await getWsPathsShownInFilePalette(page);
    expect(wsPathsOfWsName1).toEqual([n2, n1]);

    await createWorkspace(page);

    const wsPathsOfWsName2 = await getWsPathsShownInFilePalette(page);
    expect(wsPathsOfWsName2).toEqual([]);
    await page.goBack({ waitUntil: 'networkidle' });

    await expect(page).toHaveURL(new RegExp('/ws/' + wsName1));

    await getPrimaryEditorHandler(page);

    expect((await getWsPathsShownInFilePalette(page)).sort()).toEqual(
      [n2, n1].sort(),
    );
  });

  test('switching a workspace using the palette', async ({ page, baseURL }) => {
    test.slow();
    const wsName1 = await createWorkspace(page);
    await createNewNote(page, wsName1, 'file-1');

    const wsName2 = await createWorkspace(page);

    await expect(page).toHaveURL(new RegExp(wsName2));

    await sleep();

    await openWorkspacePalette(page);

    const result = (await getItemsInPalette(page, { hasItems: true })).sort();

    expect(result).toEqual([`bangle-help`, wsName2, wsName1].sort());

    await Promise.all([
      page.waitForNavigation(),
      clickItemInPalette(page, wsName2),
    ]);

    await expect(page).toHaveURL(new RegExp(wsName2));
  });

  test('persists workspaces after reload', async ({ page }) => {
    const wsName1 = await createWorkspace(page);
    const wsName2 = await createWorkspace(page);
    const wsName3 = await createWorkspace(page);

    await sleep();

    await page.reload({ timeout: 8000, waitUntil: 'load' });

    await page.getByText(wsName3).waitFor();

    await openWorkspacePalette(page);

    const result = (await getItemsInPalette(page, { hasItems: true })).sort();

    expect(result).toEqual([`bangle-help`, wsName3, wsName2, wsName1].sort());
  });

  test('deleting workspace works', async ({ page }) => {
    const wsName1 = await createWorkspace(page);
    const wsName2 = await createWorkspace(page);

    await sleep();

    page.on('dialog', (dialog) => dialog.accept());

    await Promise.all([
      page.waitForNavigation(),
      runOperation(
        page,
        'operation::@bangle.io/core-extension:REMOVE_ACTIVE_WORKSPACE',
      ),
    ]);

    await waitForNotification(page, `Successfully removed ${wsName2}`);

    await expect(page).toHaveURL(new RegExp(`/landing`));

    await sleep();
    await openWorkspacePalette(page);

    const result = (await getItemsInPalette(page, { hasItems: true })).sort();

    expect(result).toEqual([`bangle-help`, wsName1].sort());
  });
});
