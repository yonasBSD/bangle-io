import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { defaultPlugins, defaultSpecs } from '@bangle.dev/all-base-components';

import { EditorDisplayType } from '@bangle.io/constants';
import {
  Extension,
  ExtensionRegistry,
  useExtensionRegistryContext,
} from '@bangle.io/extension-registry';
import { getEditorPluginMetadataReturn } from '@bangle.io/test-utils/function-mock-return';
import { getEditorPluginMetadata, sleep } from '@bangle.io/utils';
import { useWorkspaceContext } from '@bangle.io/workspace-context';

import inlineBackLinkExtension from '..';
import { BackLinkNode } from '../editor/BackLinkNode';

jest.mock('@bangle.io/workspace-context', () => {
  return {
    ...jest.requireActual('@bangle.io/workspace-context'),
    useWorkspaceContext: jest.fn(),
  };
});

jest.mock('@bangle.io/utils', () => {
  return {
    ...jest.requireActual('@bangle.io/utils'),
    getEditorPluginMetadata: jest.fn(),
  };
});

jest.mock('@bangle.io/extension-registry', () => {
  const actual = jest.requireActual('@bangle.io/extension-registry');
  return {
    ...actual,
    useExtensionRegistryContext: jest.fn(),
  };
});

const coreExtension = Extension.create({
  name: 'bangle-io-core',
  editor: {
    specs: defaultSpecs(),
    plugins: defaultPlugins(),
  },
});

const extensionRegistry = new ExtensionRegistry([
  coreExtension,
  inlineBackLinkExtension,
]);

let editorView: any = { state: {} };

const getEditorPluginMetadataMock =
  getEditorPluginMetadata as jest.MockedFunction<
    typeof getEditorPluginMetadata
  >;

