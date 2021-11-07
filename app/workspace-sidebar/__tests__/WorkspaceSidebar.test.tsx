import { render } from '@testing-library/react';
import React from 'react';

import { WorkspaceSidebar } from '../WorkspaceSidebar';

let originalConsoleError = console.error;

beforeEach(() => {
  console.error = originalConsoleError;
});

test('handles error', () => {
  // silencing the error from polluting the logging
  console.error = jest.fn();
  let result = render(
    <div>
      <WorkspaceSidebar
        sidebar={{
          name: 'sidebar::test-sidebar',
          title: 'search notes',
          activitybarIcon: <span>test-icon</span>,
          ReactComponent: () => {
            throw new Error('Blah blah');
            return <span>something</span>;
          },
          hint: 'test-hint',
        }}
      ></WorkspaceSidebar>
    </div>,
  );
  expect(result.container.innerHTML).toContain('Blah blah');
});

test('renders', () => {
  let result = render(
    <div>
      <WorkspaceSidebar
        sidebar={{
          name: 'sidebar::test-sidebar',
          title: 'search notes',
          activitybarIcon: <span>test-icon</span>,
          ReactComponent: () => {
            return <span>something</span>;
          },
          hint: 'test-hint',
        }}
      ></WorkspaceSidebar>
    </div>,
  );

  expect(result.container.innerHTML).toContain('something');
  expect(result.container).toMatchSnapshot();
});
