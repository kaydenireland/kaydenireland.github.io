import fs from "fs";
import path from "path";
import { marked } from "marked";
import hljs from "highlight.js";

const contentDirectory = "./content/articles";
const outputDirectory = "./articles";
const templatePath = "./templates/article.html";
const articlesTemplatePath = "./templates/articles.html";
const aboutTemplatePath = "./templates/about.html";
const photosTemplatePath = "./templates/photos.html";
const projectsTemplatePath = "./templates/projects.html";

const headerPath = "./components/header.html";
const footerPath = "./components/footer.html";

const renderer = new marked.Renderer();

const copyIcon = `
<svg class="copy-icon" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2"
          fill="none"
          stroke="currentColor"
          stroke-width="2"/>
    <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
          fill="none"
          stroke="currentColor"
          stroke-width="2"/>
</svg>
`;

const checkIcon = `
<svg class="check-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12l4 4L19 6"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"/>
</svg>
`;

renderer.code = function ({ text, lang }) {
    text = text.replace(/^\n/, '').replace(/\n$/, '');

    const language = lang && hljs.getLanguage(lang)
        ? lang
        : null;

    let highlighted;

    if (language) {
        highlighted = hljs.highlight(text, {
            language: language
        }).value;
    } else {
        highlighted = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const languageLabel = language
        ? `<span class="code-language">${formatLanguageName(language)}</span>`
        : "";

    const languageClass = language
        ? ` class="hljs language-${language}"`
        : "";

    return `
<div class="code-block">
    <div class="code-header">
        ${languageLabel}

        <button class="copy-button"
                type="button"
                aria-label="Copy code">

            ${copyIcon}
            ${checkIcon}

        </button>
    </div>

    <pre><code${languageClass}>${highlighted}</code></pre>
</div>`;
};

function parseFrontMatter(markdown) {
    const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);

    if (!match) {
        throw new Error("Article is missing front matter");
    }

    const frontMatter = match[1];
    const content = match[2];

    const metadata = {};

    for (const line of frontMatter.split("\n")) {
        const [key, ...value] = line.split(":");

        metadata[key.trim()] = value.join(":").trim();
    }

    return {
        metadata,
        content
    };
}

function buildArticle(fileName, components) {
    const sourcePath = path.join(contentDirectory, fileName);

    const markdown = fs.readFileSync(sourcePath, "utf8");

    const article = parseFrontMatter(markdown);

    const htmlContent = marked(article.content, {
        renderer
    });

    let template = fs.readFileSync(templatePath, "utf8");

    template = template.replaceAll(
        "{{title}}",
        article.metadata.title
    );

    template = template.replaceAll(
        "{{date}}",
        formatDate(article.metadata.date)
    );

    template = template.replaceAll(
        "{{content}}",
        htmlContent
    );

    template = template.replaceAll(
        "{{header}}",
        components.header
    );

    template = template.replaceAll(
        "{{footer}}",
        components.footer
    );

    template = template.replaceAll(
        "{{root}}",
        "../"
    );

    const outputName = fileName.replace(/\.md$/, ".html");
    const outputPath = path.join(outputDirectory, outputName);

    fs.writeFileSync(outputPath, template);

    console.log(`Built ${outputPath}`);

    return {
        fileName,
        metadata: article.metadata
    };
}

function generateArticleRows(articles) {
    return articles.map(article => {
        const title = article.metadata.title;
        const date = formatDate(article.metadata.date);
        const fileName = article.fileName.replace(/\.md$/, ".html");

        return `
            <tr>
                <td>
                    <span class="post-date">${date}</span>
                </td>
                <td>
                    <a class="post-link" href="articles/${fileName}">
                        ${title}
                    </a>
                </td>
            </tr>
`;
    }).join("\n");
}

function formatDate(dateString) {
    const date = new Date(dateString + "T00:00:00");

    const year = date.getFullYear();
    const month = date.toLocaleDateString("en-US", {
        month: "short"
    });
    const day = date.getDate();

    return `${year} ${month} ${day}`;
}

function buildAboutPage(articles, components) {
    let template = fs.readFileSync(aboutTemplatePath, "utf8");


    template = template.replaceAll(
        "{{header}}",
        components.header
    );

    template = template.replaceAll(
        "{{footer}}",
        components.footer
    );

    template = template.replaceAll(
        "{{root}}",
        ""
    );

    fs.writeFileSync("about.html", template);

    console.log("Built about.html");
}

function buildArticlesPage(articles, components) {
    let template = fs.readFileSync(articlesTemplatePath, "utf8");

    template = template.replace(
        "{{articles}}",
        generateArticleRows(articles)
    );

    template = template.replaceAll(
        "{{header}}",
        components.header
    );

    template = template.replaceAll(
        "{{footer}}",
        components.footer
    );

    template = template.replaceAll(
        "{{root}}",
        ""
    );

    fs.writeFileSync("articles.html", template);

    console.log("Built articles.html");
}

function buildPhotosPage(articles, components) {
    let template = fs.readFileSync(photosTemplatePath, "utf8");


    template = template.replaceAll(
        "{{header}}",
        components.header
    );

    template = template.replaceAll(
        "{{footer}}",
        components.footer
    );

    template = template.replaceAll(
        "{{root}}",
        ""
    );

    fs.writeFileSync("photos.html", template);

    console.log("Built photos.html");
}

function buildProjectsPage(articles, components) {
    let template = fs.readFileSync(projectsTemplatePath, "utf8");


    template = template.replaceAll(
        "{{header}}",
        components.header
    );

    template = template.replaceAll(
        "{{footer}}",
        components.footer
    );

    template = template.replaceAll(
        "{{root}}",
        ""
    );

    fs.writeFileSync("projects.html", template);

    console.log("Built projects.html");
}


function build() {
    fs.mkdirSync(outputDirectory, { recursive: true });

    const components = loadComponents();

    const files = fs.readdirSync(contentDirectory);

    const articles = [];

    for (const file of files) {
        if (file.endsWith(".md")) {
            articles.push(
                buildArticle(file, components)
            );
        }
    }

    articles.sort((a, b) => {
        return new Date(b.metadata.date) -
            new Date(a.metadata.date);
    });

    buildAboutPage(articles, components);
    buildArticlesPage(articles, components);
    buildPhotosPage(articles, components);
    buildProjectsPage(articles, components);
}

function loadComponents() {
    return {
        header: fs.readFileSync(headerPath, "utf8"),
        footer: fs.readFileSync(footerPath, "utf8")
    };
}

function formatLanguageName(language) {
    const names = {
        javascript: "JavaScript",
        typescript: "TypeScript",
        java: "Java",
        kotlin: "Kotlin",
        rust: "Rust",
        python: "Python",
        csharp: "C#",
        cpp: "C++",
        c: "C",
        html: "HTML",
        css: "CSS",
        json: "JSON",
        bash: "Bash",
        shell: "Shell",
        sql: "SQL",
        ohl: "Ohl"
    };

    return names[language] ?? language;
}

build();