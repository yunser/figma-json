// import toUint8Array from 'base64-to-uint8array'

import { uiUtil } from '@yunser/ui-std/dist/helper'
import { uid } from 'uid'
// import { extractLinearGradientParamsFromTransform } from '@figma-plugin/helpers'

// extractLinearGradientStartEnd
// var parse = require('parse-svg-path')
// var translate = require('translate-svg-path')
// var serialize = require('serialize-svg-path')
// import { saveAs } from 'file-saver';
// var FileSaver = require('file-saver');
// const JSZip = require('jszip')

import matrixInverse from 'matrix-inverse'
import { text } from 'node:stream/consumers'

import { TreeUtil } from '@yunser/tree-lib'
import { SVGPathData, SVGPathDataTransformer, encodeSVGPath, SVGPathDataParser } from 'svg-pathdata'
import { SVGCommand } from 'svg-pathdata/lib/types'
import isNumber from 'is-number'
// const isNumber = require('is-number');


interface CommonNode {
    id: string
    name: string
    fills: ReadonlyArray<Paint> | PluginAPI['mixed']
    strokes: ReadonlyArray<Paint>
    relativeTransform: Transform
    x: number
    y: number
    width: number
    height: number
    strokeWeight: number
    strokeAlign: "CENTER" | "INSIDE" | "OUTSIDE"
    dashPattern: ReadonlyArray<number>
    rotation: number
}

function normaliseCommands(commands: SVGCommand[]) {
    const map = {
        [SVGPathData.CLOSE_PATH]: 'close',
        [SVGPathData.MOVE_TO]: 'move',
        [SVGPathData.LINE_TO]: 'line',
        [SVGPathData.CURVE_TO]: 'curve',
        // static readonly HORIZ_LINE_TO: 4;
        // static readonly VERT_LINE_TO: 8;
        // static readonly LINE_TO: 16;
        // static readonly CURVE_TO: 32;
        // static readonly SMOOTH_CURVE_TO: 64;
        // static readonly QUAD_TO: 128;
        // static readonly SMOOTH_QUAD_TO: 256;
        // static readonly ARC: 512;
        // static readonly LINE_COMMANDS: number;
        // static readonly DRAWING_COMMANDS: number;
    }
    return commands.map(cmd => {
        return {
            ...cmd,
            // type: map[cmd.type] || cmd.type,
        }
    })
}
console.clear()

console.log('figma.viewport', figma.viewport)
// import { applyMatrixToPoint } from './applyMatrixToPoint'

const default_font_name = { family: "Roboto", style: "Regular" }

function hasRotation(node: CommonNode) {
    // ?????????????????????????????? rotation ????????????????????????
    return node.rotation && !MathUtil.eq(node.relativeTransform[0][1], 0) && !MathUtil.eq(node.relativeTransform[1][0], 0)
}

function getTopLeft(node: CommonNode) {
    if (hasRotation(node)) {
        return {
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height,
        }
    }
    else {
        let rect = {
            // x: node.x,
            // y: node.y,
            x: MathUtil.eq(node.relativeTransform[0][0], 1) ? node.x : (node.x + node.width * node.relativeTransform[0][0]),
            y: MathUtil.eq(node.relativeTransform[1][1], 1) ? node.y : (node.y + node.height * node.relativeTransform[1][1]),
            width: node.width,
            height: node.height,
        }
        // console.log('getTopLeft', node.name, rect)
        return rect
    }
}


function isSame(item, lastItem) {
    return item.fontSize == lastItem.fontSize
        && item.color == lastItem.color
        && item.font.family == lastItem.font.family
        && item.font.style == lastItem.font.style
        && item.lineHeight == lastItem.lineHeight
}

function mergeStyles(list) {
    const results = []
    let lastItem: any = null
    let start = 0
    let text = ''

    list.forEach((item, idx) => {
        console.log('item', item.text)
        if (!lastItem) {
            lastItem = item
            text = item.text
        }
        else {
            if (isSame(item, lastItem)) {
                text += item.text
                console.log('??????')
            }
            else {
                console.log('??????')
                results.push({
                    ...lastItem,
                    text,
                    start,
                    end: idx - 1,
                })
                lastItem = item
                text = item.text
                start = idx

            }
        }
    })

    results.push({
        ...lastItem,
        text,
        start,
        end: list.length - 1,
    })

    return results
}

function applyMatrixToPoint(matrix: number[][], point: number[]) {
    return [
        point[0] * matrix[0][0] + point[1] * matrix[0][1] + matrix[0][2],
        point[0] * matrix[1][0] + point[1] * matrix[1][1] + matrix[1][2]
    ]
}

/**
 * This method can extract the x and y positions of the start and end of the linear gradient
 * (scale is not important here)
 *
 * @param shapeWidth number
 * @param shapeHeight number
 * @param t Transform
 */
