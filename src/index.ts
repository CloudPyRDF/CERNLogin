import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the CERNLogin extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'CERNLogin:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension CERNLogin is activated!');
  }
};

export default plugin;
