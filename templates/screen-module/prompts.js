/* Prompts cheatsheet
 * project_name: {
 *   message: "the pretty name (instead of project_name)"
 *   validator: /^[a-zA-Z\s\-]+$/,
 *   warning: 'Name must be only letters, spaces, or dashes',
 *   empty: false,
 *   default: "my_awesome_project",
 *   hidden: false
 * }
 */
exports.overrides = {
  writeOptions: false
};
exports.prompts = { 
  "screen_interface": "I__ModuleName__Screen",
  "module_activity": "__ModuleName__Activity",
  "module_interface": "I__ModuleName__Module",
  "screen_layout": "__module_name__",

  CompanyName: "MyCompanyName",
  ModuleViewController: "__class_prefix____ModuleName__ViewController",
  ModuleProtocol: "I__class_prefix____ModuleName__ScreenModule",
  ScreenProtocol: "I__class_prefix____ModuleName__Screen",
  RequestProtocol: "I__class_prefix____ModuleName__Request",

  module_name: {
    message: "the name of the Javascript module, without the .js extension",
    validator: /^[a-z][a-z0-9_\-]*$/,
    warning: "this should be lowercase, with underscores and dashes"
  },
  ModuleName: {
    message: "A version of the module name, in title case. This will be used in native code",
    validator: /^[A-Z]\w*$/
  } 
}
