const os = require('os');
const prettier = require('prettier');
const { filePathToWsPath, resolvePath } = require('ws-path');
const ctrlKey = os.platform() === 'darwin' ? 'Meta' : 'Control';
const url = 'http://localhost:1234';
function sleep(t = 10) {
  return new Promise((res) => setTimeout(res, t));
}

function longSleep(t = 50) {
  return new Promise((res) => setTimeout(res, t));
}

function frmtHTML(doc) {
  return prettier.format(doc, {
    semi: false,
    parser: 'html',
    printWidth: 36,
    singleQuote: true,
  });
}

const SELECTOR_TIMEOUT = 500;

async function createWorkspace(page, wsName = 'test' + uuid(4)) {
  await runAction(page, '@action/core-actions/NEW_WORKSPACE_ACTION');
  let handle = await page.waitForSelector('.universal-palette-container', {
    timeout: SELECTOR_TIMEOUT,
  });

  await clickPaletteRow(page, 'browser');

  const input = await handle.$('input');
  await input.type(wsName, { delay: 10 });

  await longSleep();

  await Promise.all([
    page.waitForNavigation({
      timeout: 5000,
      waitUntil: 'networkidle0',
    }), // The promise resolves after navigation has finished
    clickPaletteRow(page, 'input-confirm'),
  ]);

  expect(await page.url()).toMatch(url + '/ws/' + wsName);

  return wsName;
}

async function newPage(browser) {
  const page = await browser.newPage();
  const handleError = (error) => {
    process.emit('uncaughtException', error);
  };
  page.on('error', handleError);
  page.on('pageerror', handleError);
  return {
    page: page,
    destroyPage: async () => {
      page.off('error', handleError);
      page.off('pageerror', handleError);
      await page.close();
    },
  };
}
async function createNewNote(page, wsName, noteName = 'new_file.md') {
  await runAction(page, '@action/core-actions/NEW_NOTE_ACTION');
  let handle = await page.waitForSelector('.universal-palette-container', {
    timeout: SELECTOR_TIMEOUT,
  });
  if (!noteName.endsWith('.md')) {
    noteName += '.md';
  }
  const input = await handle.$('input');
  await input.type(noteName);

  await Promise.all([
    page.waitForNavigation({
      timeout: 5000,
      waitUntil: 'networkidle0',
    }),
    clickPaletteRow(page, 'input-confirm'),
  ]);

  await longSleep();
  const wsPath = filePathToWsPath(wsName, noteName);
  expect(await page.url()).toMatch(url + resolvePath(wsPath).locationPath);

  return wsPath;
}

async function runAction(page, actionId) {
  await page.keyboard.press('Escape');
  await page.keyboard.down(ctrlKey);
  await page.keyboard.down('Shift');
  await page.keyboard.press('P');
  await page.keyboard.up('Shift');
  await page.keyboard.up(ctrlKey);

  await clickPaletteRow(page, actionId);
}

async function clickPaletteRow(page, id) {
  const result = await page.waitForSelector(
    `.universal-palette-item[data-id="${id}"]`,
    {
      timeout: SELECTOR_TIMEOUT,
    },
  );
  await result.click();
}

async function sendCtrlABackspace(page) {
  await sleep();
  await page.keyboard.down(ctrlKey);
  await page.keyboard.press('a', { delay: 30 });
  await page.keyboard.up(ctrlKey);
  await page.keyboard.press('Backspace', { delay: 30 });
  await sleep();
}

async function getEditorHTML(editorHandle) {
  return await frmtHTML(await editorHandle.evaluate((node) => node.innerHTML));
}

async function getPrimaryEditorHandler(page, { focus = false } = {}) {
  const handle = await page.waitForSelector('.primary-editor', {
    timeout: SELECTOR_TIMEOUT,
  });

  await page.waitForSelector('.primary-editor .bangle-editor', {
    timeout: SELECTOR_TIMEOUT,
  });

  if (focus) {
    await page.evaluate(async () => {
      window.primaryEditor.view.focus();
    });
  }

  return handle;
}

async function getSecondaryEditorHandler(page, { focus = false } = {}) {
  const handle = await page.waitForSelector('.secondary-editor', {
    timeout: SELECTOR_TIMEOUT,
  });

  if (focus) {
    await page.evaluate(async () => {
      window.primaryEditor.view.focus();
    });
  }
  return handle;
}

async function getPrimaryEditorDebugString(page) {
  return page.evaluate(async () =>
    window.primaryEditor?.view.state.doc.toString(),
  );
}

async function getSecondaryEditorDebugString(page) {
  return page.evaluate(async () =>
    window.secondaryEditor?.view.state.doc.toString(),
  );
}

async function setPageWidescreen(page) {
  await page.setViewport({ width: 1024, height: 768 });
}
async function setPageSmallscreen(page) {
  await page.setViewport({ width: 400, height: 768 });
}

function uuid(len = 10) {
  return Math.random().toString(36).substring(2, 15).slice(0, len);
}

async function getWsPathsShownInFilePalette(page) {
  await page.keyboard.press('Escape');
  await page.keyboard.down(ctrlKey);
  await page.keyboard.press('p');
  await page.keyboard.up(ctrlKey);

  const handle = await page.waitForSelector('.universal-palette-container', {
    timeout: SELECTOR_TIMEOUT,
  });

  const wsPaths = await handle.$$eval(
    `.universal-palette-item[data-id]`,
    (nodes) => [...nodes].map((n) => n.getAttribute('data-id')),
  );

  await page.keyboard.press('Escape');

  return wsPaths;
}

module.exports = {
  clickPaletteRow,
  createNewNote,
  createWorkspace,
  ctrlKey,
  frmtHTML,
  getEditorHTML,
  getPrimaryEditorDebugString,
  getPrimaryEditorHandler,
  getSecondaryEditorDebugString,
  getSecondaryEditorHandler,
  getWsPathsShownInFilePalette,
  longSleep,
  newPage,
  runAction,
  SELECTOR_TIMEOUT,
  sendCtrlABackspace,
  setPageSmallscreen,
  setPageWidescreen,
  sleep,
  url,
  uuid,
};
