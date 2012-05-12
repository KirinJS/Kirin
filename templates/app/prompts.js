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
exports.prompts = {
  project_name: {
    message: "Project Name",
    validator: /^[A-Z]\w*$/,
    warning: "Project name must be capitilized and contain no spaces"
  },
  shortName: {
      message: "Short Project Name",
      validator: /^[a-z][a-z0-9]\w*$/,
      warning: "Project name must be lower case and contain no spaces",
  },
  class_prefix: {
    message: "Prefix for all classes",
    validator: /^[A-Z]\w*$/,
    warning: "Class name prefix should be preferably be short, and all caps. It should definitely contain no spaces or punctiation",
    empty: true
  },
  MyCompanyName: {
    message: "Your company name"
  },
  companyIdentifier: {
    message: "The reverse domain name of your organization",
    warning: "This should contain just dots and lowercase letters.",
    empty: false,
    validator: /^\w+(?:\.\w+)*$/
  },
  "contextPackage": "__companyIdentifier__xXJAVA_PACKAGEXx",
  "JAVA_PACKAGE": "",
};

exports.header = "The following prompts will help you create an ios application…";
