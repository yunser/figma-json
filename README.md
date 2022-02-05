# figma-json

导入导出 Std UI

根据 [Std UI JSON](https://github.com/yunser/json-ui) 生成形状的 Figma 插件。
run npm install --save-dev @figma/plugin-typings.



## Quickstart
* Run `npm i` to install dependencies.
* Run `npm run dev` to start webpack in watch mode.
* Open `Figma` -> `Plugins` -> `Development` -> `New Plugin...` and choose `manifest.json` file from this repo.

⭐ To change the UI of your plugin (the react code), start editing [App.tsx](./src/app/components/App.tsx).  
⭐ To interact with the Figma API edit [controller.ts](./src/plugin/controller.ts).  
⭐ Read more on the [Figma API Overview](https://www.figma.com/plugin-docs/api/api-overview/).

## Toolings
This repo is using:
* React + Webpack
* TypeScript
* Prettier precommit hook

## Refer

* https://www.figma.com/plugin-docs/api/GroupNode/


## 其他说明

* 由于 Figma 的限制，如果分组的子节点数量为 0，分组本身不会生成。


## 未解决的问题

* 无法保证文字在不同平台渲染一致。


## Other

* Due to the limitation of figma, if the number of child nodes of the group is 0, the group itself will not be generated.

* 参考
  * https://github.com/nirsky/figma-plugin-react-template