describe('BackLinkNode', () => {
  let pushWsPathMock = jest.fn();
  let createNote;

  beforeEach(() => {
    createNote = jest.fn(async () => {});
    pushWsPathMock = jest.fn();
    (useWorkspaceContext as any).mockImplementation(() => ({
      wsName: 'test-ws',
      pushWsPath: pushWsPathMock,
      noteWsPaths: [],
      createNote,
    }));

    (useExtensionRegistryContext as any).mockImplementation(() => {
      return extensionRegistry;
    });

    getEditorPluginMetadataMock.mockImplementation(() => ({
      ...getEditorPluginMetadataReturn,
      wsPath: 'test-ws:my-current-note.md',
      editorDisplayType: EditorDisplayType.Page,
    }));
  });

  test('renders correctly', async () => {
    (useWorkspaceContext as any).mockImplementation(() => {
      return {
        wsName: 'test-ws',
        pushWsPath: pushWsPathMock,
        noteWsPaths: ['test-ws:some/path.md'],
        createNote,
      };
    });

    const renderResult = render(
      <BackLinkNode
        nodeAttrs={{ path: 'some/path', title: undefined }}
        view={editorView}
      />,
    );

    expect(renderResult.container).toMatchInlineSnapshot(`
      <div>
        <button
          class="inline-backlink_backlink"
          draggable="false"
        >
          <svg
            class="inline-block"
            stroke="currentColor"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10,5.5V1H3.5a.5.5,0,0,0-.5.5v15a.5.5,0,0,0,.5.5h11a.5.5,0,0,0,.5-.5V6H10.5A.5.5,0,0,1,10,5.5Z"
            />
            <path
              d="M11,1h.043a.5.5,0,0,1,.3535.1465l3.457,3.457A.5.5,0,0,1,15,4.957V5H11Z"
            />
          </svg>
          <span
            class="inline"
          >
            some/path
          </span>
        </button>
      </div>
    `);
  });

  test('renders title if it exists', async () => {
    (useWorkspaceContext as any).mockImplementation(() => {
      return {
        wsName: 'test-ws',
        pushWsPath: pushWsPathMock,
        noteWsPaths: ['test-ws:some/path.md'],
        createNote,
      };
    });

    const renderResult = render(
      <BackLinkNode
        nodeAttrs={{ path: 'some/path', title: 'monako' }}
        view={editorView}
      />,
    );

    expect(renderResult.container).toMatchInlineSnapshot(`
      <div>
        <button
          class="inline-backlink_backlink"
          draggable="false"
        >
          <svg
            class="inline-block"
            stroke="currentColor"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10,5.5V1H3.5a.5.5,0,0,0-.5.5v15a.5.5,0,0,0,.5.5h11a.5.5,0,0,0,.5-.5V6H10.5A.5.5,0,0,1,10,5.5Z"
            />
            <path
              d="M11,1h.043a.5.5,0,0,1,.3535.1465l3.457,3.457A.5.5,0,0,1,15,4.957V5H11Z"
            />
          </svg>
          <span
            class="inline"
          >
            monako
          </span>
        </button>
      </div>
    `);
  });

  test('styles not found notes differently', async () => {
    (useWorkspaceContext as any).mockImplementation(() => {
      return {
        wsName: 'test-ws',
        pushWsPath: pushWsPathMock,
        noteWsPaths: [],
        createNote,
      };
    });

    const renderResult = render(
      <BackLinkNode
        nodeAttrs={{ path: 'some/path', title: 'monako' }}
        view={editorView}
      />,
    );

    expect(renderResult.container.innerHTML).toContain(
      'inline-backlink_backlinkNotFound',
    );

    expect(renderResult.container).toMatchInlineSnapshot(`
      <div>
        <button
          class="inline-backlink_backlink inline-backlink_backlinkNotFound"
          draggable="false"
        >
          <svg
            class="inline-block"
            stroke="currentColor"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10,5.5V1H3.5a.5.5,0,0,0-.5.5v15a.5.5,0,0,0,.5.5h11a.5.5,0,0,0,.5-.5V6H10.5A.5.5,0,0,1,10,5.5Z"
            />
            <path
              d="M11,1h.043a.5.5,0,0,1,.3535.1465l3.457,3.457A.5.5,0,0,1,15,4.957V5H11Z"
            />
          </svg>
          <span
            class="inline"
          >
            monako
          </span>
        </button>
      </div>
    `);
  });

  describe('clicking', () => {
    const clickSetup = async (
      { path, title = 'monako' }: { path: string; title?: string },
      clickOpts?: Parameters<typeof fireEvent.click>[1],
    ) => {
      const renderResult = render(
        <BackLinkNode
          nodeAttrs={{ path, title: 'monako' }}
          view={editorView}
        />,
      );
      const prom = sleep();
      fireEvent.click(renderResult.getByText(/monako/i), clickOpts);

      // wait for the promise in click to resolve
      await act(() => prom);
      return renderResult;
    };

    test('clicks correctly when there is a match', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          noteWsPaths: ['test-ws:magic/some/path.md'],
          createNote,
        };
      });

      // wait for the promise in click to resolve
      await clickSetup({ path: 'magic/some/path' });

      expect(createNote).toBeCalledTimes(0);

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(
        1,
        'test-ws:magic/some/path.md',
        false,
        false,
      );
    });

    test('picks the top most when there are two matches match', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          noteWsPaths: [
            'test-ws:magic/note1.md',
            'test-ws:magic/some/note1.md',
          ],
          createNote,
        };
      });

      await clickSetup({ path: 'note1' });
      expect(createNote).toBeCalledTimes(0);

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(
        1,
        'test-ws:magic/note1.md',
        false,
        false,
      );
    });

    test('doesnt add md if already there', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          noteWsPaths: [
            'test-ws:magic/note1.md',
            'test-ws:magic/some/note1.md',
          ],
          createNote,
        };
      });

      await clickSetup({ path: 'note1.md' });

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(
        1,
        'test-ws:magic/note1.md',
        false,
        false,
      );
    });

    test('picks the least nested when there are three matches match', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          noteWsPaths: [
            'test-ws:magic/some-place/hotel/note1.md',
            'test-ws:magic/some/note1.md',
            'test-ws:magic/some-other/place/dig/note1.md',
          ],
          createNote,
        };
      });

      await clickSetup({ path: 'note1' });
      expect(createNote).toBeCalledTimes(0);

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(
        1,
        'test-ws:magic/some/note1.md',
        false,
        false,
      );
    });

    test('fall backs to  case insensitive if no case sensitive match', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          noteWsPaths: ['test-ws:magic/note1.md'],
          createNote,
        };
      });

      await clickSetup({ path: 'Note1' });
      expect(createNote).toBeCalledTimes(0);

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(
        1,
        'test-ws:magic/note1.md',
        false,
        false,
      );
    });

    test('Get the exact match if it exists', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          noteWsPaths: ['test-ws:magic/NoTe1.md', 'test-ws:note1.md'],
          createNote,
        };
      });

      await clickSetup({ path: 'NoTe1' });

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(
        1,
        'test-ws:magic/NoTe1.md',
        false,
        false,
      );
    });

    test("doesn't confuse if match ends with same", async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          createNote,
          noteWsPaths: [
            'test-ws:magic/some-place/hotel/something-note1.md',
            'test-ws:magic/some-other/place/dig/some-else-note1.md',
          ],
        };
      });

      await clickSetup({ path: 'note1' });

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(1, 'test-ws:note1.md', false, false);
    });

    test('doesnt confuse if a subdirectory path match partially matches 1', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          noteWsPaths: [
            'test-ws:magic/some-place/hotel/note1.md',
            'test-ws:magic/some-other/place/dig/some-else-note1.md',
          ],
          createNote,
        };
      });

      // notice the `tel` and `hotel`
      await clickSetup({ path: 'tel/note1' });

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(
        1,
        'test-ws:tel/note1.md',
        false,
        false,
      );
    });

    test('doesnt confuse if a subdirectory path match partially matches 2', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          createNote,
          noteWsPaths: [
            'test-ws:magic/some-place/hotel/note1.md',
            'test-ws:magic/tel/note1.md',
          ],
        };
      });

      await clickSetup({ path: 'tel/note1' });

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(
        1,
        'test-ws:tel/note1.md',
        false,
        false,
      );
    });

    test('matches file name', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          createNote,
          noteWsPaths: [
            'test-ws:magic/some-place/hotel/note1.md',
            'test-ws:magic/tel/note1.md',
          ],
        };
      });

      await clickSetup({ path: 'note1' });

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(
        1,
        'test-ws:magic/tel/note1.md',
        false,
        false,
      );
    });

    test('if no file name match', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          createNote,
          noteWsPaths: [
            'test-ws:magic/some-place/hotel/note1.md',
            'test-ws:magic/tel/note1.md',
          ],
        };
      });

      await clickSetup({ path: 'note2' });

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(1, 'test-ws:note2.md', false, false);
    });

    test('opens sidebar on shift click', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          createNote,
          noteWsPaths: [
            'test-ws:magic/some-place/hotel/note1.md',
            'test-ws:magic/some/note1.md',
            'test-ws:magic/some-other/place/dig/note1.md',
          ],
        };
      });

      await clickSetup({ path: 'note1' }, { shiftKey: true });

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(
        1,
        'test-ws:magic/some/note1.md',
        false,
        true,
      );
    });

    test('opens new tab on shift click', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          createNote,
          noteWsPaths: [
            'test-ws:magic/some-place/hotel/note1.md',
            'test-ws:magic/some/note1.md',
            'test-ws:magic/some-other/place/dig/note1.md',
          ],
        };
      });

      await clickSetup({ path: 'note1' }, { metaKey: true });

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(
        1,
        'test-ws:magic/some/note1.md',
        true,
        false,
      );
    });

    test('no click if path validation fails', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          noteWsPaths: ['test-ws:magic/some/note1.md'],
          createNote,
        };
      });

      const renderResult = await clickSetup({ path: 'note:#:.s2:1' });

      expect(pushWsPathMock).toBeCalledTimes(0);
      expect(renderResult.container.innerHTML).toContain(
        `Invalid link (monako)`,
      );
      expect(renderResult.container).toMatchSnapshot();
    });
    test('if no match still clicks', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          createNote,
          noteWsPaths: [
            'test-ws:magic/some-place/hotel/note1.md',
            'test-ws:magic/some/note1.md',
            'test-ws:magic/some-other/place/dig/note1.md',
          ],
        };
      });

      await clickSetup({ path: 'note2' });

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(1, 'test-ws:note2.md', false, false);
    });

    test('if no match still clicks 2', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          createNote,
          noteWsPaths: [
            'test-ws:magic/some-place/hotel/note1.md',
            'test-ws:magic/some/note1.md',
            'test-ws:magic/some-other/place/dig/note1.md',
          ],
        };
      });

      await clickSetup({ path: 'some-place/note2' });

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(
        1,
        'test-ws:some-place/note2.md',
        false,
        false,
      );
    });

    test('matches if path follows local file system style', async () => {
      getEditorPluginMetadataMock.mockImplementation(() => {
        return {
          ...getEditorPluginMetadataReturn,
          wsPath: 'test-ws:magic/hello/beautiful/world.md',
          editorDisplayType: EditorDisplayType.Popup,
        };
      });

      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          createNote,
          noteWsPaths: [
            'test-ws:magic/some-place/hotel/note1.md',
            'test-ws:magic/some/note2.md',
            'test-ws:magic/hello/beautiful/world.md',
            'test-ws:magic/note2.md',
          ],
        };
      });

      await clickSetup({ path: '../note2' });

      expect(createNote).toBeCalledTimes(0);

      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(
        1,
        'test-ws:magic/hello/note2.md',
        false,
        false,
      );
    });

    test('if no match creates note', async () => {
      (useWorkspaceContext as any).mockImplementation(() => {
        return {
          wsName: 'test-ws',
          pushWsPath: pushWsPathMock,
          createNote,
          noteWsPaths: [
            'test-ws:magic/some-place/hotel/note1.md',
            'test-ws:magic/some/note1.md',
            'test-ws:magic/some-other/place/dig/note1.md',
          ],
        };
      });

      await clickSetup({ path: 'note2' });

      expect(createNote).toBeCalledTimes(1);
      expect(createNote).nthCalledWith(
        1,
        extensionRegistry,
        'test-ws:note2.md',
        {
          open: false,
        },
      );
      expect(pushWsPathMock).toBeCalledTimes(1);
      expect(pushWsPathMock).nthCalledWith(1, 'test-ws:note2.md', false, false);
    });
  });
});
