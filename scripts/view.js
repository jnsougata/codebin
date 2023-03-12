var editor = ace.edit("main")
editor.setReadOnly(true)
let sidebar = document.querySelector(".sidebar")
let editorMode = document.querySelector("#editor-mode")
let previouslyClickedItem = null
const primaryBlue = "#1c4ce4"

editor.setOptions({
    fontSize: "15pt",
    copyWithEmptySelection: true,
    showPrintMargin: false,
})
editor.setTheme("ace/theme/one_dark");

function resolveIconSource(mode) {
    let srcName = mode.split("/")[2].toLowerCase()
    return `/modes/${srcName}.png`
}

function updateLangMode(mode) {
    editorMode.innerHTML = `<i class="fa-solid fa-code-commit"></i> ${modeToLabel(mode).toUpperCase()}`;
}

function modeToIcon(mode) {
    return `/modes/${mode.toLowerCase()}.png`
}

function modeToLabel(mode) {
    return String(mode).split("/")[2]
}

function newFile(file) {
    let sidebarItem = document.createElement("div")
    sidebarItem.className = "item"
    sidebarItem.id = `item-${file.id}`;
    sidebarItem.addEventListener("click", () => {
        if (previouslyClickedItem) {
            previouslyClickedItem.style.border = "none"
        }
        previouslyClickedItem = sidebarItem
        previouslyClickedItem.style.backgroundColor = `1px solid rgba(245, 222, 179, 0.095)`
        globalContextFile = file
        editor.session.setMode(file.mode)
        updateLangMode(file.mode)
        editor.setValue(file.value)
    })
    let icon = document.createElement("img")
    icon.src = modeToIcon(modeToLabel(file.mode))
    let name = document.createElement("p")
    name.innerHTML = file.name
    let share = document.createElement("i")
    share.className = "fa-solid fa-paper-plane"
    share.addEventListener("click", (e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(`${window.location.origin}/file/${file.id}`)
        showToast("File Link copied to clipboard", toastGreen)
    })
    sidebarItem.appendChild(icon)
    sidebarItem.appendChild(name)
    sidebarItem.appendChild(share)
    return sidebarItem
}

function showCode(code) {
    fetch(`/api/bins/${code}`)
    .then((response) => response.json())
    .then((data) => {
        if (data.length === 0) {
            showToast("File not found :(", toastRed)
            setTimeout(() => {
                window.location.href = "/"
            }, 3000)
            return
        }
        data.forEach((info) => {
            sidebar.appendChild(newFile(info))
        })
        sidebar.children[0].click()
    })
}

window.onload = () => {
    let code = window.location.pathname.replace("/", "")
    let title = document.getElementsByTagName("title")[0]
    title.innerHTML = `Bin | ${code}`
    showCode(code)
    themeButton.innerHTML = "<i class='fas fa-palette'></i> One Dark"
}

let copyCodeButton = document.getElementById("copy")
copyCodeButton.addEventListener("click", function() {
    text = editor.getValue()
    navigator.clipboard.writeText(text)
    .then(function() {
        showToast("Snippet copied to clipboard", toastGreen)
    })
})

themeCounter = 0
let themeButton = document.getElementById("editor-theme")
themeButton.addEventListener("click", function() {
    var themes = ace.require("ace/ext/themelist").themes
    themes.reverse()
    let th = themes[themeCounter].theme
    editor.setTheme(th)
    if (themeCounter == themes.length - 1) {
        themeCounter = 0
    } else {
        themeCounter++
    }
    themeButton.innerHTML = themes[themeCounter].caption
})

let toast = document.querySelector(".toast")
const toastGreen = "#27ab5a"
const toastRed = "#c32c59"
function showToast(innerText, color="#1c4ce4") {
    toast.innerHTML = `<p>${innerText}</p>`
    toast.style.backgroundColor = color
    toast.style.display = "flex"
    setTimeout(function() {
        toast.style.display = "none"
    }, 3000)
}
