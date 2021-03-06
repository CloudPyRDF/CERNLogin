import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ToolbarButton } from '@jupyterlab/apputils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';

import { IDisposable } from '@lumino/disposable';

import { ServerConnection } from '@jupyterlab/services';

import { URLExt } from '@jupyterlab/coreutils';

const dialogHTML = `
  <h1 id="cern-login-dialog-title">Login using CERN credentials</h1>
  <button type="button" class="cern-login-action-button" id="cern-login-close-button">
    <span class="material-icons-outlined">
      close
    </span>
  </button>
  <form id="cern-login-form">
    <label for="login">Login</label>
    <input type="text" id="cern-login-login" name="login" autofocus>
    <label for="password">Password</label>
    <input type="password" id="cern-login-password" name="password">
    <button type="button" id="cern-login-submit-button">
      Sign in
    </button>
  </form>
  `;

export enum SignInResult {
  SUCCESS = 'SUCCESS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TIMEOUT = 'TIMEOUT'
}

export class CERNLoginExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  shadowBox: HTMLDivElement | undefined;

  dialog: HTMLDialogElement | undefined;

  dialogOpened = false;

  login = '';

  password = '';

  toolbarButton: ToolbarButton | undefined;

  label ="CERN Login";

  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    this.dialogOpened = false;

    this.toolbarButton = new ToolbarButton({
      label: this.label,
      onClick: () => this.openDialog()
    });

    this.changeLoginStatus();

    panel.toolbar.addItem('loginButton', this.toolbarButton);

    this.addIconLink();

    this.addSnackbar();

    return this.toolbarButton;
  }

  changeLoginStatus(): void {
    if(this.toolbarButton) {
      if(this.toolbarButton?.hasClass('status-inactive')) {
        this.toolbarButton.removeClass('status-inactive')
        this.toolbarButton.addClass('status-active');
      } else {
        this.toolbarButton.removeClass('status-active')
        this.toolbarButton.addClass('status-inactive');
      }
    }
  }

  addIconLink(): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined';
    document.head.appendChild(link);
  }

  async sendSetRequest(): Promise<any> {
    const settings = ServerConnection.makeSettings({});
    const serverResponse = await ServerConnection.makeRequest(
      URLExt.join(settings.baseUrl, '/CERNLogin'),
      {
        method: 'PUT',
        body: JSON.stringify({ login: this.login, password: this.password })
      },
      settings
    );
    return serverResponse.json();
  }

  async sendGetRequest(): Promise<any> {
    const settings = ServerConnection.makeSettings({});
    const serverResponse = await ServerConnection.makeRequest(
      URLExt.join(settings.baseUrl, '/CERNLogin'),
      {
        method: 'GET'
      },
      settings
    );
    const response = serverResponse.json();
    console.log(response);
    return response;
  }

  openDialog(): void {
    if (!this.dialogOpened) {
      this.shadowBox = document.createElement('div');
      this.shadowBox.id = 'cern-login-shadow-box';

      this.dialog = document.createElement('dialog');
      this.dialog.innerHTML = dialogHTML;

      this.dialog.id = 'cern-login-dialog';

      this.shadowBox.appendChild(this.dialog);
      document.body.appendChild(this.shadowBox);

      document
        .getElementById('cern-login-close-button')
        ?.addEventListener('click', () => this.closeDialog());

      document
        .getElementById('cern-login-submit-button')
        ?.addEventListener('click', () => this.submitData());

      this.setData();

      this.dialog.show();
      this.dialogOpened = true;
    }
  }

  setData(): void {
    if (this.login && this.password) {
      (<HTMLInputElement>document.getElementById('cern-login-login')).value =
        this.login;
      (<HTMLInputElement>document.getElementById('cern-login-password')).value =
        this.password;
    }
  }

  saveData(): void {
    this.login = (<HTMLInputElement>(
      document.getElementById('cern-login-login')
    )).value;
    this.password = (<HTMLInputElement>(
      document.getElementById('cern-login-password')
    )).value;
  }

  submitData(): void {
    this.saveData();

    if (this.login.trim() !== '' && this.password.trim() !== '') {
      this.sendSetRequest().then(response => {
        this.closeDialog();
        this.handleResponse(response);
      });
    }
  }

  handleResponse(response: any): void {
    const result = response['status'] as SignInResult;
    if (result === SignInResult.SUCCESS) {
      if (this.toolbarButton) {
        this.toolbarButton.removeClass('status-inactive');
        this.toolbarButton.addClass('status-active');
      }
    }
    this.setSnackbarAttributes(result);
    this.showSnackbar();
  }

  closeDialog(): void {
    this.saveData();

    if (this.dialogOpened) {
      const shadowBox = document.getElementById('cern-login-shadow-box');
      if (shadowBox !== null) {
        document.body.removeChild(shadowBox);
        this.dialogOpened = false;
      }
    }
  }

  addSnackbar(): void {
    const snackbar = document.createElement('div');
    snackbar.id = 'cern-login-snackbar';
    snackbar.innerHTML = '';
    document.body.appendChild(snackbar);
  }

  getSnackbarIconAndText(result: SignInResult): [string, string] {
    switch (result) {
      case SignInResult.SUCCESS:
        return ['check', 'Successfully signed in'];
      case SignInResult.INVALID_CREDENTIALS:
        return ['error', 'Error: invalid credentials'];
      case SignInResult.TIMEOUT:
        return ['warning', 'Error: process timed out'];
    }
  }

  setSnackbarAttributes(result: SignInResult): void {
    const [iconName, text] = this.getSnackbarIconAndText(result);
    const snackbar = document.getElementById('cern-login-snackbar');
    if (snackbar !== null) {
      snackbar.innerHTML = `
      <span class="material-icons-outlined">
        ${iconName}
      </span>
      <p>
        ${text}
      </p>
    `;
    }
  }

  showSnackbar(): void {
    const snackbar = document.getElementById('cern-login-snackbar');
    if (snackbar !== null) {
      snackbar.className = 'show';
      setTimeout(() => {
        snackbar.className = snackbar.className.replace('show', '');
      }, 3000);
    }
  }
}

/**
 * Initialization data for the CERNLogin extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'CERNLogin:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension CERNLogin is activated!');
    const loginExtension = new CERNLoginExtension();
    app.docRegistry.addWidgetExtension('Notebook', loginExtension);
  }
};

export default extension;
