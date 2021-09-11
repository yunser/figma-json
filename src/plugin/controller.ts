import toUint8Array from 'base64-to-uint8array'

import { uiUtil } from '@yunser/ui-std/dist/helper'

// console.log('uiUtil', uiUtil)

function setBorder(_node, node) {
    if (node.border) {
        _node.strokes = [
            {
                type: 'SOLID',
                color: hex2FigmaColor(node.border.color || '#000'),
            }
        ]
        _node.strokeWeight = node.border.width || 1
    }
}

function setCommon(_node, node) {
    if (node.opacity) {
        _node.opacity = node.opacity
    }
    if (node.shadow) {
        const shadow = node.shadow
        _node.effects = [
            {
                type: 'DROP_SHADOW',
                color: {
                    a: shadow.alpha || 0,
                    ...hex2FigmaColor(shadow.color || '#000'),
                },
                blendMode: 'NORMAL',
                radius: shadow.blur || 0,
                visible: true,
                offset: {
                    x: shadow.x || 0,
                    y: shadow.y || 0,
                },
                spread: shadow.spread || 0,
                // radius: 
            }
        ]
    }
}

function setStyle(_node, node) {
    if (node.fill) {
        const { type, direction, colors } = node.fill

        if (type == 'linearGradient') {
            function getTx(deg) {
                if (deg >= 120) {
                    if (deg >= 180) {
                        return 1;
                    }
                    return 0.5;
                }
                return 0;
            }


            function getMatrixForDegrees(deg) {
                const rad = parseFloat(deg) * (Math.PI / 180);

                const a = Math.round(Math.cos(rad) * 100) / 100;
                const b = Math.round(Math.sin(rad) * 100) / 100;
                const c = -Math.round(Math.sin(rad) * 100) / 100;
                const d = Math.round(Math.cos(rad) * 100) / 100;
                const tx = getTx(deg);
                const ty = deg >= 120 ? 1 : 0;

                return [
                    [a, b, tx],
                    [c, d, ty],
                ];
            }


            let angle = Math.PI
            let transform: any = [
                [Math.cos(angle), Math.sin(angle), 0],
                [-Math.sin(angle), Math.cos(angle), 0]
            ]

            const angleMap = {
                'right': 0,
                'bottom': 90,
                'left': 180,
                "top": 270,
            }

            _node.fills = [
                {
                    type: 'GRADIENT_LINEAR',
                    // to right
                    // gradientTransform: [[1, 0, 0], [0, 1, 0]],
                    gradientTransform: getMatrixForDegrees(angleMap[direction]) as any,
                    gradientStops: [
                        {
                            position: 0,
                            color: {
                                ...hex2FigmaColor(colors[0]),
                                a: 1,
                            },
                        },
                        {
                            position: 1,
                            color: {
                                ...hex2FigmaColor(colors[1]),
                                a: 1,
                            },
                        }
                    ]
                }
            ]
        } else {

        }
        // direction: 'bottom',
        //     colors: ['#09c', '#c90'],
    } else if (node.color != null) {
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
    setBorder(_node, node)
}

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

function getPathSvg(_node) {
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
    if (attrs.d) {
        _attr['d'] = attrs.d
    }
    // if (attrs.radius) {
    //     _attr.rx = attrs.radius
    //     _attr.ry = attrs.radius
    // }
    let node: any = {
        type: 'path',
        attr: _attr,
        // _attrs: attrs,
    }
    return node
}

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
    "width": 500,
    "height": 400,
    "color": "#E6E6FB",
    "_children": [
        {
            "_type": "rect",
            "x": 100,
            "y": 100,
            "width": 100,
            "height": 100,
            "color": null,
            // "color": "#f00",
            border: {
                color: '#526BFF',
                width: 4,
            }
        },
        {
            "_type": "circle",
            "cx": 250,
            "cy": 150,
            "radius": 50,
            // "color": "#09c",
            "color": null,
            fill: {
                type: 'linearGradient',
                direction: 'bottom',
                colors: ['#09c', '#c90'],
            },
            border: {
                color: '#526BFF',
                width: 4,
            }
        },
        {
            "_type": "line",
            "x1": 100,
            "y1": 200,
            "x2": 200,
            "y2": 300,
            // color: '#f00',
            border: {
                color: '#526BFF',
                width: 4,
            },
        },
        {
            "_type": "text",
            "x": 100,
            "y": 0,
            "text": "你好",
            "textSize": 100,
            // color: '#f00',
            "color": null,
            border: {
                color: '#526BFF',
                width: 4,
            },
            fill: {
                type: 'linearGradient',
                direction: 'bottom',
                colors: ['#09c', '#c90'],
            },
        },
        {
            "_type": "polygon",
            points: [
                {
                    x: 50,
                    y: 100,
                },
                {
                    x: 0,
                    y: 200,
                },
                {
                    x: 100,
                    y: 200,
                },
            ],
            color: '#E56D6D',
            border: {
                color: '#526BFF',
                width: 4,
            },
            fill: {
                type: 'linearGradient',
                direction: 'bottom',
                colors: ['#09c', '#c90'],
            },
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
            border: {
                color: '#526BFF',
                width: 4,
            },
        },
        {
            "_type": "group",
            _children: [
            ],
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
                width: 4,
            },
            fill: {
                type: 'linearGradient',
                direction: 'bottom',
                colors: ['#09c', '#c90'],
            },
            opacity: 0.5,
            shadow: {
                x: 5,
                y: 5,
                blur: 10,
                alpha: 0.2,
            },
        },
        {
            "_type": "path",
            d: 'M200,200.490196 L199.509804,300 C212.323108,269.060446 229.153174,253.590669 250,253.590669 C270.846826,253.590669 287.513493,268.897047 300,299.509804 L300,200 L200,200.490196 Z',
            color: '#E56D6D',
            border: {
                color: '#526BFF',
                width: 4,
            },
            fill: {
                type: 'linearGradient',
                direction: 'bottom',
                colors: ['#09c', '#c90'],
            },
        },
        {
            _type: 'image',
            x: 300,
            y: 0,
            width: 100,
            height: 100,
            href: "data:image/png;base64,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",
        },
        {
            "_type": "rect",
            "x": 300,
            "y": 100,
            "width": 100,
            "height": 100,
            // "color": null,
            "color": "#09c",
            // border: {
            //     color: '#526BFF',
            //     width: 4,
            // }
            fill: {
                type: 'linearGradient',
                direction: 'bottom',
                colors: ['#09c', '#c90'],
            },
        },
        {
            "_type": "rect",
            "x": 300,
            "y": 200,
            "width": 100,
            "height": 100,
            // "color": null,
            "color": "#f00",
            shadow: {
                x: 5,
                y: 5,
                blur: 10,
                // spread: 10,
                // color: '#09c',
                alpha: 0.2,
            },
            opacity: 0.5,
            // border: {
            //     color: '#526BFF',
            //     width: 4,
            // }
            // fill: {
            //     type: 'linearGradient',
            //     direction: 'bottom',
            //     colors: ['#09c', '#c90'],
            // },
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

    // const nodes: SceneNode[] = [];

    if (msg.type === 'cancel') {
        figma.closePlugin();
    }
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

        // root._children.forEach(node => {
            
        // })

        uiUtil.treeMap(root, {
            childrenKey: '_children',
            childrenSetKey: 'layers',
            nodeHandler(node, { children }) {
                if (node._type == 'root') {
                    // return createArtboard(node)
                    return {}
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
                    setCommon(_node, node)
                    setStyle(_node, node)
                    
                    frame.appendChild(_node)

                    // figma.currentPage.appendChild(rect);
                    // nodes.push(rect);
                    return { _node }
                }
                if (node._type == 'image') {
                    // return createRect(node)
                    let imageHash = figma.createImage(toUint8Array(node.href.replace(/^data:image\/(png|jpg);base64,/, ""))).hash
                    const _node = figma.createRectangle()

                    _node.x = node.x
                    _node.y = node.y
                    _node.resize(node.width, node.height)
                    console.log('rect', _node)
                    // rect.width = 100
                    // rect.height = 100
                    _node.fills = [
                        { type: "IMAGE", scaleMode: "FIT", imageHash }
                    ]
                    // if (node.color != null) {
                    //     let color = hex2FigmaColor(node.color || '#000')
                    //     // _node.fills = [
                    //     //     {
                    //     //         type: 'SOLID',
                    //     //         color,
                    //     //     }
                    //     // ]
                    // } else {
                    //     // _node.fills = [
                    //     // ]
                    // }
                    // if (node.border) {
                    //     // _node.strokes = [
                    //     //     {
                    //     //         type: 'SOLID',
                    //     //         color: hex2FigmaColor(node.border.color || '#000'),
                    //     //     }
                    //     // ]
                    //     // _node.strokeWeight = node.border.width || 1
                    // }
                    setCommon(_node, node)
                    


                    frame.appendChild(_node)

                    // figma.currentPage.appendChild(rect);
                    // nodes.push(rect);
                    return { _node }
                }
                if (node._type == 'group') {
                    console.log('group', node, children)
                    if (children.length) {
                        // throw new Error('??')
                        const _node = figma.group(children.map(item => item._node), frame)
                        // let svg = uiUtil.svgObj2Xml(getPolygonSvg(node))
                        // const _node = figma.createNodeFromSvg(svg)
                        setCommon(_node, node)
                        frame.appendChild(_node)
                        return { _node }
                    }
                    return
                }
                if (node._type == 'polygon') {
                    let svg = uiUtil.svgObj2Xml(getPolygonSvg(node))
                    const _node = figma.createNodeFromSvg(svg)
                    setCommon(_node, node)
                    setStyle(_node, node)
                    frame.appendChild(_node)
                    return { _node }
                }
                if (node._type == 'path') {
                    let svg = uiUtil.svgObj2Xml(getPathSvg(node))
                    console.log('psvg', svg)
                    const _node = figma.createNodeFromSvg(svg)
                    setCommon(_node, node)
                    setStyle(_node, node)
                    frame.appendChild(_node)
                    return { _node }
                }
                if (node._type == 'path') {
                    let svg = uiUtil.svgObj2Xml(getPolygonSvg(node))
                    const _node = figma.createNodeFromSvg(svg)
                    setCommon(_node, node)
                    setStyle(_node, node)
                    frame.appendChild(_node)
                    return { _node }
                }
                if (node._type == 'polyline') {
                    let svg = uiUtil.svgObj2Xml(getPolylinSvg(node))
                    const _node = figma.createNodeFromSvg(svg)
                    // setStyle(_node, node)
                    setCommon(_node, node)
                    setBorder(_node, node)
                    frame.appendChild(_node)
                    return { _node }
                }

                if (node._type == 'circle') {
                    // return createCircle(node)
                    const _node = figma.createEllipse()
                    _node.x = node.cx - node.radius
                    _node.y = node.cy - node.radius
                    _node.resize(node.radius * 2, node.radius * 2)
                    setCommon(_node, node)
                    setStyle(_node, node)
                    frame.appendChild(_node)
                    return { _node }
                }
                if (node._type == 'ellipse') {
                    // return createCircle(node)
                    const _node = figma.createEllipse()
                    _node.x = node.cx - node.rx
                    _node.y = node.cy - node.ry
                    _node.resize(node.rx * 2, node.ry * 2)

                    setCommon(_node, node)
                    setStyle(_node, node)
                    frame.appendChild(_node)
                    return { _node }
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
                            setCommon(_node, node)
                            frame.appendChild(_node)

                        })
                    // text.fontName = 'Roboto'
                    return {  }
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

                    // let color = hex2FigmaColor(node.color || '#000')

                    setCommon(_node, node)
                    setBorder(_node, node)
                    // _node.strokes = [
                    //     {
                    //         type: 'SOLID',
                    //         color,
                    //     }
                    // ]
                    // if (node.color != null) {
                    // } else {
                    //     _node.strokes = [
                    //     ]
                    // }
                    // line.resize(width, height)
                    // line.

                    frame.appendChild(_node)
                    return { _node }
                }
                throw new Error(`unknown type ${node._type}`)
                // return {
                //     type: 'unknown'
                // }
            }
        })


        figma.closePlugin();
        // for (let i = 0; i < 3; i++) {
        // }
        // figma.currentPage.selection = nodes;
        // figma.viewport.scrollAndZoomIntoView(nodes);
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    
};
