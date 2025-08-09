const pluralize = require("pluralize")

module.exports = function (plop) {
  plop.setHelper("plural", pluralize)
  plop.setHelper("singular", pluralize.singular)
  plop.setHelper('b', function (text) {
    return `{{ ${text} }}`;
  });
  plop.setGenerator("index", {
    description: "Generate an index file for a directory, with sorting and filtering",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Name of the resource, singular (e.g., fight, character):"
      }
    ],
    actions: [
      {
        type: "add",
        path: "src/components/{{snakeCase (plural name)}}/{{pascalCase (plural name)}}Mobile.tsx",
        templateFile: "plop-templates/index/ComponentMobile.hbs"
      },
      {
        type: "add",
        path: "src/components/{{snakeCase (plural name)}}/{{pascalCase (plural name)}}.tsx",
        templateFile: "plop-templates/index/things.hbs"
      },
      {
        type: "add",
        path: "src/components/{{snakeCase (plural name)}}/{{pascalCase (singular name)}}Filter.tsx",
        templateFile: "plop-templates/index/filter.hbs"
      },
      {
        type: "add",
        path: "src/components/{{snakeCase (plural name)}}/SpeedDial.tsx",
        templateFile: "plop-templates/index/speedDial.hbs"
      },
      {
        type: "add",
        path: "src/components/{{snakeCase (plural name)}}/Menu.tsx",
        templateFile: "plop-templates/index/table/menu.hbs"
      },
      {
        type: "add",
        path: "src/components/{{snakeCase (plural name)}}/{{pascalCase (singular name)}}Form.tsx",
        templateFile: "plop-templates/index/form.hbs"
      },
      {
        type: "add",
        path: "src/components/{{snakeCase (plural name)}}/Create{{pascalCase (singular name)}}Form.tsx",
        templateFile: "plop-templates/index/createForm.hbs"
      },
      {
        type: "add",
        path: "src/components/{{snakeCase (plural name)}}/table/Pagination.tsx",
        templateFile: "plop-templates/index/table/pagination.hbs"
      },
      {
        type: "add",
        path: "src/components/{{snakeCase (plural name)}}/table/TableBody.tsx",
        templateFile: "plop-templates/index/table/tableBody.hbs"
      },
      {
        type: "add",
        path: "src/components/{{snakeCase (plural name)}}/table/TableHeader.tsx",
        templateFile: "plop-templates/index/table/tableHeader.hbs"
      },
      {
        type: "add",
        path: "src/components/{{snakeCase (plural name)}}/table/View.tsx",
        templateFile: "plop-templates/index/table/view.hbs"
      },
      {
        type: "append",
        path: "src/components/{{snakeCase (plural name)}}/index.ts",
        templateFile: "plop-templates/index/index.hbs"
      }
    ]
  })
}
