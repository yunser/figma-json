import toUint8Array from 'base64-to-uint8array'

import { uiUtil } from '@yunser/ui-std/dist/helper'

var parse = require('parse-svg-path')
var translate = require('translate-svg-path')
var serialize = require('serialize-svg-path')


// console.log('uiUtil', uiUtil)

function breakPoint() {
    throw new Error('breakPoint')
}

// 正多边形
function getPolygonPoints(center, radius, sides, startAngle = Math.PI * 2) {
    const centerX = center.x
    const centerY = center.y
    const points = [];
    let angle = startAngle || 0;
    for (let i = 0; i < sides; ++i) {
        points.push({
            x: centerX + radius * Math.sin(angle),
            y: centerY - radius * Math.cos(angle),
        })
        angle += 2 * Math.PI / sides;
    }
    return points;
}

// 
function getStarPoints(center, radius, sides, innerRadius, startAngle = Math.PI * 2) {
    const centerX = center.x
    const centerY = center.y
    const points = [];
    let angle = startAngle || 0;
    for (let i = 0; i < sides; ++i) {
        points.push({
            x: centerX + radius * Math.sin(angle),
            y: centerY - radius * Math.cos(angle),
        })
        const nextAngle = angle + 2 * Math.PI / sides
        const centerAndle = (angle + nextAngle) / 2
        const centerRadius = radius * innerRadius
        points.push({
            x: centerX + centerRadius * Math.sin(centerAndle),
            y: centerY - centerRadius * Math.cos(centerAndle),
        })
        angle = nextAngle
    }
    return points;
}

const MathUtil = {
    distance(pt, lastPt) {
        return Math.sqrt(Math.pow(lastPt.x - pt.x, 2) + Math.pow(lastPt.y - pt.y, 2))
    },
    gougu(width, height) {
        return Math.sqrt(width * width + height * height)
    },
    degToRad(x) {
        return x * Math.PI / 180
    },
    radToDeg(rad) {
        return rad * 180 / Math.PI
    },
    rectCenter(_attr) {
        return {
            x: _attr.x + _attr.width / 2,
            y: _attr.y + _attr.height / 2,
        }
    },
    getPolygonPoints,
    getStarPoints,
    getPointsBBox(points) {
        let left = points[0].x
        let right = points[0].x
        let top = points[0].y
        let bottom = points[0].y
        points.forEach((pt) => {
            if (pt.x < left) {
                left = pt.x
            }
            if (pt.x > right) {
                right = pt.x
            }
            if (pt.y < top) {
                top = pt.y
            }
            if (pt.y > bottom) {
                bottom = pt.y
            }
        })
        const width = right - left
        const height = bottom - top
        return {
            left,
            right,
            top,
            bottom,
            width,
            height,
        }
    },
    translatePoints(points, left) {
        return points.map(pt => {
            return {
                x: pt.x + left,
                y: pt.y,
            }
        })
    },
    scalePoints(points, scale) {
        return points.map(pt => {
            return {
                x: pt.x * scale,
                y: pt.y,
            }
        })
    }
}

let ff2: PluginAPI

