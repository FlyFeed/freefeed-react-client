/* global describe, it, expect, vi */
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import SignInPage from '../../src/components/settings/sign-in';
import * as actionCreators from '../../src/redux/action-creators';
import { StateProvider } from './state-provider';

vi.mock('../../src/components/prevent-page-leaving', () => {
  return {
    PreventPageLeaving: () => null,
  };
});

const defaultState = {
  user: {
    id: 'user-id',
    username: 'user1',
    email: 'email@example.com',
  },
  extAuth: {
    providers: [],
    profiles: [],
    profilesStatus: {},
  },
  serverInfoStatus: {},
  settingsForms: {
    updatePasswordStatus: {},
  },
};

const renderSignInPage = (state = defaultState) => {
  return render(
    <StateProvider state={state}>
      <SignInPage />
    </StateProvider>,
  );
};

describe('SignInPage', () => {
  it('Renders sign-in settings page', () => {
    const { asFragment } = renderSignInPage();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Updates user password', async () => {
    const currentPassword = 'current';
    const newPassword = 'newpassword123';

    const updatePasswordMock = vi.spyOn(actionCreators, 'updatePassword');
    renderSignInPage();

    await userEvent.type(screen.getByLabelText('Current password'), currentPassword);
    await userEvent.type(screen.getByLabelText('New password'), newPassword);
    await userEvent.type(screen.getByLabelText('Confirm password'), newPassword);
    await userEvent.click(screen.getByText('Update password'));
    expect(updatePasswordMock).toHaveBeenCalledTimes(1);
    expect(updatePasswordMock).toHaveBeenCalledWith({
      currentPassword,
      password: newPassword,
      passwordConfirmation: newPassword,
    });
  });
});