export function extractLinearGradientParamsFromTransform(
	// shapeWidth: number,
	// shapeHeight: number,
	t: Transform
) {
	const transform = t.length === 2 ? [...t, [0, 0, 1]] : [...t]
	const mxInv = matrixInverse(transform)
	const startEnd = [
		[0, 0.5],
		[1, 0.5]
	].map((p) => applyMatrixToPoint(mxInv, p))
	return {
		// start: [startEnd[0][0] * shapeWidth, startEnd[0][1] * shapeHeight],
		// end: [startEnd[1][0] * shapeWidth, startEnd[1][1] * shapeHeight]
        from: {
            x: startEnd[0][0],
            y: startEnd[0][1]
        },
        to: {
            x: startEnd[1][0],
            y: startEnd[1][1],
        }
	}
}

// ???????????????????????????
async function treeMap(treeObj, options: any = {}) {

    const { nodeHandler, childrenKey = 'children', childrenSetKey = 'children' } = options

    async function dealList(children, level, p) {
        let results: any[] = []
        for (let child of children) {
            results.push(await dealObj(child, level, p))
            // content += (indent ? ('\n' + textLoop(indent, level)) : '') + 
        }
        // content += (indent ? (textLoop(indent, level) + '\n') : '')
        return results
    }

    async function dealObj(obj, level = 0, parent, ctx = {}) {
        let children: any[] = []
        if (obj[childrenKey] && obj[childrenKey].length) {
            children = await dealList(obj[childrenKey], level + 1, obj)
        }

        let result = await nodeHandler(obj, { level, parent, children })
        if (children.length) {
            result[childrenSetKey] = children
        }
        return result
        // let attrContent = ''
        // if (obj.attr) {
        //     for (let key in obj.attr) {
        //         attrContent += ` ${key}="${obj.attr[key]}"`
        //     }
        // }

        // return result
    }

    return dealObj(treeObj, 0, null, {})
}

// console.log('uiUtil', uiUtil)

function breakPoint() {
    throw new Error('breakPoint')
}

// ????????????
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

const Helper = {
    syncMap: async (arr, callback) => {
        const result = []
        let idx = 0
        for (let item of arr) {
            result.push(await callback(item, idx++))
        }
        // return Promise.all(arr.map(async (item, index) => {
        //     await callback(item, index);
        //     // console.log("a");
        // }));
        return result
    }
}
const MathUtil = {
    eq(num1: number, num2: number) {
        const decimal = 4
        return num1.toFixed(decimal) == num2.toFixed(decimal)
    },
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
    },
    //    270
    // 180    0
    //     90
    getPtByAngle(deg, radius) {
        // let theta = (n - 3) * (Math.PI * 2) / 12;
        // const deg = 
        const rad = MathUtil.degToRad(deg)
        let x = radius * Math.cos(rad);
        let y = radius * Math.sin(rad);
        return {
            x,
            y,
        }
    },
    getPtByCenterAndAngle(center, deg, radius) {
        // let theta = (n - 3) * (Math.PI * 2) / 12;
        // const deg = 
        const rad = MathUtil.degToRad(deg)
        let x = radius * Math.cos(rad);
        let y = radius * Math.sin(rad);
        return {
            x: center.x + x,
            y: center.y + y,
        }
    },
}

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

// console.log('getFigmaRotation', getFigmaRotation)
// ?????????????????????
function getAngleBy2Point(a, b) {
    return getAngle(b.x - a.x, b.y - a.y)
}

// ?????????????????????????????????
function getAngle(x, y) {
    let dAngle = _getAngle(x, y)
    if (dAngle === 360) {
        dAngle = 0
    }
    return dAngle
}

// ??????????????????????????????????????????
function _getAngle(x, y) {
    console.log('_getAngle', x, y)
    if (x === 0 && y === 0) {
        return null
    }

    let hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    //????????????
    let cos = x / hypotenuse;
    let radian = Math.acos(cos);
    //????????????
    let angle = 180 / (Math.PI / radian);
    //?????????????????????
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

//  ???   90  ???
// 180     0
//  ???  -90  ???
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
            // ????????????
            return MathUtil.radToDeg(Math.sinh(yLength / lineLength))
        }
        else {
            // ????????????
            return -MathUtil.radToDeg(Math.sinh(yLength / lineLength))
        }
    }
    else {
        if (node.y2 < node.y1) {
            // ????????????
            return 180 - MathUtil.radToDeg(Math.sinh(yLength / lineLength))
        }   
        else {
            // ????????????
            return -(180 - MathUtil.radToDeg(Math.sinh(yLength / lineLength)))
        }
    }

    // let value = getAngleBy2Point({ x: node.x1, y: node.y1 }, { x: node.x2, y: node.y2 })

    // if (node.y2 > node.y1) {
    //     return value - 90
    // }

    // // 90 ~ 270 ????????? 0 ~ -180
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
        //????????????????????????
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

// function componentToHex(c) {
//   var hex = c.toString(16);
//   return hex.length == 1 ? "0" + hex : hex;
// }

// function rgbToHex(r, g, b) {
//   return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
// }

