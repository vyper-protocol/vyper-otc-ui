![Vyper Logo](https://raw.githubusercontent.com/vyper-protocol/branding/main/very-small-logo.png)

# Vyper OTC UI

> 🌿 Vyper OTC UI. Application built on Vyper Core protocol

![node v16.17.0](https://img.shields.io/badge/node-v16.17.0-blue.svg) ![GitHub package.json version](https://img.shields.io/github/package-json/v/vyper-protocol/vyper-otc-ui?color=blue) ![GitHub issues](https://img.shields.io/github/issues/vyper-protocol/vyper-otc-ui?color=yellow) [![Netlify Status](https://api.netlify.com/api/v1/badges/a25c5020-b1bf-4d8b-b4d0-b033ac85da72/deploy-status)](https://app.netlify.com/sites/vyper-otc/deploys)

### Getting Started

Install dependencies

```bash
yarn install
```

Start development server

```bash
yarn dev
```

Create an optmized build

```bash
yarn build
```

### NPM Scripts

| Script        | Use                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------- |
| dev           | Starts the development server                                                                   |
| build         | Creates an optimized production build                                                           |
| export        | Export the app to static HTML, which can be run standalone without the need of a Node.js server |
| lint          | Lints src files with Eslint                                                                     |
| format        | Formats src files with prettier                                                                 |
| commit        | Runs `git add .` and `cz`                                                                       |
| first-release | Creates the first version for the auto-changelog generator. _(This should run only once)_       |
| release       | Bumbs version & writes changes to changelog                                                     |
| release:minor | Bumbs minor version & writes changes to changelog                                               |
| release:patch | Bumbs patch version & writes changes to changelog                                               |
| release:major | Bumbs major version & writes changes to changelog                                               |
| push-tags     | Creates github tag with the current release                                                     |
| prepare       | Husky install                                                                                   |
| cypress       | Test with cypress                                                                               |

### Next.js

This projects uses **Next.js**. You can check further info regarding the [Next.js Docs here](https://nextjs.org/docs/getting-started)

### Design principle

This project is using the `Atomic Design Methodology`. Atomic design thinks of basic fundamental components as **atoms** (like a Button). Those atomic units bond together to form **molecules** (like an InputForm), which in turn combine into more complex **organisms** to ultimately create bigger structures (like a Card).

Then we also have **templates**, which are, like the names implies, generic layouts for our components. And last but not least **pages**, which are templates with real content inside.

In our case the section **pages**, has being moved outside of the `components` folder, because in Next.js, a page lives inside the `pages` directory and is associated with a `route` based on its file name.

### Folder Structure

WIP

### Styles & CSS

This project supports `CSS Modules` alongside regular stylesheets using the [name].module.{css,scss} file naming convention.

There are a couple of points to take into consideration when working with CSS here.

1. CSS values are derived from `styles/base.css` globals whenever possible, in order to mantain a concise look.
2. Color values are fixed as shown in `base.css` collor palette
3. Sizes for fonts are following the _"divided-by-2"_ scale
4. Sizes for spacing are following the _"multiplex-of-4"_ scale
5. There are some predefined mixins in `styles/variables.scss`

### Tests

WIP

### Commits with Commitizens & Releases

Commitizens defines a standard way of committing rules that are easier to read, formatted with a concise way and keeping the commit history clean & organised.

Before every commit you should **always** run:

```bash
yarn commit
```

This will run `git add. & cz` and will prompt you to choose what type of commit you want to make.

![commitizens](https://raw.githubusercontent.com/commitizen-tools/commitizen/master/docs/images/demo.gif)

Some useful features are:

- You can reference active **github issues** from commitizens' prompt
- You can highligh a commit that has a **breaking change**
- Before submitting any commits, commitizens is also configured to uses `lint-staged` that will run Eslint & Prettier to all the staged files ready to be committed. If this check fails, the commit exits.

Then you can either run `git push origin [name_of_branch]` or create a release by running `npm run release` and then pushing the tag to github by runing `npm run push-tags`.

Generally, it's a good practice to create releases regularly at the end of each sprint by running `npm run release`. This will **bump** the version on `package.json` and will also generate a changelog in the root directory with all the changes that have been made.

#### Troubleshooting

1. If you encounter this error `fatal: cannot run .husky No such file or directory` then follow these steps:

- delete `pre-commit` file inside `.husky` directory
- run `npx husky add ./.husky/pre-commit`
- open the new `pre-commit` file and paste the below content:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo '🏗️ ------------------------------------------------ 🏗️'
echo 'Checking & Styling your project before committing'
echo 'please be patient, this may take a while...'
echo '🏗️ ------------------------------------------------ 🏗️'

npx lint-staged
```

2. If you encounter this error in your imported CSS modules: `Cannot find module './File.module.css' or its corresponding type declarations.ts(2307)`

   - Check that there is `next-env.d.ts` in the root directory. This file references TypeScript types declarations that are specific to projects started with Next.js and it adds support for importing CSS Modules. This relates to import of files with .module.css,.module.scss, and .module.sass extensions.
