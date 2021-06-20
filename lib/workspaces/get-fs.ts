import { HELP_DOCS_VERSION } from 'config/index';

import {
  IndexedDBFileSystem,
  NativeBrowserFileSystem,
  GithubReadFileSystem,
  HelpFileSystem,
} from 'baby-fs/index';
import { HELP_FS_WORKSPACE_TYPE, WorkspaceInfo } from './types';

const allowedFile = (name: string) => {
  return name.endsWith('.md') || name.endsWith('.png');
};

export const getFileSystemFromWsInfo = (wsInfo: WorkspaceInfo) => {
  if (wsInfo.type === 'browser') {
    return new IndexedDBFileSystem();
  }

  if (wsInfo.type === 'github-read-fs') {
    return new GithubReadFileSystem({
      githubToken:
        new URLSearchParams(window.location.search).get('github_token') ||
        localStorage.getItem('github_token'),
      githubOwner: wsInfo.metadata.githubOwner,
      githubRepo: wsInfo.metadata.githubRepo,
      githubBranch: wsInfo.metadata.githubBranch,
      allowedFile,
    });
  }

  if (wsInfo.type === 'nativefs') {
    const rootDirHandle = wsInfo.metadata.rootDirHandle;
    return new NativeBrowserFileSystem({
      rootDirHandle: rootDirHandle,
      allowedFile: (fileHandle) => allowedFile(fileHandle.name),
    });
  }

  if (wsInfo.type === HELP_FS_WORKSPACE_TYPE) {
    return new HelpFileSystem({
      allowLocalChanges: wsInfo.metadata.allowLocalChanges ?? true,
      helpDocsVersion: HELP_DOCS_VERSION,
    });
  }

  throw new Error('Unknown workspace type ' + wsInfo.type);
};
