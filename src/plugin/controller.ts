// figma.showUI(__html__);

// figma.ui.onmessage = (msg) => {
//     if (msg.type === 'create-rectangles') {
//         const nodes = [];

//         for (let i = 0; i < msg.count; i++) {
//             const rect = figma.createRectangle();
//             rect.x = i * 150;
//             rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
//             figma.currentPage.appendChild(rect);
//             nodes.push(rect);
//         }

//         figma.currentPage.selection = nodes;
//         figma.viewport.scrollAndZoomIntoView(nodes);

//         // This is how figma responds back to the ui
//         figma.ui.postMessage({
//             type: 'create-rectangles',
//             message: `Created ${msg.count} Rectangles`,
//         });
//     }

//     figma.closePlugin();
// };
// import { add } from './sub'
// import Color = require('color')
// import * as Color from 'color'
// import Color from 'color'
// import { getFigmaRotation } from './math'
// console.log('Color', Color)
import { uiUtil } from '@yunser/ui-std/dist/helper'
// import * as fs from 'fs'
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// const root = JSON.parse(fs.readFileSync('root.json', 'utf8'))
// console.log('add', add(1, 2))

console.log('uiUtil', uiUtil)

function getPolygonSvg(_node) {
    let _attr: any = {}
    let attrs = _node
    if (attrs.color) {
        _attr.fill = attrs.color
    } else {
        _attr.fill = 'none'
    }
    if (attrs.border) {
        _attr.stroke = attrs.border.color
        _attr['stroke-width'] = attrs.border.width || 1
    }
    if (attrs.points) {
        _attr['points'] = attrs.points.map(pt => `${pt.x},${pt.y}`).join(' ')
    }
    // if (attrs.radius) {
    //     _attr.rx = attrs.radius
    //     _attr.ry = attrs.radius
    // }
    let node: any = {
        type: 'polygon',
        attr: _attr,
        // _attrs: attrs,
    }
    return node
}
// uiUtil.svgObj2Xml(convertUiObj2SvgObject(this.root))

function getPolylinSvg(_node) {
    let _attr: any = {}
    let attrs = _node
    if (attrs.color) {
        _attr.stroke = attrs.color
    } else {
        _attr.stroke = '#000'
    }
    _attr.fill = 'none'
    if (attrs.points) {
        _attr['points'] = attrs.points.map(pt => `${pt.x},${pt.y}`).join(' ')
    }

    // if (attrs.radius) {
    //     _attr.rx = attrs.radius
    //     _attr.ry = attrs.radius
    // }
    let node: any = {
        type: 'polyline',
        attr: _attr,
        // _attrs: attrs,
    }
    return node
}

console.log('svg', uiUtil.svgObj2Xml(getPolygonSvg({
    "_type": "polygon",
    "points": [
        {
            "x": 50,
            "y": 100
        },
        {
            "x": 0,
            "y": 200
        },
        {
            "x": 100,
            "y": 200
        }
    ],
    "color": "#E56D6D",
    "border": {
        "color": "#526BFF",
        "width": 2
    }
})))
// console.log('getFigmaRotation', getFigmaRotation)
// 两个点的方向角
function getAngleBy2Point(a, b) {
    return getAngle(b.x - a.x, b.y - a.y)
}

// 获取相对与原点的方向角
function getAngle(x, y) {
    let dAngle = _getAngle(x, y)
    if (dAngle === 360) {
        dAngle = 0
    }
    return dAngle
}

// 获取一个点相对于原点的方向角
function _getAngle(x, y) {
    console.log('_getAngle', x, y)
    if (x === 0 && y === 0) {
        return null
    }

    let hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    //斜边长度
    let cos = x / hypotenuse;
    let radian = Math.acos(cos);
    //求出弧度
    let angle = 180 / (Math.PI / radian);
    //用弧度算出角度
    if (y < 0) {
        angle = -angle;
    } else if ((y == 0) && (x < 0)) {
        angle = 180;
    }
    if (x > 0) {
        if (y > 0) {
            // 1
            // console.log('=1')
            return 90 - angle
        } else {
            // 2
            // console.log('=2')
            return 90 - angle
        }
    } else {
        if (y < 0) {
            // 3
            // console.log('=3')
            return 90 - angle
        } else {
            // 4
            // console.log('=4')
            return 360 + (90 - angle)
        }
    }
}

