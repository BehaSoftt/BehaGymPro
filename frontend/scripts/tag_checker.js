const fs = require('fs');

const content = fs.readFileSync('src/views/Settings.vue', 'utf8');
const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
if (!templateMatch) {
    console.error('No template found!');
    process.exit(1);
}

const template = templateMatch[1];
const regex = /<\/?([a-zA-Z0-9-]+)[^>]*>/g;

const stack = [];
let match;
let currentLine = 1;
// Adjust the currentLine based on <template> starting line. Usually 1.

while ((match = regex.exec(template)) !== null) {
    const tagStr = match[0];
    const tagName = match[1].toLowerCase();

    // Ignore non-divs to simplify if the error is only about div.
    // Actually, Vue template might complain if any tag is missing its end. Wait, "Element is missing end tag".
    if (tagStr.endsWith('/>') || ['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tagName)) {
        continue;
    }

    // Calculate line number up to this match
    currentLine = template.substring(0, match.index).split('\n').length;

    if (tagStr.startsWith('</')) {
        if (stack.length === 0) {
            console.error(`Extra ${tagStr} at line ${currentLine}`);
        } else {
            const popped = stack.pop();
            if (popped.tagName !== tagName) {
                console.error(`Mismatch at line ${currentLine}: Expected </${popped.tagName}> (from line ${popped.line}), but found ${tagStr}`);
                stack.push(popped); // Push it back? No, just note the error.
            }
        }
    } else {
        stack.push({ tagName, line: currentLine, tagStr });
    }
}

console.log(`Unclosed tags: ${stack.length}`);
stack.forEach(unclosed => {
    console.log(`Unclosed <${unclosed.tagName}> (started at line ${unclosed.line})`);
});