function setBorder(_node, node) {
    // const strokes: Stor
    if (node.border) {
        _node.strokes = [
            {
                type: 'SOLID',
                color: hex2FigmaColor(node.border.color || '#000'),
            }
        ]
        _node.strokeWeight = node.border.width || 1
        _node.strokeAlign = 'CENTER'
        // "CENTER" | "INSIDE" | "OUTSIDE"
    }
    else {
        _node.strokes = []
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

    setStyle(_node, node)
}


function setFill(_node, node) {

}

function setStyle(_node, node) {
    if (node.color) {
        let color = hex2FigmaColor(node.color || '#000')
        
        _node.fills = [
            {
                type: 'SOLID',
                color,
            }
        ]
    }
    else {
        _node.fills = []
    }

    // if (node.fill) {
    //     const { type, direction, colors } = node.fill

    //     if (type == 'linearGradient') {
    //         function getTx(deg) {
    //             if (deg >= 120) {
    //                 if (deg >= 180) {
    //                     return 1;
    //                 }
    //                 return 0.5;
    //             }
    //             return 0;
    //         }


    //         function getMatrixForDegrees(deg) {
    //             const rad = parseFloat(deg) * (Math.PI / 180);

    //             const a = Math.round(Math.cos(rad) * 100) / 100;
    //             const b = Math.round(Math.sin(rad) * 100) / 100;
    //             const c = -Math.round(Math.sin(rad) * 100) / 100;
    //             const d = Math.round(Math.cos(rad) * 100) / 100;
    //             const tx = getTx(deg);
    //             const ty = deg >= 120 ? 1 : 0;

    //             return [
    //                 [a, b, tx],
    //                 [c, d, ty],
    //             ];
    //         }


    //         let angle = Math.PI
    //         let transform: any = [
    //             [Math.cos(angle), Math.sin(angle), 0],
    //             [-Math.sin(angle), Math.cos(angle), 0]
    //         ]

    //         const angleMap = {
    //             'right': 0,
    //             'bottom': 90,
    //             'left': 180,
    //             "top": 270,
    //         }

    //         _node.fills = [
    //             {
    //                 type: 'GRADIENT_LINEAR',
    //                 // to right
    //                 // gradientTransform: [[1, 0, 0], [0, 1, 0]],
    //                 gradientTransform: getMatrixForDegrees(angleMap[direction]) as any,
    //                 gradientStops: [
    //                     {
    //                         position: 0,
    //                         color: {
    //                             ...hex2FigmaColor(colors[0]),
    //                             a: 1,
    //                         },
    //                     },
    //                     {
    //                         position: 1,
    //                         color: {
    //                             ...hex2FigmaColor(colors[1]),
    //                             a: 1,
    //                         },
    //                     }
    //                 ]
    //             }
    //         ]
    //     } else {

    //     }
    //     // direction: 'bottom',
    //     //     colors: ['#09c', '#c90'],
    // } else if (node.color != null) {
    //     let color = hex2FigmaColor(node.color || '#000')
    //     _node.fills = [
    //         {
    //             type: 'SOLID',
    //             color,
    //         }
    //     ]
    // } else {
    //     _node.fills = [
    //     ]
    // }
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

//  二   90  一
// 180     0
//  三  -90  四
function getFigmaRotation(node) {
    if (node.y1 == node.y2) {
        // return 0
        if (node.x2 > node.x1) {
            return 0
        }
        return 180
    }
    if (node.x1 == node.x2) {
        if (node.y2 < node.y1) {
            return 90
        }
        else {
            return -90
        }
    }

    const xLength = Math.abs(node.x1 - node.x2)
    const yLength = Math.abs(node.y1 - node.y2)
    const lineLength = MathUtil.gougu(xLength, yLength)
    if (node.x2 > node.x1) {
        if (node.y2 < node.y1) {
            // 第一像限
            return MathUtil.radToDeg(Math.sinh(yLength / lineLength))
        }
        else {
            // 第四像限
            return -MathUtil.radToDeg(Math.sinh(yLength / lineLength))
        }
    }
    else {
        if (node.y2 < node.y1) {
            // 第二像限
            return 180 - MathUtil.radToDeg(Math.sinh(yLength / lineLength))
        }   
        else {
            // 第三像限
            return -(180 - MathUtil.radToDeg(Math.sinh(yLength / lineLength)))
        }
    }

    // let value = getAngleBy2Point({ x: node.x1, y: node.y1 }, { x: node.x2, y: node.y2 })

    // if (node.y2 > node.y1) {
    //     return value - 90
    // }

    // // 90 ~ 270 映射到 0 ~ -180
    // return 0 - (value - 90)


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
    if (sColor.includes('rgb')) {
        const arr = sColor.match(/[\d-.]+/g).map(item => parseFloat(item))
        return arr
    }
    
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

function parseFigmaColor(color: RGB) {
    if (!color) {
        return null
    }
    return `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`
}

figma.showUI(__html__)

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

function parseFrame(node: FrameNode) {
    console.log('parseFrame', node)
    // return JSON.parse(JSON.stringify(node))
    // return someAttr(node, 'id', 'name',)
    return {
        _type: 'frame',
        id: node.id,
        name: node.name,
        width: node.width,
        height: node.height,
    }
}

function parsePage(node: PageNode) {
    return {
        _type: 'group',
        // id: node.id,
        // name: node.name,
        // width: node.width,
        // height: node.height,
    }
}

function parseGroup(node: GroupNode) {
    return {
        _type: 'group',
        // id: node.id,
        // name: node.name,
        // width: node.width,
        // height: node.height,
    }
}

function parseFigmaStoke(node) {
    const strokes: Paint[] = node.strokes
    const stroke: any = strokes[0]
    if (!stroke) {
        return undefined
    }
    console.log('stroke', stroke)
    return {
        color: parseFigmaColor(stroke?.color),
        width: node.strokeWeight || 1
    }
}

function parseCommon(node, extra) {
    return {
        id: node.id,
        name: node.name,
        color: parseFigmaColor(node.fills[0]?.color),
        border: parseFigmaStoke(node),
        ...extra,
    }
}

function parseRect(node: RectangleNode) {
    console.log('parseRect', node.name, node, node.strokes)

    if (node.fills[0]?.type == 'IMAGE') {
        return parseCommon(node, {
            _type: 'image',
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height,
            href: "data:image/png;base64,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",
        })
    }
    return parseCommon(node, {
        _type: 'rect',
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
    })
}

function parsePolygon(node: PolygonNode){

    const edge = node.pointCount
    // console.log('parsePolygon.edge', edge)
    // const angle = (edge - 2) * 180 / edge // 内角

    

    const center = MathUtil.rectCenter(node)

    const size = Math.min(node.width, node.height) / 2

    // const toWidth = Math.cos(MathUtil.degToRad(angle / 2)) * size * 2
    // console.log('parsePolygon.toWidth', toWidth)

    const points = MathUtil.getPolygonPoints(center, size, edge)
    // console.log('parsePolygon.points', points)
    const { left } = MathUtil.getPointsBBox(points)
    // console.log('parsePolygon.left, width', left, width)
    // breakPoint()

    // simple fetch
    // 
    // const scale = node.width / width
    // const ratio = toWidth / Math.min(node.width, node.height)
    const scale = node.width / Math.min(node.width, node.height)
    // const newWith = toWidth * scale
    
    // console.log('parsePolygon.newPoints', newPoints)

    let newPoints = MathUtil.translatePoints(points, -left)
    newPoints = MathUtil.scalePoints(newPoints, scale)

    const { width: newWith } = MathUtil.getPointsBBox(newPoints)
    // console.log('parsePolygon.newWith', newWith)

    newPoints = MathUtil.translatePoints(newPoints, node.x + (node.width - newWith) / 2)
    // newPoints = MathUtil.translatePoints(newPoints, node.x)

    // console.log('parsePolygon.newPoints', newPoints)

    return parseCommon(node, {
        _type: 'polygon',
        // points: points,
        points: newPoints,
    })
}

function parseStar(node: StarNode) {
    console.log('parseStar', node)

    const edge = node.pointCount
    const center = MathUtil.rectCenter(node)
    const size = Math.min(node.width, node.height) / 2
    const points = getStarPoints(center, size, edge, node.innerRadius)
    // console.log('parsePolygon.points', points)
    const { left } = MathUtil.getPointsBBox(points)
    // console.log('parsePolygon.left, width', left, width)
    // breakPoint()

    // simple fetch
    // 
    // const scale = node.width / width
    // const ratio = toWidth / Math.min(node.width, node.height)
    const scale = node.width / Math.min(node.width, node.height)
    // const newWith = toWidth * scale

    // console.log('parsePolygon.newPoints', newPoints)

    let newPoints = MathUtil.translatePoints(points, -left)
    newPoints = MathUtil.scalePoints(newPoints, scale)

    const { width: newWith } = MathUtil.getPointsBBox(newPoints)
    // console.log('parsePolygon.newWith', newWith)

    newPoints = MathUtil.translatePoints(newPoints, node.x + (node.width - newWith) / 2)
    // newPoints = MathUtil.translatePoints(newPoints, node.x)

    // console.log('parsePolygon.newPoints', newPoints)

    return parseCommon(node, {
        _type: 'polygon',
        // points: points,
        points: newPoints,
    })
    // return parseCommon(node, {
    //     _type: 'rect',
    //     x: node.x,
    //     y: node.y,
    //     width: node.width,
    //     height: node.height,
    // })
}

function parseVector(node: VectorNode) {
    console.log('parseVector', node)
    console.log('parseVector.vectorPaths', node.vectorPaths)
    console.log('parseVector.xy', node.x, node.y)

    
    // return {
    //     _type: 'rect',
    //     id: node.id,
    //     name: node.name,
    //     x: node.x,
    //     y: node.y,
    //     width: node.width,
    //     height: node.height,
    // }
    return {
        _type: 'group',
        _children: node.vectorPaths.map(path => {
            console.log('parseVector.path', path)

            const newD = serialize(translate(parse(path.data), node.x, node.y))

            return parseCommon(node, {
                // _type: 'rect',
                // x: node.x,
                // y: node.y,
                // width: node.width,
                // height: node.height,
                _type: 'path',
                d: newD,
            })
            // return {
            // }
        }),   
    }
    return parseCommon(node, {
        _type: 'path',
        d: 'M 0 0 L 100, 100 L 100 0 Z'
        // cx: node.x + node.width / 2,
        // cy: node.y + node.height / 2,
        // rx: node.width / 2,
        // ry: node.height / 2,
    })
}

function parseEllipse(node: EllipseNode) {
    console.log('parseEllipse', node)
    const rect = {
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
    }
    return parseCommon(node, {
        _type: 'ellipse',
        cx: node.x + node.width / 2,
        cy: node.y + node.height / 2,
        rx: node.width / 2,
        ry: node.height / 2,
    })
}



//     90
// 180     0
//    -90
function parseLine(node: LineNode) {
    console.log('parseLine', node, node.rotation)
    console.log('parseLine.xy', node.x, node.y)
    console.log('parseLine.xy rotation', node.rotation)

    const { rotation } = node
    // if (rotation)
    const length = node.width
    // const distance = geoUtil.distance({ x: })
    const start = {
        x: node.x,
        y: node.y,
    }
    console.log('parseLine.start', start)

    function getPoint() {
        if (rotation == 0) {
            return {
                x: start.x + length,
                y: start.y,
            }
        }
        else if (rotation > 0 && rotation < 90) {
            // 第一像限
            const x = Math.abs(Math.cos(MathUtil.degToRad(rotation)) * length)
            const y = Math.abs(Math.sin(MathUtil.degToRad(rotation)) * length)
            console.log('parseLine.xy2 一', x, y, Math.cos(MathUtil.degToRad(rotation)))
            return {
                x: start.x + x,
                y: start.y - y,
            }
        }
        else if (rotation == 90) {
            return {
                x: start.x,
                y: start.y - length,
            }
        }
        else if (rotation > 90 && rotation < 180) {
            // 第二像限
            const x = Math.abs(Math.cos(MathUtil.degToRad(rotation)) * length)
            const y = Math.abs(Math.sin(MathUtil.degToRad(rotation)) * length)
            console.log('parseLine.xy2 二', x, y, Math.cos(MathUtil.degToRad(rotation)))
            return {
                x: start.x - x,
                y: start.y - y,
            }
        }
        else if (rotation == 180) {
            return {
                x: start.x - length,
                y: start.y,
            }
        }
        else if (rotation < 0 && rotation > -90) {
            // 第四像限
            const x = Math.abs(Math.cos(MathUtil.degToRad(rotation)) * length)
            const y = Math.abs(Math.sin(MathUtil.degToRad(rotation)) * length)
            console.log('parseLine.xy2 三', x, y, Math.cos(MathUtil.degToRad(rotation)))
            return {
                x: start.x + x,
                y: start.y + y,
            }
        }
        else if (rotation == -90) {
            return {
                x: start.x,
                y: start.y + length,
            }
        }
        else {
            // 第三像限
            const x = Math.abs(Math.cos(MathUtil.degToRad(rotation)) * length)
            const y = Math.abs(Math.sin(MathUtil.degToRad(rotation)) * length)
            console.log('parseLine.xy2 三', x, y, Math.cos(MathUtil.degToRad(rotation)))
            return {
                x: start.x - x,
                y: start.y + y,
            }

        }
    }
    const end = getPoint()
    
    return parseCommon(node, {
        _type: 'line',
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
    })
    
}

function parseText(node: TextNode) {
    return {
        _type: 'text',
        text: node.characters,
        x: node.x,
        y: node.y,
        textSize: node.fontSize,
    }
}

function someAttr(obj, attrs) {
    const newObj = {}
    for (let key of attrs) {
        newObj[key] = obj[key]
    }
    return newObj
}

function getFrame1Json() {
    console.log('figma', figma)
    const page1 = figma.root.children[0]

    // (window as any)['_page1'] = 12

    console.log('page1', page1)
    const frame1 = page1.children.find(item => item.name == 'frame-1')
    console.log('frame1', frame1)
    console.log('frame1.type', frame1.type)

    const resultJson = uiUtil.treeMap(frame1, {
        childrenKey: 'children',
        childrenSetKey: '_children',
        nodeHandler(node, { children }) {

            console.log('nodeHandler2', node.type, node)


            if (node.type == 'FRAME') {
                return parseFrame(node)
            }
            else if (node.type == 'PAGE') {
                return parsePage(node)
            }
            else if (node.type == 'GROUP') {
                return parseGroup(node)
            }
            else if (node.type == 'RECTANGLE') {
                return parseRect(node)
            }
            else if (node.type == 'VECTOR') {
                return parseVector(node)
            }
            else if (node.type == 'ELLIPSE') {
                return parseEllipse(node)
            }
            else if (node.type == 'POLYGON') {
                return parsePolygon(node)
            }
            else if (node.type == 'STAR') {
                return parseStar(node)
            }
            else if (node.type == 'LINE') {
                return parseLine(node)
            }
            else if (node.type == 'TEXT') {
                return parseText(node)
            }
            // return {
            //     type: node.type,
            //     ...JSON.parse(JSON.stringify(node)),
            // }
            throw new Error(`Unknown Figma Type ${node.type}`)
            // return {
            //     type: node.type,
            //     ...JSON.parse(JSON.stringify(node)),
            // }
        }
    })
    console.log('resultJson', resultJson)
    return resultJson
}

figma.ui.onmessage = msg => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.

    // figma.currentPage.
    // figma.currentPage.children.forEach(child => {
    //     child.remove()
    // })

    
    


    // const nodes: SceneNode[] = [];

    if (msg.type === 'cancel') {
        figma.closePlugin()
    }
    if (msg.type === 'create-json') {
        getFrame1Json()
        // figma.closePlugin()
    }
    if (msg.type === 'create-element') {
        // return
        console.clear()
        const root = getFrame1Json()
        console.log('ROOT?', root)

        console.log('figma', figma)
        const page1 = figma.root.children[0]
        console.log('page1', page1)
        let frame2 = page1.children.find(item => item.name == 'frame-2') as FrameNode
        if (frame2) {
            frame2.remove()
        }
        console.log('frame2', frame2)
        // breakPoint()

        frame2 = figma.createFrame()
        frame2.x = 826
        frame2.y = 0
        frame2.name = 'frame-2'
        frame2.resize(800, 800)
        figma.currentPage.appendChild(frame2)

        // frame2.remove()
        // for
        frame2.fills = [
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
                if (node._type == 'frame') {
                    return {}
                }
                if (node._type == 'rect') {
                    // return createRect(node)
                    console.log('nodeHandler rect', node)
                    const _node = figma.createRectangle();
                    _node.x = node.x
                    _node.y = node.y
                    _node.resize(node.width, node.height)
                    console.log('rect', _node)
                    // rect.width = 100
                    // rect.height = 100
                    setCommon(_node, node)
                    
                    
                    frame2.appendChild(_node)

                    // figma.currentPage.appendChild(rect);
                    // nodes.push(rect);
                    return { _node }
                }
                if (node._type == 'image') {
                    console.log('nodeHandler image')
                    // return createRect(node)
                    let imageHash = figma.createImage(toUint8Array(node.href.replace(/^data:image\/(png|jpg);base64,/, ""))).hash
                    console.log('nodeHandler image2', imageHash)
                    const _node = figma.createRectangle()

                    console.log('createRectangle')

                    _node.x = node.x
                    _node.y = node.y
                    _node.resize(node.width, node.height)
                    console.log('rect', _node)
                    // rect.width = 100
                    // rect.height = 100
                    _node.fills = [
                        { type: "IMAGE", scaleMode: "FIT", imageHash }
                    ]
                    // setCommon(_node, node)
                    // setBorder(_node, node)

                    frame2.appendChild(_node)

                    // figma.currentPage.appendChild(rect);
                    // nodes.push(rect);
                    return { _node }
                }
                if (node._type == 'group') {
                    console.log('nodeHandler group')

                    // console.log('group', node, children)
                    // if (children.length) {
                    //     // throw new Error('??')
                    //     const _node = figma.group(children.map(item => item._node), frame2)
                    //     // let svg = uiUtil.svgObj2Xml(getPolygonSvg(node))
                    //     // const _node = figma.createNodeFromSvg(svg)
                    //     setCommon(_node, node)
                    //     frame2.appendChild(_node)
                    //     return { _node }
                    // }
                    return {}
                }
                if (node._type == 'polygon') {
                    console.log('nodeHandler polygon')

                    let svg = uiUtil.svgObj2Xml(getPolygonSvg(node))
                    const _node = figma.createNodeFromSvg(svg)
                    setCommon(_node, node)
                    frame2.appendChild(_node)
                    return { _node }
                }
                if (node._type == 'path') {
                    console.log('nodeHandler path')

                    let svg = uiUtil.svgObj2Xml(getPathSvg(node))
                    console.log('psvg', svg)
                    const _node = figma.createNodeFromSvg(svg)
                    setCommon(_node, node)
                    frame2.appendChild(_node)
                    return { _node }
                }
                if (node._type == 'polyline') {
                    console.log('nodeHandler polyline')

                    let svg = uiUtil.svgObj2Xml(getPolylinSvg(node))
                    const _node = figma.createNodeFromSvg(svg)
                    setCommon(_node, node)
                    setBorder(_node, node)
                    frame2.appendChild(_node)
                    return { _node }
                }

                if (node._type == 'circle') {
                    console.log('nodeHandler circle')

                    // return createCircle(node)
                    const _node = figma.createEllipse()
                    _node.x = node.cx - node.radius
                    _node.y = node.cy - node.radius
                    _node.resize(node.radius * 2, node.radius * 2)
                    setCommon(_node, node)
                    frame2.appendChild(_node)
                    return { _node }
                }
                if (node._type == 'ellipse') {
                    console.log('nodeHandler ellipse', node)

                    // return createCircle(node)
                    const _node = figma.createEllipse()
                    _node.x = node.cx - node.rx
                    _node.y = node.cy - node.ry
                    _node.resize(node.rx * 2, node.ry * 2)

                    setCommon(_node, node)
                    frame2.appendChild(_node)
                    return { _node }
                }
                if (node._type == 'text') {
                    console.log('nodeHandler_text')

                    // return createText(node)
                    figma.loadFontAsync({ family: "Roboto", style: "Regular" })
                        .then(() => {
                            let _node = figma.createText()
                            _node.x = node.x
                            _node.y = node.y
                            _node.fontSize = node.textSize || 12
                            // text.lineHeight = node.textSize
                            _node.characters = node.text

                            _node.setRangeLineHeight(0, node.text.length, {
                                value: node.textSize || 12, 
                                unit: 'PIXELS'
                            })
                            setCommon(_node, node)
                            frame2.appendChild(_node)

                        })
                    // text.fontName = 'Roboto'
                    return {  }
                }
                if (node._type == 'line') {
                    console.log('nodeHandler line')


                    // return createLine(node)
                    let left = Math.min(node.x1, node.x2)
                    // let left = Math.min(, node.x2)
                    let top = Math.min(node.y1, node.y2)
                    let width = Math.abs(node.x1 - node.x2)
                    let height = Math.abs(node.y1 - node.y2)
                    let right = Math.max(node.x1, node.x2)
                    let bottom = Math.max(node.y1, node.y2)

                    const _node = figma.createLine()
                    _node.x = node.x1
                    _node.y = node.y1
                    const length = Math.sqrt(width * width + height * height)
                    _node.resize(length, 0)
                    _node.rotation = getFigmaRotation(node)

                    // let color = hex2FigmaColor(node.color || '#000')

                    setCommon(_node, node)
                    setBorder(_node, node)
                    // line.resize(width, height)
                    // line.

                    frame2.appendChild(_node)
                    return { _node }
                }
                console.log('node', node)
                throw new Error(`unknown type ${node._type}`)
                // return {
                //     type: 'unknown'
                // }
            }
        })


        // figma.closePlugin();
        // for (let i = 0; i < 3; i++) {
        // }
        // figma.currentPage.selection = nodes;
        // figma.viewport.scrollAndZoomIntoView(nodes);
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    
};
