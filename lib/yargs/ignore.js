const ignoreList = [
    'completion'
]

const isIgnored = (cmd) => {
    return !cmd || ignoreList.find(i=>i===cmd);
};
module.exports = {
    isIgnored
}