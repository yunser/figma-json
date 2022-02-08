const text = 'Line1\nLine223'

const list = [
    {
        "text": "L",
        "font": {
            "family": "zcool-gdh",
            "style": "Regular"
        },
        "fontSize": 18,
        "color": "#000000"
    },
    {
        "text": "i",
        "font": {
            "family": "zcool-gdh",
            "style": "Regular"
        },
        "fontSize": 18,
        "color": "#000000"
    },
    {
        "text": "n",
        "font": {
            "family": "zcool-gdh",
            "style": "Regular"
        },
        "fontSize": 18,
        "color": "#000000"
    },
    {
        "text": "e",
        "font": {
            "family": "zcool-gdh",
            "style": "Regular"
        },
        "fontSize": 18,
        "color": "#000000"
    },
    {
        "text": "1",
        "font": {
            "family": "zcool-gdh",
            "style": "Regular"
        },
        "fontSize": 18,
        "color": "#000000"
    },
    {
        "text": "\n",
        "font": {
            "family": "zcool-gdh",
            "style": "Regular"
        },
        "fontSize": 18,
        "color": "#000000"
    },
    {
        "text": "L",
        "font": {
            "family": "zcool-gdh",
            "style": "Regular"
        },
        "fontSize": 18,
        "color": "#000000"
    },
    {
        "text": "i",
        "font": {
            "family": "zcool-gdh",
            "style": "Regular"
        },
        "fontSize": 18,
        "color": "#000000"
    },
    {
        "text": "n",
        "font": {
            "family": "zcool-gdh",
            "style": "Regular"
        },
        "fontSize": 18,
        "color": "#000000"
    },
    {
        "text": "e",
        "font": {
            "family": "zcool-gdh",
            "style": "Regular"
        },
        "fontSize": 18,
        "color": "#000000"
    },
    {
        "text": "2",
        "font": {
            "family": "ZCOOL KuaiLe",
            "style": "Regular"
        },
        "fontSize": 24,
        "color": "#ff0000"
    },
    {
        "text": "2",
        "font": {
            "family": "ZCOOL KuaiLe",
            "style": "Regular"
        },
        "fontSize": 24,
        "color": "#ff0000"
    },
    {
        "text": "3",
        "font": {
            "family": "zcool-gdh",
            "style": "Regular"
        },
        "fontSize": 18,
        "color": "#000000"
    }
]

function isSame(item, lastItem) {
    return item.fontSize == lastItem.fontSize
        && item.color == lastItem.color
        && item.font.family == lastItem.font.family
        && item.font.style == lastItem.font.style
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
                console.log('相同')
            }
            else {
                console.log('不同')
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

const styles = mergeStyles(list)
console.log('styles', styles)
