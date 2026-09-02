import fs from "fs";
import path from "path";
import { marked } from "marked";
import hljs from "highlight.js";
import YAML from "yaml";

const articleContentDirectory = "./content/articles";
const articleOutputDirectory = "./articles";
const projectContentDirectory = "./content/projects";
const photoContentDirectory = "./content/photos";
const photoOutputDirectory = "./photos";

const articleTemplatePath = "./templates/article.html";
const articlesTemplatePath = "./templates/articles.html";
const aboutTemplatePath = "./templates/about.html";
const photosTemplatePath = "./templates/photos.html";
const projectsTemplatePath = "./templates/projects.html";
const photoTemplatePath = "./templates/album.html";

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
    const match = markdown.match(
        /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
    );

    if (!match) {
        throw new Error("Markdown file is missing front matter");
    }

    const frontMatter = match[1];
    const content = match[2];

    const metadata = YAML.parse(frontMatter);

    return {
        metadata,
        content
    };
}

function buildArticle(fileName, components) {
    const sourcePath = path.join(articleContentDirectory, fileName);

    const markdown = fs.readFileSync(sourcePath, "utf8");

    const article = parseFrontMatter(markdown);

    const htmlContent = marked(article.content, {
        renderer
    });

    let template = fs.readFileSync(articleTemplatePath, "utf8");

    template = template.replaceAll(
        "{{title}}",
        article.metadata.title
    );

    template = template.replaceAll(
        "{{date}}",
        formatDate(article.metadata.date)
    );

    template = template.replaceAll(
        "{{tags}}",
        article.metadata.tags
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
    const outputPath = path.join(articleOutputDirectory, outputName);

    fs.writeFileSync(outputPath, template);

    console.log(`Built ${outputPath}`);

    return {
        fileName,
        metadata: article.metadata
    };
}

function buildProject(fileName) {
    const sourcePath = path.join(projectContentDirectory, fileName);

    const markdown = fs.readFileSync(sourcePath, "utf8");

    const project = parseFrontMatter(markdown);

    const htmlContent = marked(project.content, {
        renderer
    });

    console.log(`Loaded project ${fileName}`);

    return {
        fileName,
        metadata: project.metadata,
        content: htmlContent
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

function generateProjectTables(projects) {
    return projects.map((project, index) => {
        const title = project.metadata.title;
        const link = project.metadata.link;
        const description = project.metadata.description;
        const thumbnail = project.metadata.thumbnail;
        const content = project.content;
        const tags = project.metadata.tags;

        const separator = index < projects.length - 1 ? ` <hr><br> ` : "";

        const descriptionCell = `
            <td>
                <p>${description}</p>
                <p>${content}</p>
            </td>
        `;

        const imageCell = `
            <td>
                <a href="${link}">
                    <img class="thumbnail" src="${thumbnail}">
                </a>
            </td>
        `;

        return `
            <center>
                <a class="project-title" href="${link}">
                    ${title}
                </a>
            </center>
            <center><span class="post-tags"># ${tags}</span></center>

            <table class="project-table">
                <tbody>
                    <tr>
                        ${index % 2 === 0 ? descriptionCell + '<td class="separator"></td>' + imageCell : imageCell + '<td class="separator"></td>' + descriptionCell}
                    </tr>
                </tbody>
            </table>

            ${separator}
        `;
    }).join("\n");
}

function generatePhotoTable(photos, albumDirectory) {
    photos.sort((a, b) => a.localeCompare(b));

    let html = `
        <table class="photos-table">
            <tbody>
    `;

    for (let i = 0; i < photos.length; i += 2) {
        html += `
            <tr>
        `;

        for (let j = 0; j < 2; j++) {
            const index = i + j;

            if (index < photos.length) {
                const photo = photos[index];

                html += `
                    <td>
                        <a href="../media/photos/${albumDirectory}/${photo}">
                            <img class="photo"
                                 src="../media/photos/${albumDirectory}/${photo}"
                                 alt="${photo}">
                        </a>
                    </td>
                `;
            } else {
                html += `
                    <td></td>
                `;
            }
        }

        html += `
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
    `;

    return html;
}

function generateAlbumRows(albums) {
    return albums.map((album, index) => {
        const title = album.metadata.title;
        const thumbnail = album.metadata.thumbnail;
        const directory = album.directory;

        const image = `
            <a href="photos/${directory}.html">
                <img class="thumbnail" src="media/photos/${directory}/${thumbnail}">
            </a>
        `;

        const titleCell = `
            <td class="album-title">
                <a class="post-link"
                   href="photos/${directory}.html">
                    ${title}
                </a>
            </td>
        `;

        const imageCell = `
            <td class="album-image">
                ${image}
            </td>
        `;

        const emptyCell = `
            <td class="album-empty"></td>
        `;

        const separator = index < albums.length - 1 ? `<tr><td colspan="3"><hr></td></tr>` : "";

        return `
            <tr>
                ${index % 2 === 0 ? imageCell + titleCell + emptyCell : emptyCell + titleCell + imageCell}
            </tr>

            ${separator}
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

function buildAboutPage(components) {
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

function buildProjectsPage(projects, components) {
    let template = fs.readFileSync(projectsTemplatePath, "utf8");


    template = template.replaceAll(
        "{{projects}}",
        generateProjectTables(projects)
    );

    template = template.replaceAll(
        "{{header}}",
        components.header
    );

    template = template.replaceAll(
        "{{tags}}",
        components.tags
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
        haskell: "Haskell",
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

function buildPhotoAlbum(fileName, components) {
    const sourcePath = path.join(
        photoContentDirectory,
        fileName
    );

    const markdown = fs.readFileSync(
        sourcePath,
        "utf8"
    );

    const album = parseFrontMatter(markdown);

    const albumDirectory = fileName.replace(
        /\.md$/,
        ""
    );

    const imageDirectory = path.join(
        "./media/photos",
        albumDirectory
    );

    const photos = fs.readdirSync(imageDirectory)
        .filter(file =>
            /\.(jpg|jpeg|png|webp)$/i.test(file)
        );

    const htmlContent = marked(album.content, {
        renderer
    });

    let template = fs.readFileSync(
        photoTemplatePath,
        "utf8"
    );

    template = template.replaceAll(
        "{{title}}",
        album.metadata.title
    );

    template = template.replaceAll(
        "{{date}}",
        formatDate(album.metadata.date)
    );

    template = template.replaceAll(
        "{{location}}",
        album.metadata.location
    );

    template = template.replaceAll(
        "{{content}}",
        htmlContent
    );

    template = template.replaceAll(
        "{{photos}}",
        generatePhotoTable(
            photos,
            albumDirectory
        )
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

    const outputPath = path.join(
        photoOutputDirectory,
        `${albumDirectory}.html`
    );

    fs.writeFileSync(
        outputPath,
        template
    );

    console.log(`Built ${outputPath}`);

    return {
        fileName,
        directory: albumDirectory,
        metadata: album.metadata
    };
}

function buildPhotosPage(albums, components) {
    let template = fs.readFileSync(
        photosTemplatePath,
        "utf8"
    );

    template = template.replace(
        "{{albums}}",
        generateAlbumRows(albums)
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

    fs.writeFileSync("photos.html", template);

    console.log("Built photos.html");
}

function build() {
    const components = loadComponents();

    // Articles
    fs.mkdirSync(articleOutputDirectory, { recursive: true });
    const articleFiles = fs.readdirSync(articleContentDirectory);
    const articles = [];
    for (const file of articleFiles) {
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

    // Projects
    const projectFiles = fs.readdirSync(projectContentDirectory);
    const projects = [];
    for (const file of projectFiles) {
        if (file.endsWith(".md")) {
            projects.push(
                buildProject(file)
            );
        }
    }

    // Photos
    fs.mkdirSync(photoOutputDirectory, { recursive: true });
    const photoFiles = fs.readdirSync(photoContentDirectory);
    const albums = [];
    for (const file of photoFiles) {
        if (file.endsWith(".md")) {
            albums.push(
                buildPhotoAlbum(file, components)
            );
        }
    }

    // Build
    buildAboutPage(components);
    buildArticlesPage(articles, components);
    buildPhotosPage(albums, components);
    buildProjectsPage(projects, components);
}

build();