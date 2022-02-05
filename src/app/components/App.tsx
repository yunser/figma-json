import * as React from 'react';
import '../styles/ui.css';

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

    React.useEffect(() => {
        // This is how we read messages sent from the plugin controller
        window.onmessage = (event) => {
            const {type, message} = event.data.pluginMessage;
            if (type === 'create-rectangles') {
                console.log(`Figma Says: ${message}`);
            }
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
        </div>
    );
};

export default App;
