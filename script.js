document.addEventListener('DOMContentLoaded', function () {
    ClassicEditor
        .create(document.querySelector('#editor'), { // Underline, Strikethrough und codeBlock werden noch nicht gerendert, weil ein Plugin fehlt. Kp wie man das lädt
            toolbar: ['bold', 'italic', 'underline', 'strikethrough', '|', 'bulletedList', 'numberedList', '|', 'link', 'blockQuote', 'codeBlock', '|', 'heading'],
            placeholder: 'Type your text here...',
            typing: {
                transformations: {
                    remove: [
                        'quotes',
                        'typography'
                    ]
                }
            }
        })
        .then(editor => {
            editor.model.document.on('change:data', () => {
                updateOutput(editor.getData());
            });
        })
        .catch(error => {
            console.error(error);
        });

    document.getElementById('copyButton').addEventListener('click', function () {
        copyToClipboard(document.getElementById('output').textContent);
    });

    function updateOutput(html) {
        const output = document.getElementById('output');
        output.textContent = convertHtmlToMarkdown(html);
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function () {
            const copyButton = document.getElementById('copyButton');
            copyButton.textContent = 'Copied!';
            copyButton.style.backgroundColor = '#3ba55d';

            setTimeout(function () {
                copyButton.textContent = 'Copy';
                copyButton.style.backgroundColor = '#4f545c';
            }, 1500);
        });
    }

    function escapeMarkdown(text) {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/#/g, '\\#')
            .replace(/\*/g, '\\*')
            .replace(/_/g, '\\_')
            .replace(/~/g, '\\~')
            .replace(/-/g, '\\-')
            .replace(/>/g, '\\>')
            .replace(/`/g, '\\`');
    }

    function processList(html, indentLevel) {
        let counter = 0;
        return html
            .replace(/<ul>(.*?)<\/ul>/gs, (_, p1) => p1.replace(/<li>(.*?)<\/li>/gs, (_, p2) => `${' '.repeat(indentLevel)}- ${escapeMarkdown(p2)}\n`))
            .replace(/<ol>(.*?)<\/ol>/gs, (_, p1) => p1.replace(/<li>(.*?)<\/li>/gs, (_, p2) => `${' '.repeat(indentLevel)}${++counter}. ${escapeMarkdown(p2)}\n`));
    }

    function processBlockquote(html) {
        const lines = html.split(/<\/?p>/).filter(Boolean);
        if (lines.length > 1) {
            return '>>> ' + lines.map(line => `${escapeMarkdown(line)}`).join('\n');
        } else {
            return `> ${escapeMarkdown(lines[0])}`;
        }
    }

    function convertHtmlToMarkdown(html) {
        let markdown = html
            .replace(/&nbsp;/g, ' ')
            .replace(/<h1>(.*?)<\/h1>/g, (_, p1) => `# ${escapeMarkdown(p1)}\n`)
            .replace(/<h2>(.*?)<\/h2>/g, (_, p1) => `# ${escapeMarkdown(p1)}\n`)
            .replace(/<h3>(.*?)<\/h3>/g, (_, p1) => `## ${escapeMarkdown(p1)}\n`)
            .replace(/<h4>(.*?)<\/h4>/g, (_, p1) => `### ${escapeMarkdown(p1)}\n`)
            .replace(/<b>(.*?)<\/b>/g, (_, p1) => `**${escapeMarkdown(p1)}**`)
            .replace(/<strong>(.*?)<\/strong>/g, (_, p1) => `**${escapeMarkdown(p1)}**`)
            .replace(/<i>(.*?)<\/i>/g, (_, p1) => `*${escapeMarkdown(p1)}*`)
            .replace(/<em>(.*?)<\/em>/g, (_, p1) => `*${escapeMarkdown(p1)}*`)
            .replace(/<u>(.*?)<\/u>/g, (_, p1) => `__${escapeMarkdown(p1)}__`)
            .replace(/<strike>(.*?)<\/strike>/g, (_, p1) => `~~${escapeMarkdown(p1)}~~`)
            .replace(/<ul>(.*?)<\/ul>/gs, (_, p1) => processList(`<ul>${p1}</ul>`, 0))
            .replace(/<ol>(.*?)<\/ol>/gs, (_, p1) => processList(`<ol>${p1}</ol>`, 0))
            .replace(/<blockquote>(.*?)<\/blockquote>/gs, (_, p1) => processBlockquote(p1))
            .replace(/<pre><code>(.*?)<\/code><\/pre>/gs, (_, p1) => `\`\`\`\n${escapeMarkdown(p1)}\n\`\`\``)
            .replace(/<code>(.*?)<\/code>/g, (_, p1) => `\`${escapeMarkdown(p1)}\``)
            .replace(/<a href="(.*?)">(.*?)<\/a>/g, (_, p1, p2) => `[${escapeMarkdown(p2)}](${p1})`)
            .replace(/<br>/g, '\n')
            .replace(/<\/div>/g, '\n')
            .replace(/<div>/g, '')
            .replace(/<\/p>/g, '\n')
            .replace(/<p>/g, '');

        return markdown.trim();
    }
});