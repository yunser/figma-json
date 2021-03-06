# figma-json

* 导入导出 Std UI

根据 [Std UI JSON](https://github.com/yunser/json-ui) 生成形状的 Figma 插件。
run npm install --save-dev @figma/plugin-typings.


* Figma 使用体验
  * line 不好用
  * 复合图形

* 读
  * bg 省略
  * 旋转等变换
  * frame 遮罩
  * figma font to path
  * 旋转+frame
  * 扇形
  * frame + ?
  * group + path
  * share style
  * auto layout
  * fill visible
  * 统一字体
  * 复合图形多颜色
  * 翻转+旋转
  * frame stroke
  * 文字垂直位置
  * 边框虚线
  * 路径的边界处理
  * 背景模糊
  * 非闭合路径
  * frame 空提示
* 写

## TODO
    * 完成情况
    * 读写分离
    * blur + shadow
    * 遮罩
    * 旋转等变换
    * 日志
    * 耗时
    * 图标文件测试
      * 11 失败

## 问题

* Figma 和 Sketch 模糊实现原理不一致，转换后效果不同。
* 其他不一致
* 文本位置不对。
* 所有的图形必须在 frame 下


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
* https://github.com/nirsky/figma-plugin-react-template

## 其他说明

* 由于 Figma 的限制（不允许存在空的分组节点），如果分组的子节点数量为 0，分组本身不会生成。


## 未解决的问题

* 无法保证文字在不同平台渲染一致。


## Other

* Due to the limitation of figma, if the number of child nodes of the group is 0, the group itself will not be generated.

* 参考
  * https://github.com/nirsky/figma-plugin-react-template
  * https://github.com/Qix-/color/issues/221