function getFigmaRotation(node) {
    if (node.y1 == node.y2) {
        // return 0
        if (node.x2 > node.x1) {
            return 0
        }
        return 180
    }

    let value = getAngleBy2Point({ x: node.x1, y: node.y1 }, { x: node.x2, y: node.y2 })

    if (node.y2 > node.y1) {
        return value - 90
    }

    // 90 ~ 270 映射到 0 ~ -180
    return 0 - (value - 90)
    // if (node.x2 > node.x1) {
    //     if (node.y1 == node.y2) {
    //         return 0
    //     }
    // }
}



function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// alert(rgbToHex(0, 51, 255)); // #0033ff

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

console.log('hexToRgb', hexToRgb("#ff0000"))
function hexToFigmaColor(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 256,
        g: parseInt(result[2], 16) / 256,
        b: parseInt(result[3], 16) / 256,
    } : null;
}

function colorRgb(sColor) {
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    var sColor = sColor.toLowerCase();
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            var sColorNew = "#";
            for (var i = 1; i < 4; i += 1) {
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
            }
            sColor = sColorNew;
        }
        //处理六位的颜色值
        var sColorChange = [];
        for (var i = 1; i < 7; i += 2) {
            sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        return sColorChange;
    } else {
        return sColor;
    }
}

function hex2FigmaColor(sColor) {
    let _arr = colorRgb(sColor)
    console.log('_arr', _arr)
    return {
        r: _arr[0] / 255,
        g: _arr[1] / 255,
        b: _arr[2] / 255,
    }
}
console.log('hex2Rgb', hex2FigmaColor("#f00"))


