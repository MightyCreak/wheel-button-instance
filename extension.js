/**
 * Desc: this extension "fixes" the dash's default behavior when you 
 *       middle-click on an icon. The default is to launch the app on a new
 *       workspace. This extension changes that to launching on the
 *       current workspace.
 * 
 * Authors: Gabriel Rossetti
 *          Chris Irwin
 *          Romain Failliot
 *          Johannes Wellhöfer
 * Date: 2013-06-09
 * Version: 2.1
 *
 * Source code can be found here:
 *  - https://gitorious.org/~herrbean/chrisirwin-utils/herrbeans-newinstancecurrentworkspace
 *
 * v2.1:
 *   Romain Failliot: compatible with 3.10.

 * v2.0:
 *   Johannes Wellhöfer: compatible with GNOME Shell 3.6 and 3.8.
 *
 * v1.0:
 *   Romain Failliot: compatible with GNOME Shell 3.4, and inverted the
 *   Ctrl-click/middle-click behavior.
 *
 * v0.1:
 *   Gabriel Rossetti: original patch to change left-click behaviour.
 *   Chris Irwin: change middle-click behaviour instead.
 */

const Main = imports.ui.main;
const AppDisplay = imports.ui.appDisplay;
const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;

/**
 * Small hack to be compatible between versions 3.4 and 3.8.
 */
const AppIcon = function(){
  if( AppDisplay.AppWellIcon != undefined)
    return AppDisplay.AppWellIcon;
  else
    return AppDisplay.AppIcon;
}();

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

    // global.log("[WBI] _onClicked: button: " + button);
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

    if (this._onActivateOverride) {
        this._onActivateOverride(event);
    } else {
        //global.log("[WBI] _onActivate: state: " + this.app.state);
        if (modifiers & Clutter.ModifierType.CONTROL_MASK
            && this.app.state == Shell.AppState.RUNNING) {
            let launchWorkspace = global.screen.get_workspace_by_index(global.screen.n_workspaces - 1);
            launchWorkspace.activate(global.get_current_time());
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
  _originalClicked = AppIcon.prototype._onClicked;
  _originalActivate = AppIcon.prototype._onActivate;
}

/**
 * Enable the extension
 */
function enable() {
  AppIcon.prototype._onClicked = _onClicked;
  AppIcon.prototype._onActivate = _onActivate;
}

/**
 * Disable the extension
 */
function disable() {
  AppIcon.prototype._onClicked = _originalClicked;
  AppIcon.prototype._onActivate = _originalActivate;
}
