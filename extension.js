/**
 * Desc: this extension "fixes" the dash's default behavior when you 
 *       middle-click on an icon. The default is to launch the app on a new
 *       workspace. This extension changes that to launching on the
 *       current workspace.
 * 
 * Author: Gabriel Rossetti & Chris Irwin & Romain Failliot
 * Date: 2012-07-28
 * Version: 1.0
 *
 * Gabriel Rossetti wrote the original patch to change left-click behaviour.
 * Chris Irwin modified it to change middle-click behaviour instead.
 * Romain Failliot modified it to make it compatible with GNOME Shell 3.4,
 * and inverted the Ctrl-click/middle-click behavior.
 *
 * Original can be found here:
 *  - https://github.com/grossetti/Gnome-Shell-Extensions
 *  - https://extensions.gnome.org/extension/67/dash-click-fix/
 *
 * Chris Irwin's version can be found here:
 *  - https://gitorious.org/chrisirwin-utils/newinstancecurrentworkspace
 *  - https://extensions.gnome.org/extension/127/new-instance-on-current-workspace/
 *
 * This version can be found here:
 *  - https://gitorious.org/~herrbean/chrisirwin-utils/herrbeans-newinstancecurrentworkspace
 */
const Main = imports.ui.main;
const AppDisplay = imports.ui.appDisplay;
const Clutter = imports.gi.Clutter;


var _originalClicked = null;
var _originalActivate = null;

/**
 * The new version of the function, this always lanches a new version of 
 * the app regardless of if it is already running or not.
 * 
 * @param event the current event
 */
function _onClicked(actor, button) {
    this._removeMenuTimeout();

    global.log('[DEBUG] onClicked');
    if (button == 1) {
        this._onActivate(Clutter.get_current_event());
    }
    else if (button == 2) {
        // Launch on current workspace.
        this.emit('launching');
        this.app.open_new_window(-1);
        Main.overview.hide();
    }   
    return false;
}

function _onActivate(event) {
    this.emit('launching');
    let modifiers = event.get_state();

    global.log('[DEBUG] onActivate');
    if (this._onActivateOverride) {
        this._onActivateOverride(event);
    } else {
        global.log('[DEBUG] normal activation');
        if (modifiers & Clutter.ModifierType.CONTROL_MASK
            && this.app.state == Shell.AppState.RUNNING) {
            this.app.open_new_window(-1);
        } else {
            this.app.activate();
        }
    }
    Main.overview.hide();
}

/**
 * Initialize the extension
 */
function init() {
  _originalClicked = AppDisplay.AppWellIcon.prototype._onClicked;
  _originalActivate = AppDisplay.AppWellIcon.prototype._onActivate;
}

/**
 * Enable the extension
 */
function enable() {
  AppDisplay.AppWellIcon.prototype._onClicked = _onClicked;
  AppDisplay.AppWellIcon.prototype._onActivate = _onActivate;
}

/**
 * Disable the extension
 */
function disable() {
  AppDisplay.AppWellIcon.prototype._onClicked = _originalClicked;
  AppDisplay.AppWellIcon.prototype._onActivate = _originalActivate;
}
