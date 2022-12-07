![Vyper Logo](https://raw.githubusercontent.com/vyper-protocol/branding/main/very-small-logo.png)

# Vyper OTC UI

> 🌿 Vyper OTC UI. Application built on Vyper Core protocol

![node v16.17.0](https://img.shields.io/badge/node-v16.17.0-blue.svg) ![GitHub issues](https://img.shields.io/github/issues/vyper-protocol/vyper-otc-ui?color=yellow)

## Live environments

|                |                                                                   Vercel Build |        Description |                                                                           Link |
| -------------: | -----------------------------------------------------------------------------: | -----------------: | -----------------------------------------------------------------------------: |
| `mainnet-prod` | ![Vercel](http://therealsujitk-vercel-badge.vercel.app/?app=vyper-otc-mainnet) | Mainnet Production |                           [otc.vyperprotocol.io](https://otc.vyperprotocol.io) |
|  `devnet-prod` |  ![Vercel](http://therealsujitk-vercel-badge.vercel.app/?app=vyper-otc-devnet) |  Devnet Production |                 [demo.otc.vyperprotocol.io](https://demo.otc.vyperprotocol.io) |
| `mainnet-stag` | ![Vercel](http://therealsujitk-vercel-badge.vercel.app/?app=vyper-otc-mainnet) |    Mainnet Staging |           [staging.otc.vyperprotocol.io](https://staging.otc.vyperprotocol.io) |
|  `devnet-stag` |  ![Vercel](http://therealsujitk-vercel-badge.vercel.app/?app=vyper-otc-devnet) |     Devnet Staging | [staging.demo.otc.vyperprotocol.io](https://staging.demo.otc.vyperprotocol.io) |

### Getting Started

Use the selected node version

```bash
nvm use
```

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

| Script          | Use                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------- |
| prebuild        | Clean `.next` folder                                                                            |
| dev             | Starts the development server                                                                   |
| build           | Creates an optimized production build                                                           |
| export          | Export the app to static HTML, which can be run standalone without the need of a Node.js server |
| analyze         | Visualize and track the production build bundle size                                            |
| lint            | Lints src files with Eslint                                                                     |
| format          | Formats src files with prettier                                                                 |
| prepare         | Husky install                                                                                   |
| storybook       | Starts the storybook development server                                                         |
| build-storybook | Creates the storybook production build                                                          |

### Next.js

This projects uses **Next.js**. You can check further info regarding the [Next.js Docs here](https://nextjs.org/docs/getting-started)

### Design principle

This project is using the `Atomic Design Methodology`. Atomic design thinks of basic fundamental components as **atoms** (like a Button). Those atomic units bond together to form **molecules** (like an InputForm), which in turn combine into more complex **organisms** to ultimately create bigger structures (like a Card).

Then we also have **templates**, which are, like the names implies, generic layouts for our components. And last but not least **pages**, which are templates with real content inside.

In our case the section **pages**, has being moved outside of the `components` folder, because in Next.js, a page lives inside the `pages` directory and is associated with a `route` based on its file name.

### Styles & CSS

This project supports `CSS Modules` alongside regular stylesheets using the [name].module.{css,scss} file naming convention.

There are a couple of points to take into consideration when working with CSS here.

1. CSS values are derived from `styles/base.css` globals whenever possible, in order to mantain a concise look.
2. Color values are fixed as shown in `base.css` collor palette
3. Sizes for fonts are following the _"divided-by-2"_ scale
4. Sizes for spacing are following the _"multiplex-of-4"_ scale
5. There are some predefined mixins in `styles/variables.scss`

### Storybook

[![Storybook](https://img.shields.io/badge/-Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white)](https://vyper-otc-storybook.netlify.app)

Storybook is a visual documentation of the components that are available in the project. So, it's encouraged that for each component that you create or modify, it's better if you also create/update the component's story.

The guideline for creating a component's story is:

1. The component's story filename should follow this pattern: `*.stories.tsx`, otherwise it won't be detected by Storybook
2. The title of the component metadata should follow the path under `src`, for example `<ButtonPill />` is located at `src/components/atoms/ButtonPill`, then it should be `components/atoms/ButonPill`
3. It's encouraged that developers to give a comment above each props of the actual component, the comments will act as the description of the props in Storybook
4. The best practice for props that have multiple options such as enum is to create multiple stories of the component in order to show different possibilities of how the component will look like with different options.

You can check the current project storybook live [here](https://vyper-otc-storybook.netlify.app).
