import * as React from 'react';
import '../styles/ui.css';
import { sketchToBlob } from '@yunser/sketch-lib'
// import { StdUI } from '@yunser/ui-std'

// import { }
// const { sketchToBlob } = require('@yunser/sketch-lib')

// const root = JSON5.parse(fs.readFileSync('root.json5', 'utf8'))

// async function main() {
    
// }



declare function require(path: string): any;

const App = ({}) => {
    const textbox = React.useRef<HTMLInputElement>(undefined);

    // const countRef = React.useCallback((element: HTMLInputElement) => {
    //     if (element) element.value = '5';
    //     textbox.current = element;
    // }, []);

    const onCreate = () => {
        // const count = parseInt(textbox.current.value, 10);
        parent.postMessage({pluginMessage: {type: 'create-element', count: 0}}, '*');
    }

    function toJson() {
        parent.postMessage({ pluginMessage: { type: 'create-json', count: 0 } }, '*');
    }

    const onCancel = () => {
        parent.postMessage({pluginMessage: {type: 'cancel'}}, '*');
    };

    async function gen() {
        const root = { "_type": "root", "width": 3200, "height": 3200, "color": "#E6E6FB", "_children": [{ "_type": "rect", "x": 100, "y": 100, "width": 100, "height": 100, "color": null, "border": { "color": "#526BFF", "width": 20 } }, { "_type": "circle", "cx": 250, "cy": 150, "radius": 50, "color": null, "fill": { "type": "linearGradient", "direction": "bottom", "colors": ["#09c", "#c90"] }, "border": { "color": "#526BFF", "width": 4 } }, { "_type": "line", "x1": 100, "y1": 200, "x2": 200, "y2": 300, "border": { "color": "#526BFF", "width": 8 } }, { "_type": "text", "x": 100, "y": 0, "text": "你好", "textSize": 100, "color": "#f00", "border": { "color": "#526BFF", "width": 4 }, "fill": { "type": "linearGradient", "direction": "bottom", "colors": ["#09c", "#c90"] } }, { "_type": "polygon", "points": [{ "x": 50, "y": 100 }, { "x": 0, "y": 200 }, { "x": 100, "y": 200 }], "color": "#E56D6D", "border": { "color": "#526BFF", "width": 16 }, "fill": { "type": "linearGradient", "direction": "bottom", "colors": ["#09c", "#c90"] } }, { "_type": "polyline", "points": [{ "x": 0, "y": 100 }, { "x": 50, "y": 0 }, { "x": 100, "y": 100 }], "border": { "color": "#526BFF", "width": 8 } }, { "_type": "ellipse", "cx": 500, "cy": 50, "rx": 100, "ry": 50, "color": "#E56D6D", "border": { "color": "#526BFF", "width": 16 }, "fill": { "type": "linearGradient", "direction": "bottom", "colors": ["#09c", "#c90"] }, "opacity": 0.5, "shadow": { "x": 5, "y": 5, "blur": 10, "alpha": 0.2 } }, { "_type": "path", "d": "M200,200.490196 L199.509804,300 C212.323108,269.060446 229.153174,253.590669 250,253.590669 C270.846826,253.590669 287.513493,268.897047 300,299.509804 L300,200 L200,200.490196 Z", "color": "#E56D6D", "border": { "color": "#526BFF", "width": 16 }, "fill": { "type": "linearGradient", "direction": "bottom", "colors": ["#09c", "#c90"] } }, { "_type": "path", "d": "M 453.5808 26.310371130455636  L 453.5808 311.7374996391603 ", "color": "#f00", "border": { "color": "#09c", "width": 16 } }, { "_type": "image", "x": 300, "y": 0, "width": 100, "height": 100, "href": "data:image/png;base64,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", "border": { "color": "#526BFF", "width": 4 }, "borderRadius": 16 }, { "_type": "rect", "x": 300, "y": 100, "width": 100, "height": 100, "color": "#09c", "fill": { "type": "linearGradient", "direction": 45, "stops": [{ "color": "#f00", "position": 0 }, { "color": "#09c", "position": 0.75 }, { "color": "#000", "position": 1 }] }, "borderRadius": 16 }, { "_type": "rect", "x": 300, "y": 200, "width": 100, "height": 100, "color": "#f00", "shadow": { "x": 5, "y": 5, "blur": 10, "spread": 10, "color": "#09c", "alpha": 0.2 }, "opacity": 0.5 }, { "_type": "text", "x": 400, "y": 300, "text": "centerd", "textSize": 20, "color": "#f00", "centerd": true, "backgroundColor": "#09c" }, { "_type": "rect", "x": 300, "y": 400, "width": 100, "height": 100, "color": "#09c" }, { "_type": "rect", "x": 600, "y": 0, "width": 100, "height": 100, "border": { "color": "#000", "width": 1 }, "_svgProps": { "stroke-dasharray": "10" } }, { "_type": "rect", "x": 700, "y": 100, "width": 100, "height": 100, "border": { "color": "#000", "width": 1, "dashed": [10, 20] } }, { "_type": "text", "x": 700, "y": 200, "width": 100, "height": 100, "text": "text", "lineHeight": 140, "color": "#f00", "fontStyle": { "underline": true, "bold": true, "italic": true }, "align": "center", "vAlign": "center" }, { "_type": "path", "d": "M 600 100 L 700 200", "border": { "color": "#526BFF", "width": 2 }, "arrow": { "start": true, "end": true } }, { "_type": "path", "d": "M 600 200 L 700 300", "border": { "color": "#526BFF", "width": 10 }, "arrow": { "start": true, "end": true } }, { "_type": "path", "d": "M 600 300 L 700 400", "border": { "color": "#526BFF", "width": 2 }, "arrow": { "start": "dashedArrow", "end": "dashedArrow" } }, { "_type": "ellipse", "cx": 350, "cy": 750, "rx": 50, "ry": 25, "color": "#09c", "rotate": 45 }, { "_type": "group", "_children": [{ "_type": "line", "x1": 100, "y1": 400, "x2": 100, "y2": 3200, "border": { "color": "#000", "width": 1 } }, { "_type": "line", "x1": 200, "y1": 400, "x2": 200, "y2": 3200, "border": { "color": "#000", "width": 1 } }, { "_type": "rect", "x": 100, "y": 400, "width": 100, "height": 100, "color": "#fff", "border": { "color": "#f00", "width": 20, "position": "inside" } }, { "_type": "rect", "x": 100, "y": 525, "width": 100, "height": 100, "color": "#fff", "border": { "color": "#09c", "width": 20, "position": "center" } }, { "_type": "rect", "x": 100, "y": 650, "width": 100, "height": 100, "color": "#fff", "border": { "color": "#f00", "width": 20, "position": "outside" } }, { "_type": "circle", "cx": 150, "cy": 850, "radius": 50, "color": "#fff", "border": { "color": "#f00", "width": 20, "position": "inside" } }, { "_type": "circle", "cx": 150, "cy": 950, "radius": 50, "color": "#fff", "border": { "color": "#f00", "width": 20, "position": "center" } }, { "_type": "circle", "cx": 150, "cy": 1050, "radius": 50, "color": "#fff", "border": { "color": "#f00", "width": 20, "position": "outside" } }, { "_type": "path", "d": "M100,1200 L200,1200 L100,1300 Z", "color": "#fff", "border": { "color": "#f00", "width": 20, "position": "inside" } }, { "_type": "path", "d": "M100,1300 L200,1300 L100,1400 Z", "color": "#fff", "border": { "color": "#f00", "width": 20, "position": "center" } }, { "_type": "path", "d": "M100,1400 L200,1400 L100,1500 Z", "color": "#fff", "border": { "color": "#f00", "width": 20, "position": "outside" } }] }, { "_type": "rect", "x": 700, "y": 0, "width": 100, "height": 100, "color": "#000", "_svgProps": { "data-id": "xxx" }, "visible": false }, { "_type": "group", "_children": [{ "_type": "rect", "x": 1000, "y": 0, "width": 100, "height": 100, "color": "#f00", "border": { "color": "#09c", "width": 8 } }] }, { "_type": "group", "_children": [{ "_type": "rect", "x": 1000, "y": 100, "width": 100, "height": 100, "fill": { "type": "linearGradient", "direction": 0, "stops": [{ "color": "#f00", "position": 0 }, { "color": "#09c", "position": 1 }] } }, { "_type": "rect", "x": 1100, "y": 100, "width": 100, "height": 100, "fill": { "type": "linearGradient", "direction": 90, "stops": [{ "color": "#f00", "position": 0 }, { "color": "#09c", "position": 1 }] } }, { "_type": "rect", "x": 1200, "y": 100, "width": 100, "height": 100, "fill": { "type": "linearGradient", "direction": 180, "stops": [{ "color": "#f00", "position": 0 }, { "color": "#09c", "position": 1 }] } }, { "_type": "rect", "x": 1300, "y": 100, "width": 100, "height": 100, "fill": { "type": "linearGradient", "direction": -90, "stops": [{ "color": "#f00", "position": 0 }, { "color": "#09c", "position": 1 }] } }, { "_type": "rect", "x": 1400, "y": 100, "width": 100, "height": 100, "fill": { "type": "linearGradient", "from": { "x": 0.5, "y": 0.5 }, "to": { "x": 0.5, "y": 1 }, "direction": 0, "stops": [{ "color": "#f00", "position": 0 }, { "color": "#09c", "position": 1 }] } }] }, { "_type": "group", "_children": [{ "_type": "rect", "x": 1000, "y": 200, "width": 100, "height": 100, "color": "#f00", "shadow": { "x": 5, "y": 5, "blur": 10, "spread": 10, "color": "#09c", "alpha": 0.2 } }, { "_type": "rect", "x": 1200, "y": 300, "width": 100, "height": 100, "color": "#fff", "innerShadow": { "x": 10, "y": 10, "blur": 20, "spread": 0, "color": "#f00", "alpha": 0.8 } }] }, { "_type": "group", "_children": [{ "_type": "rect", "x": 1000, "y": 800, "width": 100, "height": 100, "color": "#f00", "blur": 20 }, { "_type": "rect", "x": 1200, "y": 800, "width": 100, "height": 100, "color": "#f00", "blur": 40 }, { "_type": "rect", "x": 1400, "y": 800, "width": 100, "height": 100, "color": "#f00", "blur": 60 }, { "_type": "rect", "x": 1600, "y": 800, "width": 100, "height": 100, "color": "#f00", "blur": 80 }, { "_type": "rect", "x": 1800, "y": 800, "width": 100, "height": 100, "color": "#f00", "blur": 100 }] }, { "_type": "group", "_children": [{ "_type": "text", "x": 0, "y": 300, "text": "zhxanku高端黑", "textSize": 100, "lineHeight": 100, "color": "#f00", "fontFamily": "PingFangSC-Regular, PingFang SC", "_svgStyle": { "text-decoration": "underline", "cursor": "pointer" } }, { "_type": "line", "x1": 0, "y1": 512.8, "x2": 800, "y2": 512.8, "border": { "color": "#f00", "width": 1 } }, { "_type": "text", "x": 0, "y": 600, "width": 600, "height": 100, "text": "centerd", "textSize": 80, "lineHeight": 140, "color": "#f00", "align": "center", "vAlign": "center" }, { "_type": "rect", "x": 1000, "y": 400, "width": 400, "height": 400, "color": "#fff" }, { "_type": "line", "x1": 1000, "y1": 450, "x2": 2000, "y2": 450, "border": { "color": "#000", "width": 1 } }, { "_type": "text", "x": 1000, "y": 400, "text": "xFirstLine\nSecond Line", "textSize": 40, "lineHeight": 56, "color": "#f00", "rich": [[{ "text": "一前" }, { "text": "一后" }], [{ "text": "二前" }, { "text": "二中", "_svgStyle": { "font-size": "16px", "font-family": "PingFangSC-Semibold" }, "_svgProps": { "fill": "#09c" } }, { "text": "二后" }]] }] }] }

        // let stdUi = new StdUI({
        //     root,
        // })

        // const svg = stdUi.toSvg({
        //     borderPosition: 'center',
        // })
        // console.log('svg', svg)

        // fs.writeFileSync('output/ui.svg', ), 'utf8')

        // const num = 2 ** 3
        // console.log('num', num)
        console.log('gen.start')
        const { blob } = await sketchToBlob(root)
        console.log('gen.blob', blob)

        const blobURL = window.URL.createObjectURL(blob)
        console.log('gen.blobURL')
        const link = document.createElement('a');
        link.className = 'button button--primary';
        link.href = blobURL;
        link.download = "sketch-export.sketch"
        link.click()
        link.setAttribute('download', name + '.zip');
        console.log('gen.ok')
        // resolve();

        // fs.writeFileSync("output/ui.sketch", blob, "utf-8");//将打包的内容写入 当前目录下的 re
    }

    React.useEffect(() => {
        // This is how we read messages sent from the plugin controller
        window.onmessage = (event) => {
            console.log('window.onmessage', event.data)
            // const {type, message} = event.data.pluginMessage;
            // if (type === 'create-rectangles') {
            //     console.log(`Figma Says: ${message}`);
            // }
        };
    }, []);

    return (
        <div>
            <img src={require('../assets/logo.svg')} />
            <h2>UI Creator v0.0.1-1</h2>
            {/* <p>
                Count: <input ref={countRef} />
            </p> */}
            <button id="create" onClick={onCreate}>
                Ad Element
            </button>
            <button onClick={toJson}>
                to JSON
            </button>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={gen}>Export Sketch</button>
        </div>
    );
};

export default App;