// alert(rgbToHex(0, 51, 255)); // #0033ff

function parseFigmaToStdColor(color: RGB, opacity) {
    if (!color) {
        return null
    }
    return {
        red: color.r,
        green: color.g,
        blue: color.b,
        alpha: opacity,
    }
    return rgbToHex(Math.ceil(color.r * 255), Math.ceil(color.g * 255), Math.ceil(color.b * 255))
    // return `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`
}

function parseFigmaColor(color: RGB) {
    if (!color) {
        return null
    }
    return rgbToHex(Math.ceil(color.r * 255), Math.ceil(color.g * 255), Math.ceil(color.b * 255))
    // return `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`
}

function parseRgba(color: RGBA) {
    if (!color) {
        return null
    }
    return rgbToHex(Math.ceil(color.r * 255), Math.ceil(color.g * 255), Math.ceil(color.b * 255))
    // return `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`
}

figma.showUI(__html__)

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

async function parseFrame(node: FrameNode, parent, context) {
    console.log('parseFrame', node.name, node, parent)
    console.log('parseFrame.itemSpacing', node.itemSpacing)
    // return JSON.parse(JSON.stringify(node))
    // return someAttr(node, 'id', 'name',)
    if (parent) {
        // inner frame
        let rect = {
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height,
        }
        if (context._frameRect) {
            rect.x = context._frameRect.x + rect.x
            rect.y = context._frameRect.y + rect.y
        }

        if (context._frameRect) {
            context._frameRect = {
                x: context._frameRect.x + node.x,
                y: context._frameRect.y + node.y,
                // width: node.width,
                // height: node.height,
            }
        }
        else {
            context._frameRect = {
                x: node.x,
                y: node.y,
                // width: node.width,
                // height: node.height,
            }
        }

        const bg = await parseCommon(node, {
            _type: 'rect',
            id: (node.id || '') + '-' + uid(16),
            name: (node.name ? (node.name + '-') : '') + 'bg',
            ...rect,
            mask: true,
        })
        console.log('parseFrame.bg', bg)
        return {
            _type: 'group',
            id: node.id,
            name: node.name,
            ...rect,
            children: [
                bg
            ],
        }
    }

    // outer frame
    return {
        _type: 'frame',
        id: node.id,
        name: node.name,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        mark: node.isMask, // TODO ??????
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

async function parseGroup(node: GroupNode) {
    return await parseCommon(node, {
        _type: 'group',
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
    })
    // return {
    //     _type: 'group',
    //     id: node.id,
    //     name: node.name,
    //     x: node.x,
    //     y: node.y,
    //     width: node.width,
    //     height: node.height,
    //     mark: node.isMask, // TODO ??????
    // }
}

function parseEffects(node) {
    const effect0: Effect = node.effects[0]
    let shadow = null
    let innerShadow = null
    let blur = null
    if (effect0) {
        if (effect0.type == 'DROP_SHADOW') {
            shadow = {
                x: effect0.offset.x,
                y: effect0.offset.y,
                blur: effect0.radius,
                spread: effect0.spread,
                color: parseRgba(effect0.color),
                alpha: effect0.color.a,
            }
        }
        if (effect0.type == 'INNER_SHADOW') {
            innerShadow = {
                x: effect0.offset.x,
                y: effect0.offset.y,
                blur: effect0.radius,
                spread: effect0.spread,
                color: parseRgba(effect0.color),
                alpha: effect0.color.a,
            }
        }
        if (effect0.type == 'LAYER_BLUR') {
            blur = {
                type: 'layer',
                radius: effect0.radius,
            }
        }
        if (effect0.type == 'BACKGROUND_BLUR') {
            blur = {
                type: 'background',
                radius: effect0.radius,
            }
        }
    }

    return {
        // effects: 
        shadow,
        innerShadow,
        blur,
    }
}

function parseGradientPaint(paint: GradientPaint) {
    const params = extractLinearGradientParamsFromTransform(paint.gradientTransform)

    return {
        type: 'linearGradient',
        visible: paint.visible,
        opacity: paint.opacity,
        from: params.from,
        to: params.to,
        // direction: 0,
        stops: paint.gradientStops.map(item => {
            return {
                color: parseRgba(item.color),
                position: item.position,
                alpha: item.color.a,
            }
        }),
    }
}

function parseStoke(node: CommonNode) {
    console.log('parseStoke', node)
    // group ?????? strokes
    const strokes: Paint[] = (node.strokes || []).filter(item => item.type == 'SOLID' || item.type == 'GRADIENT_LINEAR')
    return strokes.map(item => {
        const stroke0 = item
        // const stroke0: any = (strokes || [])[0]
        // if (!stroke0) {
        //     return undefined
        // }
        // console.log('stroke', stroke)
        const map = {
            "CENTER": 'center',
            "INSIDE": 'inside',
            "OUTSIDE": 'outside',
        }
        
        const commonAttr = {
            width: node.strokeWeight || 1,
            position: map[node.strokeAlign],
            opacity: stroke0.opacity,
            dashed: node.dashPattern,
        }
        if (stroke0.type == 'SOLID') {
            
            return {
                ...commonAttr,
                type: 'color',
                color: parseFigmaColor(stroke0?.color),
            }
        }
        else if (stroke0.type == 'GRADIENT_LINEAR') {
            return {
                ...commonAttr,
                ...parseGradientPaint(stroke0),
            }
        }
    })
}



async function parseFills(node: CommonNode) {
    // let color = null
    // let fill = null
    if (node.fills == figma.mixed) {
        return []
    }
    console.log('node.fills', node.fills, node)
    const fills = (node.fills || []).filter(item => item.type == 'SOLID' || item.type == 'GRADIENT_LINEAR' || item.type == 'IMAGE')
    
    return await Helper.syncMap(fills, async (item) => {

        const fill0 = item
        // if (!fill0) {
        //     return {
        //         color,
        //         fill,
        //     }
        // }
        if (fill0.type == 'SOLID') {
            return {
                type: 'color',
                visible: fill0.visible,
                color: parseFigmaToStdColor(fill0.color, fill0.opacity),
                // direction: 0,
            }
            // color = parseFigmaColor(fill0.color)
            // return {
            //     fill,
            //     color,
            // }
        }
        if (fill0.type == 'IMAGE') {
            const img = figma.getImageByHash(fill0.imageHash)

            const u8arr = await img.getBytesAsync()
            const base64 = figma.base64Encode(u8arr)
            
            return {
                type: 'image',
                visible: fill0.visible,
                opacity: fill0.opacity,
                image: base64,
            }
        }
        else if (fill0.type == 'GRADIENT_LINEAR') {
            const paint: GradientPaint = fill0
            
            // console.log('gradientTransform', node.name, paint.gradientTransform)
    
            // const gradientStops: ColorStop[] = fill0.gradientStops
            // const params = extractLinearGradientParamsFromTransform(paint.gradientTransform)
            // console.log('gradientTransform.params', node.name, params)
    
            return parseGradientPaint(paint)
        }
    })
    // 
    // return {
    //     fill,
    //     color,
    // }
}

function parseExportSettings(exportSettings: ExportSettings[]) {
    return exportSettings.map(setting => {
        return {
            format: setting.format.toLocaleLowerCase(),
            suffix: setting.suffix,
            constraint: (setting as any).constraint || null,
        }
    })
}

async function parseCommon(node, extra, opts: any = {}) {
    console.log('parseCommon', node.name, node)
    const {
        context,
        frameLike = false,
        style = true,
        calBox = false,
        onCalc,
    } = opts

    let result = {
        id: node.id,
        name: node.name,
        mask: node.isMask,
        locked: node.locked,
        visible: node.visible,
        ...extra,
        // rotation: node.rotation,
        exportSettings: parseExportSettings(node.exportSettings),
        cornerRadius: node.cornerRadius == figma.mixed ? 0 : node.cornerRadius,
    }

    if (context) {
        console.log('parseCommon.rect0', {x: node.x, y: node.y})
        let rect = getTopLeft(node)
        console.log('parseCommon.rect', rect)

        result.flipH = MathUtil.eq(node.relativeTransform[0][0], -1)
        result.flipV = MathUtil.eq(node.relativeTransform[1][1], -1)


        console.log('parseCommon.rotation', node.rotation)
        console.log('parseCommon.relativeTransform', node.relativeTransform)
        if (hasRotation(node)) {
            const { x, y } = getRotationXy(rect, node.rotation)
            rect.x = x
            rect.y = y
            result.rotation = node.rotation
        }
        else {
            result.rotation = 0
        }
        // let rect = {
        //     x: node.x,
        //     y: node.y,
        //     width: node.width,
        //     height: node.height,
        // }

        if (context._frameRect) {
            console.log('parseCommon._frameRect', context._frameRect)
            rect.x = context._frameRect.x + rect.x
            rect.y = context._frameRect.y + rect.y
        }
    
        if (frameLike) {
            if (context._frameRect) {
                context._frameRect = {
                    x: context._frameRect.x + rect.x,
                    y: context._frameRect.x + rect.y,
                    // width: node.width,
                    // height: node.height,
                }
            }
            else {
                context._frameRect = {
                    x: rect.x,
                    y: rect.y,
                    // width: node.width,
                    // height: node.height,
                }
            }
        }

        if (calBox) {
            console.log('parseCommon.calBox', rect.x)
            result.x = rect.x
            result.y = rect.y
            result.width = rect.width
            result.height = rect.height
        }

        if (onCalc) {
            result = {
                ...result,
                ...onCalc({ rect }).attr,
            }
        }
    }

    // console.log('parseCommon.exportSettings', node.exportSettings)
    
    if (style) {
        result = {
            fills: await parseFills(node),
            strokes: parseStoke(node),
            ...parseEffects(node),
            ...result,
        }
    }
    return result
}

async function parseComponentOrInstance(node: InstanceNode, context) {
    console.log('parseComponent', node.name, node, node.children)
    // console.log('parseComponent.mainComponent', node.mainComponent, node.mainComponent.type) // COMPONENT

    let rect = {
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
    }
    if (context._frameRect) {
        rect.x = context._frameRect.x + rect.x
        rect.y = context._frameRect.y + rect.y
    }

    if (context._frameRect) {
        context._frameRect = {
            x: context._frameRect.x + node.x,
            y: context._frameRect.y + node.y,
            // width: node.width,
            // height: node.height,
        }
    }
    else {
        context._frameRect = {
            x: node.x,
            y: node.y,
            // width: node.width,
            // height: node.height,
        }
    }

    return await parseCommon(node, {
        _type: 'group',
        id: node.id,
        name: node.name,
        ...rect,
        children: [
            await parseCommon(node, {
                _type: 'rect',
                id: (node.id || '') + '-' + uid(16),
                name: (node.name ? (node.name + '-') : '') + 'bg',
                ...rect,
            })
        ],
    }, {
        // frameLike: true,
        context,
        style: false,
    })

    // return await parseCommon(node, {
    //     _type: 'group',
    //     x: node.x,
    //     y: node.y,
    //     width: node.width,
    //     height: node.height,
    // }, {
    //     frameLike: true,
    //     context,
    //     style: false,
    // })
}

function getRotationXy(rect, rotation) {
    const length = MathUtil.gougu(rect.width / 2, rect.height / 2)
    // console.log('getRotationXy.length', length)
    const topLeft = {
        x: rect.x,
        y: rect.y
    }
    const { width, height } = rect
    // console.log('getRotationXy.topLeft', topLeft)
    // console.log('getRotationXy.topLeft', topLeft)
    //    90
    // 180    0
    //    -90
    // =>
    //    270
    // 180    0
    //     90
    function getRelAngle(rotation) {
        return rotation * -1
        // if (rotation <= 0) {
        // }
        // return 180

        // return -45
    }
    const relAngle = getRelAngle(rotation)
    const topCenter = MathUtil.getPtByCenterAndAngle(topLeft, relAngle, width / 2)
    // console.log('getRotationXy.topCenter', topCenter)
    const center = MathUtil.getPtByCenterAndAngle(topCenter, relAngle + 90, height / 2)
    // console.log('getRotationXy.center', center)
    const x = center.x - width / 2
    const y = center.y - height / 2
    // console.log('getRotationXy.xy', rect.x, rect.y)
    return {x, y}
}

async function parseRect(node: RectangleNode, context) {
    console.log('parseRect', node.name, node, node.strokes)

    // console.log('parseRect.fillGeometry', node.fillGeometry)
    // console.log('parseRect.relativeTransform', node.relativeTransform)
    // console.log('parseRect.rotation', node.rotation)
    // console.log('parseRect.absoluteTransform', node.absoluteTransform)

    // const fill0 = node.fills[0]
    // if (fill0?.type == 'IMAGE') {
    //     const img = figma.getImageByHash(fill0.imageHash)

    //     const u8arr = await img.getBytesAsync()
    //     const base64 = figma.base64Encode(u8arr)
    //     // console.log('base64', base64)

    //     return await parseCommon(node, {
    //         _type: 'image',
    //         x: node.x,
    //         y: node.y,
    //         width: node.width,
    //         height: node.height,
    //         href: `data:image/png;base64,${base64}`,
    //     })
    // }

    // let rect = getTopLeft(node)
    // console.log('parseRect.rect', rect)
    // if (node.rotation) {
    //     const {x, y} = getRotationXy(rect, node.rotation)
    //     rect.x = x
    //     rect.y = y
    // }
    // console.log('parseRect._frameRect', context._frameRect)
    // if (context._frameRect) {
    //     rect.x = context._frameRect.x + rect.x
    //     rect.y = context._frameRect.y + rect.y
    // }

    return await parseCommon(node, {
        _type: 'rect',
        // ...rect,
        // x: node.x,
        // y: node.y,
        // width: node.width,
        // height: node.height,
    }, {
        context,
        calBox: true,
    })
}

async function parseBoolean(node: BooleanOperationNode) {
    return await parseCommon(node, {
        _type: 'boolOp',
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        opType: node.booleanOperation,
    })
}

async function parsePolygon(node: PolygonNode) {

    const edge = node.pointCount
    // console.log('parsePolygon.edge', edge)
    // const angle = (edge - 2) * 180 / edge // ??????

    

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

    return await parseCommon(node, {
        _type: 'polygon',
        // points: points,
        points: newPoints,
    })
}

async function parseStar(node: StarNode) {
    // console.log('parseStar', node)

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

    return await parseCommon(node, {
        _type: 'polygon',
        // points: points,
        points: newPoints,
    })
    // return await parseCommon(node, {
    //     _type: 'rect',
    //     x: node.x,
    //     y: node.y,
    //     width: node.width,
    //     height: node.height,
    // })
}

async function parseVector(node: VectorNode, context) {
    console.log('parseVector', node.name, node)
    console.log('parseVector.vectorNetwork', node.vectorNetwork)
    // console.log('parseVector.fillGeometry', node.fillGeometry)
    // console.log('parseVector.vectorPaths', node.vectorPaths)
    return await parseCommon(node, {}, {
        context,
        calBox: true,
        onCalc: ({ rect }) => {

            let ptIdx = 0
            const data = node.vectorPaths.map((path, pathIdx) => {
                // console.log('parseVector.path', path)
                // console.log('parseVector.cornerRadius', node.cornerRadius)

                // const newD = serialize()
                // data += newD
                let { commands } = new SVGPathData(path.data).translate(rect.x, rect.y)
                commands = normaliseCommands(normaliseCommands(commands))
                console.log('parseVector.commands', commands)

                let regions = node.vectorNetwork.regions || []
                if (!regions.length) {
                    let loops = []
                    for (let i = 0; i < node.vectorNetwork.vertices.length; i++) {
                        loops.push(i)
                    }
                    regions = ([{
                        loops: [loops]
                    }]) as any
                }
                // console.log('parseVector.regions', regions)
                const region = regions[pathIdx]
                // console.log('parseVector.region', region)

                const pointNum = region.loops[0].length
                return region.loops[0].map((segIdx, cmdIdx)=> {
                    // console.log('parseVector.cmd', cmd)
                    // console.log('parseVector.ptIdx', ptIdx)
                    const vertice = node.vectorNetwork.vertices[segIdx]

                    let cmd = commands[cmdIdx]
                    // TODO ??????????????????
                    if (cmdIdx == 0 && commands[pointNum] && commands[pointNum].type !== SVGPathData.CLOSE_PATH) {
                        cmd = commands[pointNum]
                    }

                    return {
                        cornerRadius: isNumber(vertice.cornerRadius) ? vertice.cornerRadius : node.cornerRadius == figma.mixed ? 0 : (node.cornerRadius || 0),
                        ...cmd,
                        // vertice,
                        // segIdx,
                        // commandsLength: commands.length,

                    }
                })
                // return {
                //     type: 'xx',
                //     ddd: translate(parse(path.data), rect.x, rect.y),
                // }
            })
            
            return {
                attr: {
                    _type: 'path',
                    commands: data,
                }
            }
        },
    })
}

async function parseEllipse(node: EllipseNode, context) {
    // console.log('parseEllipse', node.name, node)
    // const rect = {
    //     x: node.x,
    //     y: node.y,
    //     width: node.width,
    //     height: node.height,
    // }
    // console.log('parseEllipse.rect', rect)
    // if (node.rotation) {
    //     const { x, y } = getRotationXy(rect, node.rotation)
    //     rect.x = x
    //     rect.y = y
    // }
    // if (context._frameRect) {
    //     console.log('parseEllipse.isFrame')
    //     rect.x = context._frameRect.x + rect.x
    //     rect.y = context._frameRect.y + rect.y
    // }

    // return await parseCommon(node, {
    //     _type: 'ellipse',
    //     cx: rect.x + rect.width / 2,
    //     cy: rect.y + rect.height / 2,
    //     rx: rect.width / 2,
    //     ry: rect.height / 2,
    // })

    return await parseCommon(node, {}, {
        context,
        calBox: true,
        onCalc: ({ rect }) => {
            return {
                attr: {
                    _type: 'ellipse',
                    cx: rect.x + rect.width / 2,
                    cy: rect.y + rect.height / 2,
                    rx: rect.width / 2,
                    ry: rect.height / 2,
                }
            }
        },
    })
}



//     90
// 180     0
//    -90
async function parseLine(node: LineNode) {
    // console.log('parseLine', node, node.rotation)
    // console.log('parseLine.xy', node.x, node.y)
    // console.log('parseLine.xy rotation', node.rotation)

    const { rotation } = node
    // if (rotation)
    const length = node.width
    // const distance = geoUtil.distance({ x: })
    const start = {
        x: node.x,
        y: node.y,
    }
    // console.log('parseLine.start', start)

    function getPoint() {
        if (rotation == 0) {
            return {
                x: start.x + length,
                y: start.y,
            }
        }
        else if (rotation > 0 && rotation < 90) {
            // ????????????
            const x = Math.abs(Math.cos(MathUtil.degToRad(rotation)) * length)
            const y = Math.abs(Math.sin(MathUtil.degToRad(rotation)) * length)
            // console.log('parseLine.xy2 ???', x, y, Math.cos(MathUtil.degToRad(rotation)))
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
            // ????????????
            const x = Math.abs(Math.cos(MathUtil.degToRad(rotation)) * length)
            const y = Math.abs(Math.sin(MathUtil.degToRad(rotation)) * length)
            // console.log('parseLine.xy2 ???', x, y, Math.cos(MathUtil.degToRad(rotation)))
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
            // ????????????
            const x = Math.abs(Math.cos(MathUtil.degToRad(rotation)) * length)
            const y = Math.abs(Math.sin(MathUtil.degToRad(rotation)) * length)
            // console.log('parseLine.xy2 ???', x, y, Math.cos(MathUtil.degToRad(rotation)))
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
            // ????????????
            const x = Math.abs(Math.cos(MathUtil.degToRad(rotation)) * length)
            const y = Math.abs(Math.sin(MathUtil.degToRad(rotation)) * length)
            // console.log('parseLine.xy2 ???', x, y, Math.cos(MathUtil.degToRad(rotation)))
            return {
                x: start.x - x,
                y: start.y + y,
            }

        }
    }
    const end = getPoint()
    
    return await parseCommon(node, {
        _type: 'line',
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
    })
    
}

async function parseText(node: TextNode, context) {
    console.log('parseText', node)
    // console.log('parseText.characters', node.characters)
    // console.log('parseText.fontName', node.fontName)
    // console.log('parseText.fillGeometry', node.fillGeometry)
    // console.log('parseText.letterSpacing', node.letterSpacing)
    // console.log('parseText.fontSize', node.fontSize)
    // console.log('parseText.insertCharacters', node.insertCharacters)
    // const allTextNodes = figma.root.findAllWithCriteria({
    //     types: ["TEXT"],
    // })
    // console.log('parseText.allTextNodes', allTextNodes)
    // const fonts = node.getRangeAllFontNames(0, node.characters.length)
    // console.log('parseText.fonts', fonts)
    let rect = {
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
    }
    // console.log('parseText.rect', rect)
    if (node.rotation) {
        const { x, y } = getRotationXy(rect, node.rotation)
        rect.x = x
        rect.y = y
    }
    // console.log('parseText._frameRect', context._frameRect)
    if (context._frameRect) {
        rect.x = context._frameRect.x + rect.x
        rect.y = context._frameRect.y + rect.y
    }

    function parseLetterSpacing(letterSpacing: LetterSpacing, fontSize) {
        if (letterSpacing.unit == 'PIXELS') {
            return letterSpacing.value
        }
        // 'PERCENT'
        if (fontSize) {
            return letterSpacing.value / 100 * fontSize
        }
        return 0
        // only unit: "PIXELS" | "PERCENT"
    }

    function parseLineHeight(lineHeight: LineHeight, fontSize?: any) {
        if (lineHeight.unit == 'AUTO') {
            return null
        }
        if (lineHeight.unit == 'PIXELS') {
            return lineHeight.value
        }
        if (lineHeight.unit == 'PERCENT') {
            if (fontSize) {
                return lineHeight.value / 100 * fontSize
            }
            return null
            // return lineHeight.value
        }
    }

    const subTexts = []
    const fullText = node.characters
    for (let i = 0; i < fullText.length; i++) {
        const fonts = node.getRangeAllFontNames(i, i + 1)
        const fontSize = node.getRangeFontSize(i, i + 1)
        // console.log('fontSizes', fontSize)
        const fills = node.getRangeFills(i, i + 1)
        const lineHeight = node.getRangeLineHeight(i, i + 1)
        subTexts.push({
            text: fullText.charAt(i),
            font: fonts[0],
            fontSize: fontSize,
            lineHeight: parseLineHeight((lineHeight) as any),
            color: parseFigmaColor(fills[0].color),
        })
    }
    // console.log('parseText.subTexts', JSON.stringify(subTexts, null ,4))


    
    // {
    //     family: "zcool-gdh"
    //     style: "Regular"
    // }

    // node.getStyledTextSegments(0, )

    // console.log('parseText.rich_before')
    const rich = mergeStyles(subTexts)
    // console.log('parseText.rich', rich)


    const alignMap = {
        'LEFT': 'left',
        'CENTER': 'center',
        'RIGHT': 'right',
        // textAlignHorizontal: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED"
    }

    // const font = node.fontName != figma.mixed ? node.fontName : { family: "Roboto", style: "Regular" };

    
    const result = await parseCommon(node, {
        _type: 'text',
        text: node.characters,
        ...rect,
        // x: node.x,
        // y: node.y,
        // width: node.width,
        // height: node.height,
        letterSpacing: node.letterSpacing == figma.mixed ? undefined : parseLetterSpacing(node.letterSpacing, node.fontSize == figma.mixed ? undefined : node.fontSize),
        textSize: node.fontSize == figma.mixed ? undefined : node.fontSize,
        lineHeight: node.lineHeight == figma.mixed ? undefined : parseLineHeight(node.lineHeight, node.fontSize == figma.mixed ? undefined : node.fontSize),
        fontFamily: (node.fontName as any).family, // TODO mixed
        align: alignMap[node.textAlignHorizontal],
        rich,
        // characters
        // "fontFamily": {
        //     "family": "Roboto",
        //     "style": "Regular"
        // }
    })
    // console.log('parseText.result', result)
    return result
}

function someAttr(obj, attrs) {
    const newObj = {}
    for (let key of attrs) {
        newObj[key] = obj[key]
    }
    return newObj
}

// cjh
async function getAllJson() {
    const pages = figma.root.children
    return {
        version: '1',
        _type: 'document',
        pages: await Helper.syncMap(pages, async (page: PageNode) => {
            const frames = page.children.filter(item => item.type == 'FRAME')
            return {
                _type: 'page',
                name: page.name,
                _children: await Helper.syncMap(frames, async frame => {
                    return await parseOutFrame(frame)
                }),
            }
        }),
    }
}

async function getFrame1Json() {
    // console.log('figma', figma)
    const page1_will = figma.root.children[0]

    // (window as any)['_page1'] = 12

    // console.log('page1', page1_will)
    const frame1 = page1_will.children.find(item => item.name == 'frame-1')
    return await parseOutFrame(frame1)
    
}

async function parseOutFrame(frame1) {
    // console.log('frame1', frame1)
    // console.log('frame1.type', frame1.type)
    const resultJson = TreeUtil.map(frame1, {
        childrenKey: 'children',
        childrenSetKey: '_children',
        // childrenReverse: true,
        async nodeHandler(node, { parent, context }) {

            console.log('parseAll', node.type, node.name, node)


            if (node.type == 'FRAME') {
                return await parseFrame(node, parent, context)
            }
            else if (node.type == 'PAGE') {
                return await parsePage(node)
            }
            else if (node.type == 'GROUP') {
                return await parseGroup(node)
            }
            else if (node.type == 'RECTANGLE') {
                return await parseRect(node, context)
            }
            else if (node.type == 'VECTOR') {
                return await parseVector(node, context)
            }
            else if (node.type == 'ELLIPSE') {
                return await parseEllipse(node, context)
            }
            else if (node.type == 'POLYGON') {
                return await parsePolygon(node)
            }
            else if (node.type == 'STAR') {
                return await parseStar(node)
            }
            else if (node.type == 'LINE') {
                return await parseLine(node)
            }
            else if (node.type == 'TEXT') {
                return await parseText(node, context)
            }
            else if (node.type == 'BOOLEAN_OPERATION') {
                return await parseBoolean(node)
            }
            else if (node.type == 'INSTANCE') {
                return await parseComponentOrInstance(node, context)
            }
            else if (node.type == 'COMPONENT') {
                return await parseComponentOrInstance(node, context)
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

function handleTooltipMsg(msg) {
// type: "tooltip", data: "copied"
    figma.notify(msg.data)
}

figma.ui.onmessage = async msg => {
    console.log('ui.onmessage', msg)
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.

    // figma.currentPage.
    // figma.currentPage.children.forEach(child => {
    //     child.remove()
    // })

    if (msg.type == 'tooltip') {
        handleTooltipMsg(msg)
    }
    // const nodes: SceneNode[] = [];
    else if (msg.type === 'cancel') {
        var blob = new Blob(["Hello, world!"], { type: "text/plain;charset=utf-8" });
        // saveAs(blob, "hello world.txt");
        // figma.closePlugin()
        // var zip = new JSZip();

        // zip.file("Hello.txt", "Hello World\n");

        // var img = zip.folder("images");
        // // img.file("smile.gif", imgData, { base64: true });

        // zip.generateAsync({ type: "blob" }).then(function (content) {
        //     // see FileSaver.js
        //     console.log('blob', blob)
        //     // saveAs(content, "example.zip");
        // });


    }
    if (msg.type === 'create-json') {
        console.clear()
        const json = await getAllJson()
        console.log('json_result0', json)
        console.log('json_result', JSON.stringify(json, null, 4))
        // figma.closePlugin()
        figma.ui.postMessage({
            type: 'create-json-callback',
            message: {
                json,
            },
        })
    }
    if (msg.type === 'create-element') {
        // return
        console.clear()
        const root = await getFrame1Json()
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
                    setCommon(_node, node)
                    
                    
                    frame2.appendChild(_node)

                    // figma.currentPage.appendChild(rect);
                    // nodes.push(rect);
                    return { _node }
                }
                if (node._type == 'image') {
                    console.log('nodeHandler image')
                    // return createRect(node)
                    // const u8arr = toUint8Array(node.href.replace(/^data:image\/(png|jpg);base64,/, ""))
                    const u8arr = figma.base64Decode(node.href.replace(/^data:image\/(png|jpg);base64,/, ""))
                    console.log('nodeHandler.u8arr', u8arr)
                    const img = figma.createImage(u8arr)
                    console.log('nodeHandler.img', img)
                    let imageHash = img.hash
                    console.log('nodeHandler imageHash', imageHash)
                    const _node = figma.createRectangle()

                    console.log('createRectangle')

                    _node.x = node.x
                    _node.y = node.y
                    _node.resize(node.width, node.height)
                    console.log('rect', _node)
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
