function contentsSplit(contentsBundle, cnt) {
    const result = [];

    for (let i = 0; i < contentsBundle.length; i += cnt) {
        const split = contentsBundle.slice(i, i + cnt);
        result.push(split);
    }

    return result;
}

module.exports = contentsSplit;