const root = {
    "_type": "root",
    "width": 300,
    "height": 300,
    "color": "#E6E6FB",
    "_children": [
        {
            "_type": "rect",
            "x": 100,
            "y": 100,
            "width": 100,
            "height": 100,
            "color": null,
            "border": {
                "color": "#526BFF",
                "width": 2
            }
        },
        {
            "_type": "circle",
            "cx": 250,
            "cy": 150,
            "radius": 50,
            "color": null,
            "border": {
                "color": "#526BFF",
                "width": 2
            }
        },
        {
            "_type": "line",
            "x1": 100,
            "y1": 200,
            "x2": 200,
            "y2": 300,
            "color": "#f00"
        },
        {
            "_type": "text",
            "x": 100,
            "y": 0,
            "text": "你好",
            "textSize": 100,
            "color": null,
            "border": {
                "color": "#526BFF",
                "width": 2
            }
        },
        {
            "_type": "polygon",
            "points": [
                {
                    "x": 50,
                    "y": 100
                },
                {
                    "x": 0,
                    "y": 200
                },
                {
                    "x": 100,
                    "y": 200
                }
            ],
            "color": "#E56D6D",
            "border": {
                "color": "#526BFF",
                "width": 2
            }
        },
        {
            _type: 'polyline',
            points: [
                {
                    x: 0,
                    y: 100,
                },
                {
                    x: 50,
                    y: 0,
                },
                {
                    x: 100,
                    y: 100,
                },
            ],
            color: '#526BFF',
        },
        {
            "_type": "ellipse",
            cx: 50,
            cy: 250,
            rx: 50,
            ry: 25,
            color: '#E56D6D',
            border: {
                color: '#526BFF',
                width: 2,
            },
        },
    ]
}

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.

    // figma.currentPage.
    figma.currentPage.children.forEach(child => {
        child.remove()
    })

    const nodes: SceneNode[] = [];

    if (msg.type === 'create-rectangles') {
        const frame = figma.createFrame()
        frame.x = 0
        frame.y = 0
        frame.resize(root.width, root.height)
        figma.currentPage.appendChild(frame)
        frame.fills = [
            {
                type: 'SOLID',
                color: hex2FigmaColor(root.color || '#fff')
            }
        ]

        root._children.forEach(node => {
            if (node._type == 'root') {
                // return createArtboard(node)
                return
            }
            if (node._type == 'rect') {
                // return createRect(node)
                const _node = figma.createRectangle();
                _node.x = node.x
                _node.y = node.y
                _node.resize(node.width, node.height)
                console.log('rect', _node)
                // rect.width = 100
                // rect.height = 100
                if (node.color != null) {
                    let color = hex2FigmaColor(node.color || '#000')
                    _node.fills = [
                        {
                            type: 'SOLID',
                            color,
                        }
                    ]
                } else {
                    _node.fills = [
                    ]
                }
                if (node.border) {
                    _node.strokes = [
                        {
                            type: 'SOLID',
                            color: hex2FigmaColor(node.border.color || '#000'),
                        }
                    ]
                    _node.strokeWeight = node.border.width || 1
                }


                frame.appendChild(_node)

                // figma.currentPage.appendChild(rect);
                // nodes.push(rect);
                return
            }
            if (node._type == 'polygon') {
                let svg = uiUtil.svgObj2Xml(getPolygonSvg(node))
                const _node = figma.createNodeFromSvg(svg)
                frame.appendChild(_node)
                return
            }
            if (node._type == 'polyline') {
                let svg = uiUtil.svgObj2Xml(getPolylinSvg(node))
                const _node = figma.createNodeFromSvg(svg)
                frame.appendChild(_node)
                return
            }
            
            if (node._type == 'circle') {
                // return createCircle(node)
                const _node = figma.createEllipse()
                _node.x = node.cx - node.radius
                _node.y = node.cy - node.radius
                _node.resize(node.radius * 2, node.radius * 2)
                if (node.color != null) {
                    let color = hex2FigmaColor(node.color || '#000')
                    _node.fills = [
                        {
                            type: 'SOLID',
                            color,
                        }
                    ]
                } else {
                    _node.fills = [
                    ]
                }
                if (node.border) {
                    _node.strokes = [
                        {
                            type: 'SOLID',
                            color: hex2FigmaColor(node.border.color || '#000'),
                        }
                    ]
                    _node.strokeWeight = node.border.width || 1
                }
                frame.appendChild(_node)
                return
            }
            if (node._type == 'ellipse') {
                // return createCircle(node)
                const _node = figma.createEllipse()
                _node.x = node.cx - node.rx
                _node.y = node.cy - node.ry
                _node.resize(node.rx * 2, node.ry * 2)
                if (node.color != null) {
                    let color = hex2FigmaColor(node.color || '#000')
                    _node.fills = [
                        {
                            type: 'SOLID',
                            color,
                        }
                    ]
                } else {
                    _node.fills = [
                    ]
                }
                if (node.border) {
                    _node.strokes = [
                        {
                            type: 'SOLID',
                            color: hex2FigmaColor(node.border.color || '#000'),
                        }
                    ]
                    _node.strokeWeight = node.border.width || 1
                }
                frame.appendChild(_node)
                return
            }
            if (node._type == 'text') {
                // return createText(node)
                figma.loadFontAsync({ family: "Roboto", style: "Regular" })
                    .then(() => {
                        let _node = figma.createText()
                        _node.x = node.x
                        _node.y = node.y
                        _node.fontSize = node.textSize
                        // text.lineHeight = node.textSize
                        _node.characters = node.text
                        if (node.color != null) {
                            let color = hex2FigmaColor(node.color || '#000')
                            _node.fills = [
                                {
                                    type: 'SOLID',
                                    color,
                                }
                            ]
                        } else {
                            _node.fills = [
                            ]
                        }
                        if (node.border) {
                            _node.strokes = [
                                {
                                    type: 'SOLID',
                                    color: hex2FigmaColor(node.border.color || '#000'),
                                }
                            ]
                            _node.strokeWeight = node.border.width || 1
                        }
                        _node.setRangeLineHeight(0, node.text.length, { value: node.textSize, unit: 'PIXELS' })
                        frame.appendChild(_node)

                    })
                // text.fontName = 'Roboto'
                return
            }
            if (node._type == 'line') {
                // return createLine(node)
                let left = Math.min(node.x1, node.x2)
                let top = Math.min(node.y1, node.y2)
                let width = Math.abs(node.x1 - node.x2)
                let height = Math.abs(node.y1 - node.y2)
                let right = Math.max(node.x1, node.x2)
                let bottom = Math.max(node.y1, node.y2)

                const _node = figma.createLine()
                _node.x = left
                _node.y = top
                const length = Math.sqrt(width * width + height * height)
                _node.resize(length, 0)
                _node.rotation = getFigmaRotation(node)

                let color = hex2FigmaColor(node.color || '#000')
                _node.strokes = [
                    {
                        type: 'SOLID',
                        color,
                    }
                ]
                // if (node.color != null) {
                // } else {
                //     _node.strokes = [
                //     ]
                // }
                // line.resize(width, height)
                // line.

                frame.appendChild(_node)
                return
            }
            throw new Error(`unknown type ${node._type}`)
        })

        // const firstLayer = uiUtil.treeMap(root, {
        //     childrenKey: '_children',
        //     childrenSetKey: 'layers',
        //     nodeHandler(node) {
        //         // return {
        //         //     type: 'unknown'
        //         // }
        //     }
        // })



        // for (let i = 0; i < 3; i++) {
        // }
        // figma.currentPage.selection = nodes;
        // figma.viewport.scrollAndZoomIntoView(nodes);
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
};
